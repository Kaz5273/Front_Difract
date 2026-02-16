# Difract - Synchronisation Frontend / Backend API

Ce document liste toutes les modifications à appliquer dans le frontend pour aligner le code avec l'API backend (Laravel 12 / Sanctum).

---

## 1. CRITIQUE - Interface `Event` (types.ts) : champs incorrects

**Fichier** : `services/api/types.ts`

Le type `Event` du front ne correspond pas du tout au modèle backend.

| Champ front (actuel) | Champ API (attendu) | Action |
|---|---|---|
| `name` | `title` | **Renommer** |
| `description` | _(n'existe pas)_ | **Supprimer** |
| `date` | `event_date` | **Renommer** |
| `image_url` | _(n'existe pas)_ | **Supprimer** |
| _(manquant)_ | `price` | **Ajouter** : `price?: number` |
| _(manquant)_ | `status` | **Ajouter** : `status: 'DRAFT' \| 'PUBLISHED' \| 'DONE'` |
| _(manquant)_ | `voting_close_date` | **Ajouter** : `voting_close_date: string` |
| _(manquant)_ | `voting_time_remaining` | **Ajouter** : `voting_time_remaining: number` (secondes) |
| _(manquant)_ | `is_voting_open` | **Ajouter** : `is_voting_open: boolean` |
| _(manquant)_ | `votes` | **Ajouter** : `votes?: Vote[]` |
| _(manquant)_ | `styles` | **Ajouter** : `styles?: MusicStyle[]` |

**Nouveau type attendu** :
```typescript
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
```

**Impact** : Tous les composants qui utilisent `event.name`, `event.date`, `event.description` devront être mis à jour.

---

## 2. CRITIQUE - Interface `Vote` (types.ts) : champs manquants

**Fichier** : `services/api/types.ts`

| Problème | Action |
|---|---|
| `event_id` manquant | **Ajouter** : `event_id: number` |
| `updated_at` manquant | **Ajouter** : `updated_at: string` |
| Relations manquantes | **Ajouter** optionnels : `user?: User`, `event?: Event`, `artist?: User` |

**Type `CreateVoteRequest` manquant** (importé dans `votes.service.ts` mais jamais défini) :
```typescript
export interface CreateVoteRequest {
  user_id: number;
  event_id: number;
  artist_id: number;
}
```

---

## 3. CRITIQUE - `artists.service.ts` : endpoints inexistants

**Fichier** : `services/artists/artists.service.ts`

Tous les endpoints utilisés sont inventés et n'existent pas dans l'API :

| Endpoint front (faux) | Endpoint API (correct) | Notes |
|---|---|---|
| `GET /api/artists` | `GET /api/users` (filtrer role=ARTIST) | L'API n'a pas de route `/artists` pour lister |
| `GET /api/artists/:id` | `GET /api/artists/:id/detail` | Endpoint de détail artiste |
| `GET /api/artists/top` | _(n'existe pas)_ | **Supprimer** ou implémenter côté back |
| `POST /api/artists/:id/vote` | `POST /api/votes` avec body `{user_id, event_id, artist_id}` | Logique de vote complètement différente |
| `DELETE /api/artists/:id/vote` | `DELETE /api/votes/:voteId` | Nécessite l'ID du vote, pas de l'artiste |
| `GET /api/artists/:id/has-voted` | _(n'existe pas)_ | **Supprimer** ou implémenter côté back |

**Réécriture complète nécessaire** de ce service.

---

## 4. CRITIQUE - `user.service.ts` : endpoints inexistants

**Fichier** : `services/user/user.service.ts`

Aucun des endpoints utilisés n'existe dans l'API :

| Endpoint front (faux) | Endpoint API (correct) | Notes |
|---|---|---|
| `GET /api/users/profile` | `GET /api/me` | Utiliser le endpoint `/me` |
| `PUT /api/users/profile` | `PUT /api/users/:id` | Mettre à jour via l'ID utilisateur |
| `POST /api/users/avatar` | `POST /api/media/profile-picture` | Endpoint media avec `multipart/form-data` |
| `POST /api/users/become-artist` | _(n'existe pas)_ | **Supprimer** - le rôle est défini à l'inscription |
| `GET /api/users/my-votes` | `GET /api/votes` | Filtrer côté front par user_id |
| `GET /api/users/received-votes` | `GET /api/votes` | Filtrer côté front par artist_id |

---

## 5. IMPORTANT - `events.service.ts` : endpoints partiellement incorrects

**Fichier** : `services/events/events.service.ts`

| Méthode | Problème | Correction |
|---|---|---|
| `getUpcoming()` | `/api/events/upcoming` n'existe pas | Supprimer ou filtrer côté front les events avec `event_date` > now |
| `addArtist()` | `POST /api/events/:id/artists` n'existe pas | Utiliser `POST /api/artists/register` avec body `{user_id, event_id}` |
| `removeArtist()` | `DELETE /api/events/:id/artists/:artistId` n'existe pas | Utiliser `POST /api/artists/unregister` avec body `{user_id, event_id}` |
| `create()` | Le type `Omit<Event, ...>` utilise les mauvais champs | Adapter au nouveau type Event (title au lieu de name, etc.) |
| N'utilise pas les ENDPOINTS | URLs hardcodées en strings | Utiliser `ENDPOINTS.EVENTS`, `ENDPOINTS.EVENT_BY_ID(id)`, etc. |

---

## 6. IMPORTANT - `votes.service.ts` : format de réponse incorrect

**Fichier** : `services/votes/votes.service.ts`

| Problème | Correction |
|---|---|
| Utilise `ApiResponse<Vote[]>` avec `response.data.data` | L'API retourne directement `Vote[]`, pas wrappé dans `{data: [...]}`. Utiliser `response.data` directement |
| Importe `CreateVoteRequest` qui n'existe pas | Définir le type dans `types.ts` |

---

## 7. IMPORTANT - `endpoints.ts` : endpoints manquants

**Fichier** : `services/api/endpoints.ts`

Ajouter les endpoints manquants :
```typescript
// Artist Detail
ARTIST_DETAIL: (userId: string | number) => `/api/artists/${userId}/detail`,

// Artist Styles
ARTIST_STYLES: (userId: string | number) => `/api/artists/${userId}/styles`,
MY_STYLES: '/api/me/styles',

// Social Links
MY_SOCIAL_LINKS: '/api/me/social-links',
ARTIST_SOCIAL_LINKS: (userId: string | number) => `/api/artists/${userId}/social-links`,

// Media
MEDIA: '/api/media',
MEDIA_PROFILE_PICTURE: '/api/media/profile-picture',
MEDIA_GALLERY: '/api/media/gallery',
MEDIA_TRACKS: '/api/media/tracks',
MEDIA_INTRO_VIDEO: '/api/media/intro-video',
MEDIA_REORDER: '/api/media/reorder',
MEDIA_BY_ID: (id: string | number) => `/api/media/${id}`,
```

---

## 8. IMPORTANT - Types manquants à créer (types.ts)

**Fichier** : `services/api/types.ts`

### Media
```typescript
export interface Media {
  id: number;
  user_id: number;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  role: 'PROFILE_PICTURE' | 'GALLERY' | 'TRACK' | 'INTRO_VIDEO';
  path: string;
  url: string;
  is_primary: boolean;
  position?: number;
  created_at: string;
  updated_at: string;
}
```

### SocialLink
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
```

### ArtistProfile
```typescript
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
```

### ArtistDetail (réponse de GET /artists/:id/detail)
```typescript
export interface ArtistDetail extends User {
  primary_style?: MusicStyle;
  secondary_styles: MusicStyle[];
  distance_km?: number;
}
```

---

## 9. MINEUR - `RegisterCredentials` incomplet (types.ts)

**Fichier** : `services/api/types.ts`

Champs manquants dans `RegisterCredentials` :
```typescript
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'PUBLIC' | 'ARTIST' | 'ADMIN'; // ADMIN manquant
  bio?: string;
  media_url?: string;
  primary_style_id?: number;      // requis si role=ARTIST
  secondary_style_ids?: number[];  // max 3
}
```

> Note : Le store `auth-store.ts` gère déjà `primaryStyleId` et `secondaryStyleIds` dans le register, mais le type `RegisterCredentials` ne les déclare pas.

---

## 10. MINEUR - Duplication dans `types.ts`

**Fichier** : `services/api/types.ts`

Les interfaces `MusicStyle`, `StyleSelection` et `StylesResponse` sont définies **deux fois** (lignes 67-89 et 117-141). Supprimer la duplication.

De plus, `StylesResponse` wraps dans `{ data: MusicStyle[] }` mais l'API retourne directement un tableau `MusicStyle[]`. Supprimer ce type ou le corriger.

---

## 11. MINEUR - Services manquants à créer

Les services suivants n'existent pas encore dans le front :

| Service | Endpoints couverts |
|---|---|
| `services/media/media.service.ts` | Upload profile picture, gallery, tracks, intro video, delete, reorder |
| `services/social-links/social-links.service.ts` | GET/PUT social links (me + artist) |

---

## 12. MINEUR - `events.service.ts` n'utilise pas les ENDPOINTS centralisés

Les URLs sont hardcodées (`'/api/events'`, `'/api/events/${id}'`) au lieu d'utiliser les constantes `ENDPOINTS.EVENTS`, `ENDPOINTS.EVENT_BY_ID(id)`, etc.

Même problème dans `artists.service.ts` et `user.service.ts`.

---

## Résumé des priorités

### P0 - Bloquant (empêche le fonctionnement)
1. Corriger l'interface `Event` (champs incorrects)
2. Ajouter `CreateVoteRequest` dans types.ts
3. Réécrire `artists.service.ts` avec les bons endpoints
4. Réécrire `user.service.ts` avec les bons endpoints
5. Corriger le format de réponse dans `votes.service.ts`

### P1 - Important (fonctionnalités incomplètes)
6. Corriger `events.service.ts` (endpoints faux + utiliser ENDPOINTS)
7. Compléter `endpoints.ts` avec tous les endpoints manquants
8. Ajouter les types manquants (Media, SocialLinks, ArtistProfile, ArtistDetail)
9. Compléter `RegisterCredentials`
10. Implémenter les hooks `useEvents` et `useVotes` (actuellement des placeholders)

### P2 - Mineur (nettoyage)
11. Supprimer la duplication dans `types.ts`
12. Créer les services manquants (media, social-links)
13. Uniformiser l'utilisation des ENDPOINTS dans tous les services
14. Implémenter un vrai `events-store.ts` (actuellement placeholder)

---

## Notes d'intégration

- **Authentification** : Le client API (`client.ts`) et le store (`auth-store.ts`) sont bien configurés avec Bearer token Sanctum.
- **Gestion des erreurs 401** : L'intercepteur de réponse gère déjà le clearAll en cas de 401.
- **Styles** : Le hook `useStyles` et `stylesService` sont corrects et fonctionnels.
- **Base URL** : Actuellement `https://apidifract.kazllrd.fr`, à vérifier si c'est toujours valide.

---

*Dernière mise à jour : 16 février 2026*
