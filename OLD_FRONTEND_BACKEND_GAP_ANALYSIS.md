# Difract Frontend - Analyse Backend / Frontend

> Comparaison entre l'API backend (Laravel 12) et l'implementation frontend (React Native / Expo).
> Derniere mise a jour : 25 fevrier 2026

---

## Table des matieres

1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#1-authentification)
3. [Utilisateurs / Profil](#2-utilisateurs--profil)
4. [Styles musicaux](#3-styles-musicaux)
5. [Evenements](#4-evenements)
6. [Votes](#5-votes)
7. [Artistes](#6-artistes)
8. [Medias](#7-medias)
9. [Liens sociaux](#8-liens-sociaux)
10. [Abonnements](#9-abonnements)
11. [Types TypeScript manquants](#10-types-typescript-manquants)
12. [Endpoints manquants](#11-endpoints-manquants)
13. [Resume des priorites](#12-resume-des-priorites)

---

## Vue d'ensemble

| Domaine | Service frontend | Statut | Priorite |
|---------|-----------------|--------|----------|
| Authentification | `auth.service.ts` | OK | - |
| Utilisateurs / Profil | `user.service.ts` | Endpoints incorrects | Haute |
| Styles musicaux | `styles.service.ts` | Partiel | Moyenne |
| Evenements | `events.service.ts` | Endpoints incorrects + types errones | Haute |
| Votes | `votes.service.ts` | Type manquant + champ `event_id` absent | Haute |
| Artistes | `artists.service.ts` | Endpoints incorrects (inventes) | Haute |
| Medias | *(aucun service dedie)* | Service manquant | Haute |
| Liens sociaux | *(aucun service dedie)* | Service manquant | Moyenne |
| Abonnements | `subscription.service.ts` | OK | - |

---

## 1. Authentification

**Service** : `services/auth/auth.service.ts`
**Statut** : OK

| Methode | Endpoint frontend | Endpoint backend | Statut |
|---------|------------------|------------------|--------|
| `register` | `POST /api/register` | `POST /api/register` | OK |
| `verifyEmail` | `POST /api/verify-email` | `POST /api/verify-email` | OK |
| `resendCode` | `POST /api/resend-code` | `POST /api/resend-code` | OK |
| `login` | `POST /api/login` | `POST /api/login` | OK |
| `logout` | `POST /api/logout` | `POST /api/logout` | OK |
| `me` | `GET /api/me` | `GET /api/me` | OK |

**Notes** :
- Le mapping `access_token` → `token` est correctement gere
- Le flux register → verify-email → login est bien implemente
- Le `register` pour un ARTIST devrait envoyer `primary_style_id` et `secondary_style_ids` (non envoyes actuellement)

---

## 2. Utilisateurs / Profil

**Service** : `services/user/user.service.ts`
**Statut** : Endpoints incorrects

| Methode | Endpoint frontend (actuel) | Endpoint backend (attendu) | Probleme |
|---------|---------------------------|---------------------------|----------|
| `getProfile` | `GET /api/users/profile` | `GET /api/me` | Endpoint inexistant cote backend |
| `updateProfile` | `PUT /api/users/profile` | `PUT /api/users/{userId}` | Endpoint inexistant |
| `uploadProfilePicture` | `POST /api/media/profile-picture` | `POST /api/media/profile-picture` | OK |
| `uploadTracks` | `POST /api/media/tracks` | `POST /api/media/tracks` | OK |
| `becomeArtist` | `POST /api/users/become-artist` | *(n'existe pas)* | Endpoint inexistant |
| `getMyVotes` | `GET /api/users/my-votes` | *(n'existe pas)* | Endpoint inexistant |
| `getReceivedVotes` | `GET /api/users/received-votes` | *(n'existe pas)* | Endpoint inexistant |

**Corrections necessaires** :
```
getProfile()     → utiliser GET /api/me (deja dans authService.me)
updateProfile()  → utiliser PUT /api/users/{userId} avec l'ID de l'utilisateur connecte
becomeArtist()   → a supprimer ou implementer cote backend
getMyVotes()     → utiliser GET /api/votes et filtrer par user_id
getReceivedVotes() → utiliser GET /api/votes et filtrer par artist_id
```

---

## 3. Styles musicaux

**Service** : `services/styles/styles.service.ts`
**Statut** : Partiel - fonctionnel mais incomplet

| Methode | Endpoint frontend | Endpoint backend | Statut |
|---------|------------------|------------------|--------|
| `getStyles` | `GET /api/styles` | `GET /api/styles` | OK |
| `getStyleById` | `GET /api/styles/{id}` | *(pas documente)* | A verifier |
| *(manquant)* | - | `GET /api/me/styles` | Manquant |
| *(manquant)* | - | `PUT /api/me/styles` | Manquant |
| *(manquant)* | - | `GET /api/artists/{userId}/styles` | Manquant |

**A ajouter** :
```typescript
// Dans styles.service.ts
getMyStyles()                    → GET /api/me/styles
updateMyStyles(data)             → PUT /api/me/styles
getArtistStyles(userId)          → GET /api/artists/{userId}/styles
```

---

## 4. Evenements

**Service** : `services/events/events.service.ts`
**Statut** : Endpoints corrects mais types errones

### Problemes de types

Le type `Event` frontend ne correspond pas au modele backend :

| Champ frontend | Champ backend | Probleme |
|---------------|--------------|----------|
| `name` | `title` | Nom de champ different |
| `date` | `event_date` | Nom de champ different |
| `description` | *(n'existe pas)* | Champ inexistant cote backend |
| `image_url` | *(n'existe pas)* | Champ inexistant (utiliser Media) |
| *(manquant)* | `price` | Champ non mappe |
| *(manquant)* | `status` | `DRAFT` / `PUBLISHED` / `DONE` non mappe |
| *(manquant)* | `voting_close_date` | Champ calcule non mappe |
| *(manquant)* | `voting_time_remaining` | Champ calcule non mappe |
| *(manquant)* | `is_voting_open` | Champ calcule non mappe |
| *(manquant)* | `styles` | Relation non mappee |
| *(manquant)* | `votes` | Relation non mappee |

### Type corrige

```typescript
export interface Event {
  id: number;
  title: string;                    // PAS "name"
  location: string;
  event_date: string;               // PAS "date"
  price?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'DONE';
  voting_close_date: string;        // Calcule par le backend
  voting_time_remaining: number;    // Secondes restantes
  is_voting_open: boolean;
  created_at: string;
  updated_at: string;
  artists?: Artist[];
  votes?: Vote[];
  styles?: MusicStyle[];
}
```

### Endpoints

| Methode | Endpoint frontend | Endpoint backend | Statut |
|---------|------------------|------------------|--------|
| `getAll` | `GET /api/events` | `GET /api/events` | OK (types a corriger) |
| `getById` | `GET /api/events/{id}` | `GET /api/events/{id}` | OK |
| `create` | `POST /api/events` | `POST /api/events` | OK (body a corriger) |
| `update` | `PUT /api/events/{id}` | `PUT /api/events/{id}` | OK |
| `delete` | `DELETE /api/events/{id}` | `DELETE /api/events/{id}` | OK |
| `getUpcoming` | `GET /api/events/upcoming` | *(n'existe pas)* | Endpoint inexistant |
| `getEventArtists` | `GET /api/events/{id}/artists` | `GET /api/events/{id}/artists` | OK |
| `addArtist` | `POST /api/events/{id}/artists` | `POST /api/artists/register` | Endpoint different |
| `removeArtist` | `DELETE /api/events/{id}/artists/{artistId}` | `POST /api/artists/unregister` | Endpoint different |

**Corrections necessaires** :
```
getUpcoming()    → a supprimer ou filtrer localement par event_date
addArtist()      → utiliser POST /api/artists/register { user_id, event_id }
removeArtist()   → utiliser POST /api/artists/unregister { user_id, event_id }
```

**Note** : `events.service.ts` n'utilise pas `ENDPOINTS` (les URLs sont en dur dans le code).

---

## 5. Votes

**Service** : `services/votes/votes.service.ts`
**Statut** : Type manquant + champ event_id absent

### Problemes

1. **`CreateVoteRequest`** est importe dans le service mais n'est pas defini dans `types.ts`
2. Le type `Vote` frontend ne contient pas `event_id` (requis par le backend)
3. Le backend attend `{ user_id, event_id, artist_id }` pour creer un vote

### Type actuel vs attendu

```typescript
// ACTUEL (incorrect)
export interface Vote {
  id: number;
  user_id: number;
  artist_id: number;
  created_at: string;
}

// ATTENDU
export interface Vote {
  id: number;
  user_id: number;
  event_id: number;       // MANQUANT
  artist_id: number;
  created_at: string;
  updated_at: string;     // MANQUANT
  user?: User;            // Relation incluse dans la reponse
  event?: Event;          // Relation incluse dans la reponse
  artist?: User;          // Relation incluse dans la reponse
}

// A AJOUTER
export interface CreateVoteRequest {
  user_id: number;
  event_id: number;
  artist_id: number;
}
```

### Reponse API

Le backend retourne les votes wrapes dans `{ data: Vote[] }`. Le service utilise `response.data.data` ce qui est correct SI le backend utilise Laravel API Resources. A verifier.

---

## 6. Artistes

**Service** : `services/artists/artists.service.ts`
**Statut** : Endpoints inventes - le backend n'a PAS de CRUD `/api/artists`

### Le probleme

Le service frontend suppose l'existence d'un endpoint REST `/api/artists` avec des sous-routes (`/top`, `/{id}/vote`, `/{id}/has-voted`). **Ces endpoints n'existent pas dans le backend.**

| Methode frontend | Endpoint utilise | Existe dans le backend ? |
|-----------------|-----------------|-------------------------|
| `getAll` | `GET /api/artists` | NON |
| `getById` | `GET /api/artists/{id}` | NON |
| `getTopArtists` | `GET /api/artists/top` | NON |
| `vote` | `POST /api/artists/{id}/vote` | NON |
| `unvote` | `DELETE /api/artists/{id}/vote` | NON |
| `hasVoted` | `GET /api/artists/{id}/has-voted` | NON |

### Ce qui existe cote backend pour les artistes

| Endpoint backend | Description |
|-----------------|-------------|
| `GET /api/artists/{userId}/detail` | Detail complet d'un artiste (avec distance) |
| `GET /api/artists/{userId}/styles` | Styles d'un artiste |
| `GET /api/artists/{userId}/social-links` | Liens sociaux d'un artiste |
| `GET /api/artists/{userId}/events` | Evenements d'un artiste |
| `POST /api/artists/register` | Inscrire un artiste a un evenement |
| `POST /api/artists/unregister` | Desinscrire un artiste d'un evenement |
| `GET /api/users` | Lister tous les users (filtrer par role=ARTIST) |

### Service corrige

```typescript
export const artistsService = {
  // Lister les artistes = GET /api/users puis filtrer role=ARTIST
  // OU utiliser GET /api/events/{eventId}/artists pour un evenement
  getAll: () => apiClient.get('/api/users').then(r =>
    r.data.filter((u: User) => u.role === 'ARTIST')
  ),

  // Detail d'un artiste (avec calcul de distance)
  getDetail: (userId: number, lat?: number, lng?: number) =>
    apiClient.get(`/api/artists/${userId}/detail`, {
      params: { latitude: lat, longitude: lng }
    }),

  // Styles d'un artiste
  getStyles: (userId: number) =>
    apiClient.get(`/api/artists/${userId}/styles`),

  // Liens sociaux d'un artiste
  getSocialLinks: (userId: number) =>
    apiClient.get(`/api/artists/${userId}/social-links`),

  // Evenements d'un artiste
  getEvents: (userId: number) =>
    apiClient.get(`/api/artists/${userId}/events`),

  // Inscrire un artiste a un evenement
  registerToEvent: (userId: number, eventId: number) =>
    apiClient.post('/api/artists/register', { user_id: userId, event_id: eventId }),

  // Desinscrire un artiste d'un evenement
  unregisterFromEvent: (userId: number, eventId: number) =>
    apiClient.post('/api/artists/unregister', { user_id: userId, event_id: eventId }),

  // Voter = utiliser POST /api/votes
  // hasVoted = utiliser GET /api/votes et filtrer
};
```

---

## 7. Medias

**Service** : Aucun service dedie (partiellement dans `user.service.ts`)
**Statut** : Service manquant

### Endpoints backend disponibles

| Endpoint | Description | Implemente ? |
|----------|-------------|-------------|
| `GET /api/media` | Lister ses medias | NON |
| `POST /api/media/profile-picture` | Upload photo de profil | OUI (dans user.service.ts) |
| `POST /api/media/gallery` | Upload images galerie | NON |
| `POST /api/media/tracks` | Upload pistes audio | OUI (dans user.service.ts) |
| `POST /api/media/intro-video` | Upload video d'intro | NON |
| `DELETE /api/media/{mediaId}` | Supprimer un media | NON |
| `PUT /api/media/reorder` | Reordonner les medias | NON |

### Service a creer : `services/media/media.service.ts`

```typescript
export const mediaService = {
  getAll: () =>
    apiClient.get('/api/media'),

  uploadProfilePicture: (formData: FormData) =>
    apiClient.post('/api/media/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),

  uploadGallery: (formData: FormData) =>
    apiClient.post('/api/media/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),

  uploadTracks: (formData: FormData) =>
    apiClient.post('/api/media/tracks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),

  uploadIntroVideo: (formData: FormData) =>
    apiClient.post('/api/media/intro-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),

  delete: (mediaId: number) =>
    apiClient.delete(`/api/media/${mediaId}`),

  reorder: (reorder: { id: number; position: number }[]) =>
    apiClient.put('/api/media/reorder', { reorder }),
};
```

### Type a ajouter

```typescript
export interface Media {
  id: number;
  user_id: number;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  role: 'PROFILE_PICTURE' | 'GALLERY' | 'TRACK' | 'INTRO_VIDEO';
  path: string;
  url: string;
  is_primary: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}
```

---

## 8. Liens sociaux

**Service** : Aucun
**Statut** : Service manquant

### Endpoints backend disponibles

| Endpoint | Description |
|----------|-------------|
| `GET /api/me/social-links` | Recuperer ses propres liens |
| `PUT /api/me/social-links` | Mettre a jour ses liens |
| `GET /api/artists/{userId}/social-links` | Liens d'un artiste |

### Service a creer : `services/social-links/social-links.service.ts`

```typescript
export interface SocialLinks {
  soundcloud?: string | null;
  spotify?: string | null;
  deezer?: string | null;
  apple_music?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  facebook?: string | null;
}

export const socialLinksService = {
  getMine: () =>
    apiClient.get<SocialLinks>('/api/me/social-links'),

  update: (links: SocialLinks) =>
    apiClient.put<SocialLinks>('/api/me/social-links', links),

  getForArtist: (userId: number) =>
    apiClient.get<SocialLinks>(`/api/artists/${userId}/social-links`),
};
```

---

## 9. Abonnements

**Service** : `services/subscription/subscription.service.ts`
**Statut** : OK

| Methode | Endpoint frontend | Endpoint backend | Statut |
|---------|------------------|------------------|--------|
| `checkout` | `POST /api/subscription/checkout` | `POST /api/subscription/checkout` | OK |
| `getStatus` | `GET /api/subscription/status` | `GET /api/subscription/status` | OK |
| `cancel` | `POST /api/subscription/cancel` | `POST /api/subscription/cancel` | OK |
| `resume` | `POST /api/subscription/resume` | `POST /api/subscription/resume` | OK |
| `getPortalUrl` | `GET /api/subscription/portal` | `GET /api/subscription/portal` | OK |

**Notes** : Service complet et correctement implemente.

---

## 10. Types TypeScript manquants

Les types suivants doivent etre ajoutes ou corriges dans `services/api/types.ts` :

### A ajouter

```typescript
// Vote - champ event_id manquant
export interface CreateVoteRequest {
  user_id: number;
  event_id: number;
  artist_id: number;
}

// Media
export interface Media {
  id: number;
  user_id: number;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  role: 'PROFILE_PICTURE' | 'GALLERY' | 'TRACK' | 'INTRO_VIDEO';
  path: string;
  url: string;
  is_primary: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

// Social Links
export interface SocialLinks {
  soundcloud?: string | null;
  spotify?: string | null;
  deezer?: string | null;
  apple_music?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  facebook?: string | null;
}

// Artist Profile (extended)
export interface ArtistProfile {
  id: number;
  user_id: number;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  started_year?: number;
  professions?: string[];
  plays_with_others?: boolean;
  created_at: string;
  updated_at: string;
}

// Artist Detail (reponse de GET /artists/{userId}/detail)
export interface ArtistDetail extends User {
  primary_style?: MusicStyle;
  secondary_styles?: MusicStyle[];
  distance_km?: number;
}
```

### A corriger

```typescript
// Event - noms de champs incorrects
// AVANT :
export interface Event {
  name: string;        // FAUX
  date: string;        // FAUX
  description?: string; // N'EXISTE PAS
  image_url?: string;   // N'EXISTE PAS
}

// APRES :
export interface Event {
  id: number;
  title: string;
  location: string;
  event_date: string;
  price?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'DONE';
  voting_close_date: string;
  voting_time_remaining: number;
  is_voting_open: boolean;
  created_at: string;
  updated_at: string;
  artists?: Artist[];
  votes?: Vote[];
  styles?: MusicStyle[];
}

// Vote - champ event_id manquant
// AVANT :
export interface Vote {
  id: number;
  user_id: number;
  artist_id: number;
  created_at: string;
}

// APRES :
export interface Vote {
  id: number;
  user_id: number;
  event_id: number;
  artist_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  event?: Event;
  artist?: User;
}
```

---

## 11. Endpoints manquants

Endpoints a ajouter dans `services/api/endpoints.ts` :

```typescript
export const ENDPOINTS = {
  // ... existants ...

  // Styles (manquants)
  MY_STYLES: '/api/me/styles',
  ARTIST_STYLES: (userId: string | number) => `/api/artists/${userId}/styles`,

  // Social Links (manquants)
  MY_SOCIAL_LINKS: '/api/me/social-links',
  ARTIST_SOCIAL_LINKS: (userId: string | number) => `/api/artists/${userId}/social-links`,

  // Artist Detail (manquant)
  ARTIST_DETAIL: (userId: string | number) => `/api/artists/${userId}/detail`,

  // Media (manquants)
  MEDIA: '/api/media',
  MEDIA_PROFILE_PICTURE: '/api/media/profile-picture',
  MEDIA_GALLERY: '/api/media/gallery',
  MEDIA_TRACKS: '/api/media/tracks',
  MEDIA_INTRO_VIDEO: '/api/media/intro-video',
  MEDIA_DELETE: (mediaId: string | number) => `/api/media/${mediaId}`,
  MEDIA_REORDER: '/api/media/reorder',
} as const;
```

---

## 12. Resume des priorites

### Priorite haute (bloquant pour le fonctionnement)

| # | Tache | Fichiers concernes |
|---|-------|-------------------|
| 1 | Corriger le type `Event` (`name`→`title`, `date`→`event_date`, ajouter `status`, `price`, champs de vote) | `services/api/types.ts` |
| 2 | Ajouter `event_id` au type `Vote` + creer `CreateVoteRequest` | `services/api/types.ts` |
| 3 | Reecrire `artists.service.ts` avec les vrais endpoints backend | `services/artists/artists.service.ts` |
| 4 | Corriger `user.service.ts` (remplacer les endpoints inventes) | `services/user/user.service.ts` |
| 5 | Creer `media.service.ts` | `services/media/media.service.ts` (nouveau) |
| 6 | Mettre a jour `endpoints.ts` avec tous les endpoints manquants | `services/api/endpoints.ts` |

### Priorite moyenne (necessaire mais non bloquant)

| # | Tache | Fichiers concernes |
|---|-------|-------------------|
| 7 | Creer `social-links.service.ts` | `services/social-links/social-links.service.ts` (nouveau) |
| 8 | Completer `styles.service.ts` (ajouter getMyStyles, updateMyStyles) | `services/styles/styles.service.ts` |
| 9 | Faire utiliser `ENDPOINTS` dans `events.service.ts` (URLs en dur actuellement) | `services/events/events.service.ts` |
| 10 | Corriger `addArtist`/`removeArtist` dans events.service (utiliser `/artists/register` et `/artists/unregister`) | `services/events/events.service.ts` |

### Priorite basse (ameliorations)

| # | Tache | Fichiers concernes |
|---|-------|-------------------|
| 11 | Ajouter `primary_style_id` et `secondary_style_ids` au register ARTIST | `services/auth/auth.service.ts` |
| 12 | Remplacer les donnees mock dans les ecrans par les appels API | `app/vote/[id].tsx`, `app/artist/[id].tsx`, `app/(tabs)/votes.tsx` |
| 13 | Supprimer les methodes inventees (`becomeArtist`, `getMyVotes`, `getReceivedVotes`) | `services/user/user.service.ts` |

---

## Annexe : Architecture des services

```
services/
├── api/
│   ├── client.ts          ← Client Axios avec intercepteurs (OK)
│   ├── endpoints.ts       ← Endpoints centralises (INCOMPLET)
│   └── types.ts           ← Types TypeScript (A CORRIGER)
├── auth/
│   └── auth.service.ts    ← Authentification (OK)
├── artists/
│   └── artists.service.ts ← Artistes (A REECRIRE)
├── events/
│   └── events.service.ts  ← Evenements (TYPES A CORRIGER)
├── media/
│   └── media.service.ts   ← A CREER
├── social-links/
│   └── social-links.service.ts ← A CREER
├── styles/
│   └── styles.service.ts  ← Styles musicaux (A COMPLETER)
├── subscription/
│   └── subscription.service.ts ← Abonnements (OK)
├── user/
│   └── user.service.ts    ← Profil utilisateur (A CORRIGER)
└── votes/
    └── votes.service.ts   ← Votes (TYPE A CORRIGER)
```
