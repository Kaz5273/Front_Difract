# Difract — Frontend API Guide

> Guide complet pour l'agent frontend. Toutes les routes, les JSON envoyés et reçus, organisés par fonctionnalité.
>
> **Base URL** : `https://apidifract.kazllrd.fr/api`
> **Auth** : `Authorization: Bearer {token}` (Sanctum)
>
> | Icône | Signification                                                |
> | ----- | ------------------------------------------------------------ |
> | 🌐    | Route publique — accessible sans compte                      |
> | 🔒    | Route protégée — `Authorization: Bearer {token}` obligatoire |

---

## Enums & États

Référence complète de toutes les valeurs acceptées pour les champs enum.

### User — `role`

| Valeur   | Description                                        |
| -------- | -------------------------------------------------- |
| `PUBLIC` | Utilisateur standard (défaut à l'inscription)      |
| `ARTIST` | Artiste pouvant s'inscrire aux événements et voter |
| `ADMIN`  | Administrateur                                     |

---

### Event — `status`

| Valeur      | Description                                  |
| ----------- | -------------------------------------------- |
| `DRAFT`     | Brouillon, non visible publiquement (défaut) |
| `PUBLISHED` | Publié, visible dans les listings            |
| `DONE`      | Événement terminé                            |

---

### Event — `type`

| Valeur    | Capacité par défaut | Description                             |
| --------- | ------------------- | --------------------------------------- |
| `classic` | 300 places          | Événement standard (admin peut ajuster) |
| `special` | manuelle            | Événement exceptionnel (ex : Nouvel An) |

---

### Event — Timeline de votes et billetterie

```
Exemple : event le 26 fév, votes du 1 jan au 29 jan

 1 jan     29 jan   3 fév        6 fév        21 fév  22 fév   26 fév
   │          │        │            │             │       │        │
   ├─ VOTES ──┤ EARLY  │  (morte)   ├── STANDARD──┤ (mt)  ├─ LM ───┤
   │  OUVERTS │ ACCESS │            │   J-20→J-5  │       │J-4→J   │
              │ 5 jours│            │             │       │        │
```

| Phase                     | Période                                    | `is_voting_open` | Vente billets           |
| ------------------------- | ------------------------------------------ | ---------------- | ----------------------- |
| Avant `voting_start_date` |                                            | `false`          | ❌ fermée               |
| Votes ouverts             | `voting_start_date` → `voting_end_date`    | `true`           | ❌ fermée               |
| Early Access              | `voting_end_date` → `voting_end_date + 5j` | `false`          | ✅ `early_access` (20€) |
| Fenêtre morte             | entre Early Access et Standard             | `false`          | ❌ fermée               |
| Standard                  | `event_date - 20j` → `event_date - 5j`     | `false`          | ✅ `standard` (25€)     |
| Fenêtre morte             | entre Standard et Last Minute              | `false`          | ❌ fermée               |
| Last Minute               | `event_date - 4j` → `event_date`           | `false`          | ✅ `last_minute` (30€)  |
| Passé                     | après `event_date`                         | `false`          | ❌ fermée               |

> `voting_start_date` et `voting_end_date` sont **définis manuellement** par l'admin.
> `voting_time_remaining` = entier en **secondes** restantes avant `voting_end_date` (`0` si fermés).
> Des **fenêtres mortes** existent entre les paliers : la vente est fermée durant ces intervalles.

---

### Ticket — `status`

| Valeur      | Description                                         |
| ----------- | --------------------------------------------------- |
| `pending`   | Paiement initié, en attente de confirmation webhook |
| `confirmed` | Paiement confirmé, billet valide                    |
| `refunded`  | Remboursé (nécessite `has_insurance = true`)        |
| `cancelled` | Annulé                                              |

### Ticket — `tier`

| Valeur         | Prix                             | Période                                    |
| -------------- | -------------------------------- | ------------------------------------------ |
| `early_access` | 20 € (ou 22,99 € avec assurance) | `voting_end_date` → `voting_end_date + 5j` |
| `standard`     | 25 € (ou 27,99 € avec assurance) | `event_date - 20j` → `event_date - 5j`     |
| `last_minute`  | 30 € (ou 32,99 € avec assurance) | `event_date - 4j` → `event_date`           |

---

### Media — `type`

| Valeur  | Description               |
| ------- | ------------------------- |
| `IMAGE` | Photo (profil ou galerie) |
| `AUDIO` | Fichier audio (track)     |
| `VIDEO` | Vidéo (intro)             |

### Media — `role`

| Valeur        | Description                                      |
| ------------- | ------------------------------------------------ |
| `PROFILE`     | Photo de profil principale (`is_primary = true`) |
| `GALLERY`     | Image de galerie                                 |
| `TRACK`       | Track audio                                      |
| `INTRO_VIDEO` | Vidéo d'introduction                             |

---

### Profile completion — `missing` (étapes manquantes)

| Valeur            | Condition                                    | Rôles concernés   |
| ----------------- | -------------------------------------------- | ----------------- |
| `profile_picture` | Aucune media `PROFILE` + `is_primary = true` | PUBLIC + ARTIST   |
| `bio`             | Champ `bio` vide                             | PUBLIC + ARTIST   |
| `location`        | Champ `city` vide                            | PUBLIC + ARTIST   |
| `social_links`    | Aucun lien social                            | PUBLIC + ARTIST   |
| `styles`          | Aucun style musical                          | ARTIST uniquement |

> PUBLIC : 4 étapes max → pourcentage sur 4
> ARTIST : 5 étapes max → pourcentage sur 5

---

### Social Links — `platform`

Valeurs acceptées (enum) : `spotify`, `soundcloud`, `deezer`, `youtube`, `tiktok`, `instagram`

---

---

## Mode visiteur (sans compte)

L'application peut être **visitée sans inscription**. Les routes de consultation sont publiques (🌐) et ne nécessitent pas de token. Seules les actions interactives nécessitent un compte (🔒).

### Ce qu'un visiteur peut faire

| Fonctionnalité                                                    | Accessible |
| ----------------------------------------------------------------- | ---------- |
| Parcourir la liste des artistes                                   | ✅         |
| Voir le profil d'un artiste (bio, galerie, styles, liens sociaux) | ✅         |
| Voir les événements à venir                                       | ✅         |
| Voir le détail d'un événement                                     | ✅         |
| Voir les artistes d'un événement                                  | ✅         |
| Voir les événements d'un artiste                                  | ✅         |
| Lire les commentaires (artistes et événements)                    | ✅         |
| Consulter le classement des votes                                 | ✅         |
| Voir le détail d'un vote                                          | ✅         |
| Voir les styles musicaux                                          | ✅         |

### Ce qui nécessite un compte

| Fonctionnalité                        | Accessible |
| ------------------------------------- | ---------- |
| Écouter les tracks audio d'un artiste | 🔒         |
| Voter pour un artiste                 | 🔒         |
| Acheter un billet                     | 🔒         |
| Souscrire à un abonnement             | 🔒         |
| Poster / supprimer un commentaire     | 🔒         |
| Suivre un artiste (follow)            | 🔒         |
| Ajouter en favoris                    | 🔒         |
| Gérer son profil et ses médias        | 🔒         |

### Comportement des tracks audio

Les tracks (`role = TRACK`) sont **toujours présentes** dans le tableau `media`, mais les champs `url` et `path` sont **masqués pour les visiteurs non connectés**. Le frontend reçoit le titre et les métadonnées (id, position, title) — suffisant pour afficher la liste — mais pas l'URL audio.

**Réponse visiteur (sans token) :**

```json
{
  "id": 5,
  "type": "AUDIO",
  "role": "TRACK",
  "title": "Mon morceau",
  "is_primary": false,
  "position": 0
}
```

**Réponse connecté (avec token) :**

```json
{
  "id": 5,
  "type": "AUDIO",
  "role": "TRACK",
  "title": "Mon morceau",
  "url": "https://...",
  "path": "media/tracks/...",
  "is_primary": false,
  "position": 0
}
```

> **Comportement attendu côté frontend :** afficher la liste des tracks normalement. Si le visiteur clique sur "play", afficher une popup invitant à créer un compte.

### Rate limiting

| Groupe                                               | Limite                        |
| ---------------------------------------------------- | ----------------------------- |
| Routes d'authentification (`/login`, `/register`...) | 10 req / min par IP           |
| Routes de consultation publique (🌐)                 | 60 req / min par IP           |
| Routes authentifiées (🔒)                            | 300 req / min par utilisateur |

---

## Notes générales

- **Pas de pagination** : toutes les routes de listing retournent l'ensemble des résultats en une seule réponse.
- **Pas de `PUT /me`** : pour modifier son propre profil (name, bio, city, email, password...), utiliser `PUT /users/{id}` avec son propre ID.
- **Pas de reset de mot de passe** : aucune route "mot de passe oublié" n'existe dans cette version.

---

## Objets de référence

Schémas complets des objets retournés par l'API.

### Objet `User`

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ARTIST",
  "bio": "Ma bio",
  "media_url": null,
  "city": "Paris",
  "postal_code": "75001",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "location_tracking_enabled": false,
  "votes_count": 42,
  "email_verified_at": "2026-02-28T10:00:00.000000Z",
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

> `password` et `remember_token` ne sont **jamais** inclus dans les réponses.
> `votes_count` : compteur dénormalisé (votes reçus en tant qu'artiste).

---

### Objet `Event`

```json
{
  "id": 1,
  "title": "Difract Night",
  "description": "Description de l'événement",
  "location": "Paris",
  "address": "10 rue de la Paix, 75001 Paris",
  "event_date": "2026-05-15T22:00:00.000000Z",
  "end_time": "2026-05-16T06:00:00.000000Z",
  "price": "15.00",
  "status": "PUBLISHED",
  "type": "classic",
  "image_url": "https://apidifract.kazllrd.fr/storage/media/events/1/cover/uuid.jpg",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "capacity": 300,
  "voting_start_date": "2026-01-01T00:00:00.000000Z",
  "voting_end_date": "2026-01-29T00:00:00.000000Z",
  "early_access_stock": 50,
  "standard_stock": 215,
  "last_minute_stock": 30,
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z",
  "voting_time_remaining": 3628800,
  "is_voting_open": true
}
```

> `voting_time_remaining` : entier en secondes restantes avant `voting_end_date` (`0` si fermés, `null` si pas de date).
> `capacity` : total de places (défaut 300 pour `classic`), peut être `null`.
> `early_access_stock`, `standard_stock`, `last_minute_stock` : stocks par palier (peuvent être `null` si non configurés).

---

### Objet `Media`

```json
{
  "id": 1,
  "user_id": 1,
  "type": "IMAGE",
  "role": "PROFILE",
  "title": null,
  "url": "https://apidifract.kazllrd.fr/storage/media/...",
  "path": "media/...",
  "is_primary": true,
  "position": 0,
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

> `title` : titre du média (utilisé pour les tracks audio). `null` pour les images/vidéos.

---

### Objet `SocialLink`

```json
{
  "id": 1,
  "user_id": 1,
  "platform": "instagram",
  "url": "https://instagram.com/johndoe",
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

---

### Objet `Comment`

```json
{
  "id": 1,
  "user_id": 3,
  "commentable_id": 5,
  "commentable_type": "App\\Models\\User",
  "body": "Super set !",
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z",
  "user": {
    "id": 3,
    "name": "Fan123"
  }
}
```

---

### Objet `Ticket`

```json
{
  "id": 1,
  "event_id": 3,
  "user_id": 1,
  "tier": "early_bird",
  "price": "20.00",
  "has_insurance": false,
  "status": "confirmed",
  "qr_code": "550e8400-e29b-41d4-a716-446655440000",
  "ls_order_id": "12345",
  "scanned_at": null,
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z"
}
```

---

## Table des matières

1. [Authentication](#1-authentication)
2. [Utilisateur connecté (Me)](#2-utilisateur-connecté-me)
3. [Users](#3-users)
4. [Events](#4-events)
5. [Artists](#5-artists)
6. [Votes](#6-votes)
7. [Styles musicaux](#7-styles-musicaux)
8. [Media](#8-media)
9. [Social Links](#9-social-links)
10. [Favoris](#10-favoris)
11. [Follows (amis)](#11-follows-amis)
12. [Commentaires](#12-commentaires)
13. [Push Tokens](#13-push-tokens)
14. [Abonnements (LemonSqueezy)](#14-abonnements-lemonsqueezy)
15. [Billetterie (LemonSqueezy)](#15-billetterie-lemonsqueezy)

---

## 1. Authentication

### Table : `users`, `verification_codes`

---

### `POST /register`

Crée un compte. Envoie un code de vérification par email. **Ne retourne pas de token.**

**Request :**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "PUBLIC",
  "bio": "Ma bio",
  "city": "Paris",
  "postal_code": "75001",
  "primary_style_id": 1,
  "secondary_style_ids": [2, 3]
}
```

> `role` : `PUBLIC` (défaut) ou `ARTIST`
> `primary_style_id` : requis si `role = ARTIST`
> `secondary_style_ids` : optionnel, max 3, différents du primary

**Response 201 :**

```json
{
  "message": "Compte créé. Un code de vérification a été envoyé à votre adresse email.",
  "email": "john@example.com"
}
```

---

### `POST /verify-email`

Vérifie le code reçu par email. **Retourne le token.**

**Request :**

```json
{
  "email": "john@example.com",
  "code": "48291"
}
```

**Response 200 :**

```json
{
  "message": "Email vérifié avec succès.",
  "user": {
    /* objet User complet */
  },
  "primary_style": { "id": 1, "name": "House" },
  "secondary_styles": [{ "id": 2, "name": "Techno" }],
  "access_token": "1|abc123...",
  "token_type": "Bearer"
}
```

---

### `POST /resend-code`

Renvoie un code de vérification.

**Request :**

```json
{
  "email": "john@example.com"
}
```

**Response 200 :**

```json
{
  "message": "Un nouveau code de vérification a été envoyé."
}
```

---

### `POST /login`

Se connecter avec email + mot de passe.

**Request :**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response 200 :**

```json
{
  "user": {
    /* objet User complet */
  },
  "access_token": "1|abc123...",
  "token_type": "Bearer"
}
```

**Response 403 (email non vérifié) :**

```json
{
  "message": "Votre email n'est pas encore vérifié. Un nouveau code a été envoyé.",
  "email": "john@example.com",
  "requires_verification": true
}
```

---

### `POST /logout` 🔒

Révoque le token actuel.

**Response 200 :**

```json
{
  "message": "Logged out successfully"
}
```

---

## 2. Utilisateur connecté (Me)

### Table : `users`

---

### `GET /me` 🔒

Retourne le profil complet de l'utilisateur connecté avec ses stats et sa complétion de profil.

**Response 200 :**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ARTIST",
  "bio": "Ma bio",
  "media_url": null,
  "city": "Paris",
  "postal_code": "75001",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "votes_count": 42,
  "email_verified_at": "2026-02-28T10:00:00.000000Z",
  "created_at": "2026-02-28T10:00:00.000000Z",
  "updated_at": "2026-02-28T10:00:00.000000Z",
  "styles": [
    { "id": 1, "name": "House", "pivot": { "is_primary": true } },
    { "id": 2, "name": "Techno", "pivot": { "is_primary": false } }
  ],
  "media": [
    /* tableau d'objets Media */
  ],
  "social_links": [
    /* tableau d'objets SocialLink */
  ],
  "stats": {
    "votes_received": 42,
    "events_count": 3,
    "friends_count": 15
  },
  "profile_completion": {
    "percentage": 80,
    "completed_steps": 4,
    "total_steps": 5,
    "missing": ["styles"]
  }
}
```

> `profile_completion.missing` peut contenir : `profile_picture`, `bio`, `location`, `social_links`, `styles` (ARTIST uniquement)

---

### `GET /me/votes` 🔒

Liste les votes émis par l'utilisateur connecté. Utilisé pour la page **"Vos votes"**.

**Response 200 :**

```json
[
  {
    "id": 1,
    "user_id": 1,
    "artist_id": 5,
    "event_id": 2,
    "created_at": "2026-02-28T10:00:00.000000Z",
    "event": {
      "id": 2,
      "title": "Difract Night",
      "location": "Paris",
      "event_date": "2026-05-15T22:00:00.000000Z",
      "image_url": "https://apidifract.kazllrd.fr/storage/media/events/2/cover/uuid.jpg",
      "status": "PUBLISHED"
    },
    "artist": {
      "id": 5,
      "name": "DJ John",
      "media_url": null,
      "city": "Paris"
    }
  }
]
```

---

### `GET /me/received-votes` 🔒

Liste les votes reçus par l'artiste connecté.

**Response 200 :** `[{ "id": 1, "user_id": 3, "artist_id": 1, "event_id": 2, "created_at": "..." }, ...]`

---

### `PUT /me/location` 🔒

Met à jour la localisation de l'utilisateur (GPS et/ou ville).

**Request :**

```json
{
  "city": "Paris",
  "postal_code": "75001",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "location_tracking_enabled": true
}
```

> Tous les champs sont optionnels. `city` / `postal_code` = saisie manuelle. `latitude` / `longitude` = coordonnées GPS. `location_tracking_enabled` = préférence de tracking automatique (boolean).

**Response 200 :** objet User mis à jour (complet)

---

### `GET /me/styles` 🔒

Retourne les styles musicaux de l'artiste connecté.

**Response 200 :**

```json
[
  { "id": 1, "name": "House", "pivot": { "is_primary": true } },
  { "id": 2, "name": "Techno", "pivot": { "is_primary": false } }
]
```

---

### `PUT /me/styles` 🔒

Met à jour les styles de l'artiste connecté.

**Request :**

```json
{
  "primary_style_id": 1,
  "secondary_style_ids": [2, 3]
}
```

**Response 200 :**

```json
[
  { "id": 1, "name": "House", "pivot": { "is_primary": true } },
  { "id": 2, "name": "Techno", "pivot": { "is_primary": false } }
]
```

---

### `GET /me/social-links` 🔒

Retourne les liens sociaux de l'utilisateur connecté.

**Response 200 :**

```json
{
  "soundcloud": "https://soundcloud.com/johndoe",
  "spotify": null,
  "deezer": null,
  "youtube": null,
  "tiktok": null,
  "instagram": "https://instagram.com/johndoe"
}
```

> Retourne un objet avec toutes les plateformes. Les plateformes sans lien sont à `null`.

---

### `PUT /me/social-links` 🔒

Met à jour les liens sociaux (champ par champ, chaque plateforme est optionnelle).

**Request :**

```json
{
  "soundcloud": "https://soundcloud.com/johndoe",
  "spotify": "https://open.spotify.com/artist/...",
  "deezer": null,
  "youtube": null,
  "tiktok": "https://tiktok.com/@johndoe",
  "instagram": "https://instagram.com/johndoe"
}
```

> Toutes les clés sont optionnelles. Envoyer `null` ou omettre une clé supprime le lien correspondant.
> Plateformes acceptées : `soundcloud`, `spotify`, `deezer`, `youtube`, `tiktok`, `instagram`

**Response 200 :**

````json
{
  "message": "Social links updated successfully",
  "data": {
    "soundcloud": "https://soundcloud.com/johndoe",
    "spotify": "https://open.spotify.com/artist/...",
    "deezer": null,
    "youtube": null,
    "tiktok": "https://tiktok.com/@johndoe",
    "instagram": "https://instagram.com/johndoe"
  }
}

---

### `GET /me/tickets` 🔒
Liste les billets de l'utilisateur connecté.

**Response 200 :**
```json
[
  {
    "id": 1,
    "event_id": 3,
    "user_id": 1,
    "tier": "early_access",
    "price": "20.00",
    "has_insurance": false,
    "status": "confirmed",
    "qr_code": "550e8400-e29b-41d4-a716-446655440000",
    "ls_order_id": "12345",
    "scanned_at": null,
    "created_at": "2026-02-28T10:00:00.000000Z",
    "event": {
      "id": 3,
      "title": "Difract Night",
      "location": "Paris",
      "event_date": "2026-05-15T22:00:00.000000Z",
      "image_url": "https://..."
    }
  }
]
````

---

### `DELETE /me/tickets/{ticketId}` 🔒

Remboursement d'un billet (uniquement si `has_insurance = true`).

**Response 200 :**

```json
{
  "message": "Remboursement effectué avec succès."
}
```

**Response 403 (sans assurance) :**

```json
{
  "message": "Ce billet ne dispose pas de l'assurance remboursement."
}
```

---

### `POST /me/push-token` 🔒

Enregistre un token de notification push.

**Request :**

```json
{
  "token": "ExponentPushToken[xxxxxx]",
  "platform": "ios"
}
```

**Response 201 :**

```json
{
  "message": "Push token registered successfully"
}
```

---

### `DELETE /me/push-token` 🔒

Supprime le token push de l'utilisateur.

**Response 200 :**

```json
{
  "message": "Push token removed successfully"
}
```

---

## 3. Users

### Table : `users`

---

### `GET /users` 🔒

Liste tous les utilisateurs.

**Response 200 :** `[{ /* objet User */ }, ...]`

---

### `GET /users/{id}` 🔒

Retourne un utilisateur par son ID.

**Response 200 :** `{ /* objet User */ }`

---

### `PUT /users/{id}` 🔒

Met à jour un utilisateur.

**Request :**

```json
{
  "name": "John Updated",
  "bio": "Nouvelle bio",
  "city": "Lyon",
  "postal_code": "69001",
  "media_url": "https://..."
}
```

**Response 200 :** `{ /* objet User mis à jour */ }`

---

### `DELETE /users/{id}` 🔒

Supprime un utilisateur.

**Response 200 :** `{ "message": "User deleted successfully" }`

---

### `POST /users/become-artist` 🔒

Passe le rôle de l'utilisateur de PUBLIC à ARTIST.

**Request :**

```json
{
  "primary_style_id": 1,
  "secondary_style_ids": [2, 3],
  "city": "Paris",
  "postal_code": "75001",
  "started_year": 2018,
  "plays_with_others": true
}
```

> `primary_style_id` : requis
> `secondary_style_ids` : optionnel, max 3, différents du primary
> `started_year`, `plays_with_others` : optionnels

**Response 200 :** objet User complet (avec `role = ARTIST` et `styles`)

**Response 403 (déjà ARTIST ou ADMIN) :**

```json
{
  "message": "Only PUBLIC users can become an artist"
}
```

---

## 4. Events

### Table : `events`, `event_style`

---

### `GET /events` 🔒

Liste tous les événements avec filtres optionnels.

**Query params :**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Recherche par titre |
| `style_id` | integer | Filtrer par style |
| `date` | string | Filtrer par date (YYYY-MM-DD) |
| `status` | string | `DRAFT`, `PUBLISHED`, `DONE` |
| `lat` | float | Latitude pour recherche géo |
| `lng` | float | Longitude pour recherche géo |
| `radius` | float | Rayon en km (défaut: 50) |

**Response 200 :**

```json
[
  {
    "id": 1,
    "title": "Difract Night",
    "description": "Description de l'événement",
    "location": "Paris",
    "address": "10 rue de la Paix, Paris",
    "event_date": "2026-05-15T22:00:00.000000Z",
    "end_time": "2026-05-16T06:00:00.000000Z",
    "price": "15.00",
    "status": "PUBLISHED",
    "image_url": "https://apidifract.kazllrd.fr/storage/media/events/1/cover/uuid.jpg",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "capacity": 300,
    "type": "classic",
    "voting_start_date": "2026-01-01T00:00:00.000000Z",
    "voting_end_date": "2026-01-29T00:00:00.000000Z",
    "early_access_stock": 50,
    "standard_stock": 215,
    "last_minute_stock": 30,
    "is_voting_open": true,
    "voting_time_remaining": 3628800,
    "distance_km": 2.4,
    "artists": [
      /* tableau d'objets User (ARTIST) */
    ],
    "votes": [
      /* tableau de votes */
    ],
    "styles": [{ "id": 1, "name": "House" }],
    "created_at": "2026-02-28T10:00:00.000000Z"
  }
]
```

> `distance_km` : présent uniquement si `lat` + `lng` fournis
> `is_voting_open` : `true` si l'heure actuelle est entre `voting_start_date` et `voting_end_date`
> `voting_time_remaining` : entier en **secondes** restantes avant `voting_end_date` (`0` si fermés, `null` si non défini)

---

### `GET /events/upcoming` 🌐

Prochains événements publiés (event_date > maintenant, status = PUBLISHED), triés par date.

**Query params :**
| Param | Type | Description |
|-------|------|-------------|
| `limit` | integer | Limite le nombre de résultats |

**Response 200 :** même structure que `GET /events`

---

### `GET /events/{id}` 🌐

Retourne un événement par son ID.

**Response 200 :** objet Event complet (avec `artists`, `votes`, `styles`)

---

### `POST /events` 🔒

Crée un événement.

**Request :**

```json
{
  "title": "Difract Night",
  "description": "Description",
  "location": "Paris",
  "address": "10 rue de la Paix, 75001 Paris",
  "event_date": "2026-05-15T22:00:00",
  "end_time": "2026-05-16T06:00:00",
  "price": 15.0,
  "status": "DRAFT",
  "style_ids": [1, 2],
  "type": "classic",
  "capacity": 300,
  "voting_start_date": "2026-01-01T00:00:00",
  "voting_end_date": "2026-01-29T00:00:00",
  "early_access_stock": 50,
  "standard_stock": 215,
  "last_minute_stock": 30
}
```

> `latitude` et `longitude` sont auto-géocodés depuis `address` (ou `location` si pas d'adresse)
> `type` : `classic` (défaut, capacity = 300 auto) ou `special`
> Si `type = classic` et `capacity` absent → 300 places appliquées automatiquement
> `voting_start_date`, `voting_end_date`, stocks par palier : optionnels, configurables depuis le back-office

**Response 201 :** objet Event créé

---

### `PUT /events/{id}` 🔒

Met à jour un événement (champs partiels acceptés).

**Request :** mêmes champs que POST, tous optionnels

**Response 200 :** objet Event mis à jour

---

### `DELETE /events/{id}` 🔒

Supprime un événement.

**Response 200 :** `{ "message": "Event deleted successfully" }`

---

### `POST /events/{eventId}/cover-image` 🔒

Upload l'image de couverture d'un événement.

**Request :** `multipart/form-data`

```
image: <fichier image, max 5MB, jpeg/png/jpg/gif>
```

**Response 200 :**

```json
{
  "message": "Cover image uploaded successfully",
  "image_url": "https://apidifract.kazllrd.fr/storage/media/events/1/cover/uuid.jpg"
}
```

---

### `GET /events/{eventId}/artists` 🌐

Liste les artistes inscrits à un événement.

**Response 200 :** `[{ /* objet User (ARTIST) */ }, ...]`

---

### `GET /events/{eventId}/friends-going` 🔒

Liste les amis (follows) qui vont à un événement.

**Response 200 :** `[{ /* objet User */ }, ...]`

---

## 5. Artists

### Table : `users` (role = ARTIST), `artist_event`

---

### `GET /artists` 🌐

Liste tous les artistes.

**Response 200 :** `[{ /* objet User avec role = ARTIST */ }, ...]`

> **Tracks audio :** les tracks sont présentes mais sans `url` ni `path` pour les visiteurs. Le titre est retourné pour afficher la liste. Si le visiteur clique sur play → afficher une popup "Créez un compte pour écouter".

---

### `GET /artists/top` 🌐

Liste les artistes triés par nombre de votes (top artistes).

**Response 200 :** `[{ /* objet User */ }, ...]`

> **Tracks audio :** même comportement que `GET /artists` — `url` et `path` masqués sans token, titre retourné.

---

### `GET /artists/{userId}` 🌐

Retourne un artiste par son ID.

**Response 200 :** `{ /* objet User (ARTIST) */ }`

> **Tracks audio :** même comportement que `GET /artists` — `url` et `path` masqués sans token, titre retourné.

---

### `GET /artists/{userId}/detail` 🌐

Retourne les détails d'un artiste avec distance optionnelle.

**Query params :** `lat`, `lng`

**Response 200 :**

```json
{
  "id": 5,
  "name": "DJ John",
  "bio": "...",
  "city": "Paris",
  "votes_count": 42,
  "distance_km": 3.2,
  "styles": [{ "id": 1, "name": "House", "pivot": { "is_primary": true } }],
  "media": [
    /* tableau Media */
  ],
  "social_links": [
    /* tableau SocialLink */
  ]
}
```

---

### `GET /artists/{userId}/events` 🌐

Liste les événements d'un artiste.

**Response 200 :** `[{ /* objet Event */ }, ...]`

---

### `POST /artists/register` 🔒

Inscrit l'artiste connecté à un événement.

**Request :**

```json
{
  "event_id": 3
}
```

**Response 200 :**

```json
{
  "message": "Artist registered to event successfully"
}
```

---

### `POST /artists/unregister` 🔒

Désinscrit l'artiste connecté d'un événement.

**Request :**

```json
{
  "event_id": 3
}
```

**Response 200 :**

```json
{
  "message": "Artist unregistered from event successfully"
}
```

---

### `GET /artists/{userId}/styles` 🌐

Retourne les styles d'un artiste.

**Response 200 :**

```json
[
  { "id": 1, "name": "House", "pivot": { "is_primary": true } },
  { "id": 2, "name": "Techno", "pivot": { "is_primary": false } }
]
```

---

### `PUT /artists/{userId}/styles` 🔒

Met à jour les styles d'un artiste (usage admin).

**Request :**

```json
{
  "primary_style_id": 1,
  "secondary_style_ids": [2, 3]
}
```

**Response 200 :** tableau de styles mis à jour (même format que `GET /me/styles`)

---

### `GET /artists/{userId}/comments` 🌐

Liste les commentaires sur un artiste.

**Response 200 :**

```json
[
  {
    "id": 1,
    "user_id": 3,
    "commentable_id": 5,
    "commentable_type": "App\\Models\\User",
    "body": "Super set !",
    "created_at": "2026-02-28T10:00:00.000000Z",
    "user": { "id": 3, "name": "Fan123" }
  }
]
```

---

### `POST /artists/{userId}/comments` 🔒

Ajoute un commentaire sur un artiste.

**Request :**

```json
{
  "body": "Super set !"
}
```

**Response 201 :** objet Comment créé

---

### `DELETE /artists/{userId}/comments/{commentId}` 🔒

Supprime un commentaire sur un artiste (auteur uniquement).

**Response 200 :** `{ "message": "Comment deleted" }`

---

## 6. Votes

### Table : `votes`

---

### `GET /votes` 🌐

Liste les votes avec filtres.

**Query params :**
| Param | Type | Description |
|-------|------|-------------|
| `user_id` | integer | Filtrer par votant |
| `artist_id` | integer | Filtrer par artiste |
| `event_id` | integer | Filtrer par événement |

> Pour vérifier si l'utilisateur a déjà voté pour un artiste dans un event :
> `GET /votes?user_id=1&artist_id=5&event_id=2`

**Response 200 :** `[{ "id": 1, "user_id": 1, "artist_id": 5, "event_id": 2, ... }]`

---

### `POST /votes` 🔒

Vote pour un artiste dans un événement.

**Request :**

```json
{
  "artist_id": 5,
  "event_id": 2
}
```

**Response 201 :**

```json
{
  "id": 1,
  "user_id": 1,
  "artist_id": 5,
  "event_id": 2,
  "created_at": "2026-02-28T10:00:00.000000Z"
}
```

**Response 422 (votes fermés) :**

```json
{
  "message": "Voting is not open for this event."
}
```

---

### `GET /votes/{id}` 🌐

Retourne un vote par son ID.

---

### `DELETE /votes/{id}` 🔒

Supprime un vote (annuler son vote).

**Response 200 :** `{ "message": "Vote deleted successfully" }`

---

## 7. Styles musicaux

### Table : `styles`, `user_styles`, `event_style`

---

### `GET /styles` 🌐

Liste tous les styles musicaux disponibles.

**Response 200 :**

```json
[
  { "id": 1, "name": "House" },
  { "id": 2, "name": "Techno" },
  { "id": 3, "name": "Drum & Bass" }
]
```

---

## 8. Media

### Table : `media`

---

### `GET /media` 🔒

Retourne tous les médias de l'utilisateur connecté, groupés par catégorie.

**Response 200 :**

```json
{
  "profile_picture": {
    "id": 1,
    "user_id": 1,
    "type": "IMAGE",
    "role": "PROFILE",
    "url": "https://apidifract.kazllrd.fr/storage/media/...",
    "is_primary": true,
    "position": 0,
    "created_at": "2026-02-28T10:00:00.000000Z"
  },
  "gallery": [
    {
      "id": 2,
      "type": "IMAGE",
      "role": "GALLERY",
      "url": "https://apidifract.kazllrd.fr/storage/media/...",
      "is_primary": false,
      "position": 0
    }
  ],
  "tracks": [
    {
      "id": 3,
      "type": "AUDIO",
      "role": "TRACK",
      "title": "Mon premier morceau",
      "url": "https://apidifract.kazllrd.fr/storage/media/...",
      "position": 0
    }
  ],
  "intro_video": {
    "id": 4,
    "type": "VIDEO",
    "role": "INTRO_VIDEO",
    "url": "https://apidifract.kazllrd.fr/storage/media/..."
  }
}
```

> Chaque clé peut être `null` (pas de photo de profil, pas de vidéo) ou `[]` (galerie / tracks vides).
> `type` : `IMAGE`, `AUDIO`, `VIDEO`
> `role` : `PROFILE`, `GALLERY`, `TRACK`, `INTRO_VIDEO`

---

### `POST /media/profile-picture` 🔒

Upload la photo de profil.

**Request :** `multipart/form-data`

```
image: <fichier image, max 5MB, jpeg/png/jpg/gif>
```

**Response 201 :**

```json
{
  "message": "Profile picture uploaded successfully",
  "media": {
    "id": 1,
    "type": "IMAGE",
    "role": "PROFILE",
    "url": "https://apidifract.kazllrd.fr/storage/media/...",
    "is_primary": true
  }
}
```

---

### `POST /media/gallery` 🔒

Upload des images de galerie (plusieurs possibles).

**Request :** `multipart/form-data`

```
images[]: <fichier image, max 5MB, jpeg/png/jpg/gif>
images[]: <fichier image, max 5MB, jpeg/png/jpg/gif>
```

> Max **10 images** par requête.

**Response 201 :**

```json
{
  "message": "2 images uploaded successfully",
  "media": [
    { "id": 2, "url": "https://...", "position": 0 },
    { "id": 3, "url": "https://...", "position": 1 }
  ]
}
```

---

### `POST /media/tracks` 🔒

Upload des fichiers audio (tracks).

**Request :** `multipart/form-data`

```
tracks[]: <fichier audio, max 20MB, mp3/wav/ogg>
titles[]: <titre du morceau (optionnel), string max 255 chars>
```

> Max **4 tracks** par requête.
> `titles[]` est optionnel. Chaque titre correspond au fichier au même index. Si omis, le titre sera `null`.

**Response 201 :**

```json
{
  "message": "2 tracks uploaded successfully",
  "media": [
    {
      "id": 5,
      "title": "Mon premier morceau",
      "url": "https://...",
      "path": "media/tracks/...",
      "position": 0
    },
    {
      "id": 6,
      "title": null,
      "url": "https://...",
      "path": "media/tracks/...",
      "position": 1
    }
  ]
}
```

---

### `POST /media/intro-video` 🔒

Upload une vidéo d'introduction.

**Request :** `multipart/form-data`

```
video: <fichier vidéo, max 50MB, mp4/mov/avi>
```

**Response 201 :**

```json
{
  "message": "Intro video uploaded successfully",
  "media": {
    "id": 7,
    "type": "VIDEO",
    "role": "INTRO_VIDEO",
    "url": "https://apidifract.kazllrd.fr/storage/media/..."
  }
}
```

---

### `DELETE /media/{mediaId}` 🔒

Supprime un média.

**Response 200 :** `{ "message": "Media deleted successfully" }`

---

### `PUT /media/reorder` 🔒

Réordonne les médias de galerie ou les tracks.

**Request :**

```json
{
  "type": "IMAGE",
  "role": "GALLERY",
  "order": [3, 1, 2]
}
```

> `type` : `IMAGE` (galerie) ou `AUDIO` (tracks)
> `role` : `GALLERY` ou `TRACK`
> `order` : tableau d'IDs de médias dans l'ordre désiré (position 0 en premier)

**Response 200 :** `{ "message": "Media reordered successfully" }`

---

## 9. Social Links

### Table : `social_links`

---

### `GET /artists/{user}/social-links` 🌐

Retourne les liens sociaux publics d'un artiste.

**Response 200 :**

```json
{
  "soundcloud": "https://soundcloud.com/johndoe",
  "spotify": null,
  "deezer": null,
  "youtube": null,
  "tiktok": null,
  "instagram": "https://instagram.com/johndoe"
}
```

---

## 10. Favoris

### Table : `favorites`

> Uniquement les artistes favoris. Les favoris d'événements ont été supprimés — utiliser `GET /me/votes` pour la page "Vos votes".

---

### `GET /me/favorites/artists` 🔒

Liste les artistes favoris de l'utilisateur connecté.

**Response 200 :** `[{ /* objet User (ARTIST) */ }, ...]`

---

### `POST /me/favorites/artists/{id}` 🔒

Ajoute un artiste aux favoris.

**Response 200 :** `{ "message": "Artist added to favorites" }`

---

### `DELETE /me/favorites/artists/{id}` 🔒

Retire un artiste des favoris.

**Response 200 :** `{ "message": "Artist removed from favorites" }`

---

## 11. Follows (amis)

### Table : `follows`

---

### `GET /me/friends` 🔒

Liste les utilisateurs que l'utilisateur connecté suit.

**Response 200 :** `[{ /* objet User */ }, ...]`

---

### `GET /me/friends/count` 🔒

Retourne le nombre d'amis.

**Response 200 :** `{ "count": 15 }`

---

### `POST /me/friends/{userId}` 🔒

Suivre un utilisateur.

**Response 200 :** `{ "message": "User followed successfully" }`

---

### `DELETE /me/friends/{userId}` 🔒

Ne plus suivre un utilisateur.

**Response 200 :** `{ "message": "User unfollowed successfully" }`

---

## 12. Commentaires

### Table : `comments` (polymorphique)

---

### `GET /events/{eventId}/comments` 🌐

Liste les commentaires d'un événement.

**Response 200 :**

```json
[
  {
    "id": 1,
    "user_id": 3,
    "body": "Super event !",
    "created_at": "2026-02-28T10:00:00.000000Z",
    "user": { "id": 3, "name": "Fan123" }
  }
]
```

---

### `POST /events/{eventId}/comments` 🔒

Ajoute un commentaire sur un événement.

**Request :**

```json
{
  "body": "Super event !"
}
```

**Response 201 :** objet Comment créé

---

### `DELETE /events/{eventId}/comments/{commentId}` 🔒

Supprime un commentaire (auteur uniquement).

**Response 200 :** `{ "message": "Comment deleted" }`

---

## 13. Push Tokens

> Voir section [2. Utilisateur connecté — Push Tokens](#post-mepush-token-)

---

## 14. Abonnements (LemonSqueezy)

### Table : `subscriptions` (gérée par le package LS)

> Routes réservées aux utilisateurs avec `role = ARTIST`

---

### `POST /subscription/checkout` 🔒

Génère une URL de checkout pour s'abonner.

**Request :**

```json
{
  "plan": "standard"
}
```

> `plan` : `standard` (4,99€/mois) ou `pro` (8,99€/mois)

**Response 200 :**

```json
{
  "checkout_url": "https://difract.lemonsqueezy.com/checkout/..."
}
```

---

### `GET /subscription/status` 🔒

Retourne le statut de l'abonnement actuel.

**Response 200 :**

```json
{
  "subscribed": true,
  "plan": "standard",
  "status": "active",
  "renews_at": "2026-03-28T10:00:00.000000Z",
  "ends_at": null
}
```

---

### `POST /subscription/cancel` 🔒

Annule l'abonnement (reste actif jusqu'à la fin de la période).

**Response 200 :** `{ "message": "Subscription cancelled" }`

---

### `POST /subscription/resume` 🔒

Réactive un abonnement annulé.

**Response 200 :** `{ "message": "Subscription resumed" }`

---

### `GET /subscription/portal` 🔒

Retourne l'URL du portail client LemonSqueezy.

**Response 200 :**

```json
{
  "url": "https://app.lemonsqueezy.com/billing/..."
}
```

---

## 15. Billetterie (LemonSqueezy)

### Table : `tickets`

Les billets sont liés à des événements spécifiques. Chaque palier a un **stock limité** défini par l'admin, en plus de la capacité globale de l'événement.

**Paliers de prix :**
| Palier | Période | Prix sans assurance | Prix avec assurance |
|--------|---------|---------------------|---------------------|
| `early_access` | `voting_end_date` → `voting_end_date + 5j` | 20 € | 22,99 € |
| `standard` | `event_date - 20j` → `event_date - 5j` | 25 € | 27,99 € |
| `last_minute` | `event_date - 4j` → `event_date` | 30 € | 32,99 € |

> Des **fenêtres mortes** existent entre les paliers. La vente est fermée durant ces intervalles.

---

### `GET /events/{eventId}/ticket-price` 🔒

Retourne le prix actuel et la disponibilité des billets pour un événement.

**Response 200 (vente ouverte) :**

```json
{
  "sale_available": true,
  "reason": null,
  "sale_opens_at": null,
  "tier": "early_access",
  "price": 20.0,
  "capacity": 300,
  "sold": 12,
  "available": 288,
  "tier_stock": 50,
  "tier_sold": 12,
  "tier_available": 38
}
```

> `sale_available` = `false` si stock global OU stock du palier épuisé.
> `tier_stock` / `tier_sold` / `tier_available` : stats du palier actif uniquement.
> Ces champs sont `null` si le stock du palier n'a pas été configuré.

**Response 200 (vente fermée — votes encore ouverts) :**

```json
{
  "sale_available": false,
  "reason": "voting_open",
  "sale_opens_at": "2026-01-29T00:00:00.000000Z",
  "tier": null,
  "price": null,
  "capacity": 300,
  "sold": 0,
  "available": 300
}
```

> `sale_opens_at` = `voting_end_date` (ouverture Early Access à la clôture des votes)

**Response 200 (vente fermée — fenêtre morte ou événement passé) :**

```json
{
  "sale_available": false,
  "reason": "sale_closed",
  "sale_opens_at": null,
  "tier": null,
  "price": null,
  "capacity": 300,
  "sold": 278,
  "available": 22
}
```

---

### `POST /events/{eventId}/tickets/checkout` 🔒

Génère une URL de checkout LemonSqueezy pour acheter un billet.

**Request :**

```json
{
  "has_insurance": false
}
```

> `has_insurance` : `true` = +2,99€, active le remboursement garanti

**Response 200 :**

```json
{
  "checkout_url": "https://difract.lemonsqueezy.com/checkout/buy/...",
  "tier": "early_access",
  "price": 20.0,
  "has_insurance": false
}
```

**Response 422 (stock du palier épuisé) :**

```json
{
  "message": "Il n'y a plus de billets early_access disponibles pour cet événement."
}
```

**Response 409 (déjà un billet) :**

```json
{
  "message": "Vous avez déjà un billet pour cet événement."
}
```

**Response 422 (vente indisponible) :**

```json
{
  "message": "La vente de billets n'est pas disponible pour cet événement."
}
```

> Après paiement, le webhook LemonSqueezy crée automatiquement le billet en base avec `status = confirmed` et un `qr_code` UUID unique.

---

### `POST /tickets/{qrCode}/scan` 🔒

Valide un billet à l'entrée de l'événement (scan du QR code). Usage réservé aux organisateurs.

**Route :** `POST /api/tickets/550e8400-e29b-41d4-a716-446655440000/scan`

**Response 200 (billet valide) :**

```json
{
  "valid": true,
  "reason": null,
  "ticket": {
    "id": 1,
    "tier": "early_access",
    "price": "20.00",
    "scanned_at": "2026-05-15T22:05:00.000000Z",
    "event": {
      "id": 3,
      "title": "Difract Night",
      "event_date": "2026-05-15T22:00:00.000000Z"
    },
    "holder": {
      "id": 1,
      "name": "John Doe"
    }
  }
}
```

**Response 409 (déjà scanné) :**

```json
{
  "valid": false,
  "reason": "Billet déjà utilisé.",
  "scanned_at": "2026-05-15T22:05:00.000000Z",
  "ticket": {
    /* ... */
  }
}
```

**Response 422 (non confirmé) :**

```json
{
  "valid": false,
  "reason": "Billet non confirmé (statut : pending).",
  "ticket": {
    /* ... */
  }
}
```

**Response 404 :**

```json
{
  "valid": false,
  "reason": "Billet introuvable."
}
```

---

## Codes d'erreur HTTP

| Code | Signification                                |
| ---- | -------------------------------------------- |
| 200  | Succès                                       |
| 201  | Créé                                         |
| 400  | Mauvaise requête                             |
| 401  | Non authentifié (token manquant ou invalide) |
| 403  | Accès interdit (mauvais rôle ou permission)  |
| 404  | Ressource introuvable                        |
| 409  | Conflit (doublon)                            |
| 422  | Données invalides (validation)               |
| 500  | Erreur serveur                               |

## Format des erreurs de validation (422)

```json
{
  "message": "The email field is required.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```
