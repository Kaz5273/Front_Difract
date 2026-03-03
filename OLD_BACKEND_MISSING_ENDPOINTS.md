# Difract Backend - Endpoints & Fonctionnalités Manquantes

> Analyse complète du frontend (screens, components, services, hooks)
> Date : 27 février 2026

---

## Résumé

| Priorité   | Nb de points | Description                                                |
| ---------- | ------------ | ---------------------------------------------------------- |
| 🔴 Haute   | 8            | Bloquant pour le fonctionnement du frontend                |
| 🟠 Urgente | 1            | Configuration requise (paiement non fonctionnel sans elle) |
| 🟡 Moyenne | 8            | Nécessaire mais contournable                               |
| 🟢 Basse   | 4            | Amélioration / confort                                     |

---

## 🔴 Priorité Haute

### 1. Endpoint de liste des artistes

**Manque** : Le frontend appelle `GET /api/artists` et `GET /api/artists/{id}` mais ces routes n'existent pas.

Actuellement le seul moyen d'obtenir les artistes est :

- `GET /api/users` → retourne tous les users, il faut filtrer `role = ARTIST` côté client
- `GET /api/artists/{userId}/detail` → 1 artiste à la fois avec distance

**À ajouter** :

```
GET /api/artists
    → Retourne la liste des users avec role = ARTIST
    → Paramètres optionnels suggérés : ?style_id=X, ?event_id=X, ?lat=X&lng=X

GET /api/artists/{userId}
    → Alias de GET /api/artists/{userId}/detail
    → (ou redirection 301 vers /detail)
```

---

### 2. Filtres sur `GET /api/votes`

**Manque** : `GET /api/votes` retourne tous les votes sans possibilité de filtrage. Le frontend a besoin de :

- savoir si un user a déjà voté pour un artiste dans un événement (**has-voted check**)
- récupérer les votes d'un user précis
- récupérer les votes reçus par un artiste

**À ajouter** : Support de query parameters sur `GET /api/votes`

```
GET /api/votes?user_id=5               → votes émis par l'user 5
GET /api/votes?artist_id=2             → votes reçus par l'artiste 2
GET /api/votes?event_id=1              → tous les votes d'un événement
GET /api/votes?user_id=5&event_id=1    → votes de l'user 5 pour un événement
GET /api/votes?user_id=5&artist_id=2&event_id=1  → has-voted check (retourne [] ou [vote])
```

---

### 3. `GET /api/events/upcoming`

**Manque** : Le frontend appelle cet endpoint pour afficher les prochains événements (page d'accueil).

**À ajouter** :

```
GET /api/events/upcoming
    → Retourne les événements dont event_date > maintenant ET status = PUBLISHED
    → Triés par event_date ASC
    → Paramètre optionnel suggéré : ?limit=10
```

> ⚠️ Attention au conflit de route : définir `/events/upcoming` **avant** `/events/{eventId}` dans le routeur Laravel pour éviter qu'`upcoming` soit interprété comme un `{eventId}`.

---

### 4. `GET /api/artists/top`

**Manque** : Le frontend appelle `GET /api/artists/top` pour afficher les artistes les plus populaires (classement par `votes_count`). Cet endpoint n'existe pas.

**À ajouter** :

```
GET /api/artists/top
    → Retourne les users avec role = ARTIST triés par votes_count DESC
    → Paramètre optionnel : ?limit=10
    → Inclure primary_style, votes_count, distance_km si lat/lng fournis
```

> ⚠️ Attention au conflit de route : définir `/artists/top` **avant** `/artists/{userId}` dans le routeur Laravel.

---

### 5. `POST /api/users/become-artist`

**Manque** : Permet à un utilisateur avec `role = PUBLIC` de basculer en `ARTIST` en complétant son profil artiste. Le frontend appelle ce endpoint mais il n'existe pas.

**À ajouter** :

```
POST /api/users/become-artist
    Headers : Authorization: Bearer {token}
    Body :
    {
      "primary_style_id": integer (required),
      "secondary_style_ids": array (optional, max 3),
      "city": string (optional),
      "postal_code": string (optional),
      "started_year": integer (optional),
      "professions": array (optional),
      "plays_with_others": boolean (optional)
    }

    → Met à jour role = ARTIST sur l'user connecté
    → Crée ou met à jour la ligne artist_profiles
    → Attache les styles
    → Retourne l'user mis à jour
```

---

### 6. Système de favoris — artistes et événements

**Manque** : Deux écrans dédiés existent dans le frontend :

- `favorites.tsx` — écran « Vos stars » = artistes mis en favori
- `favorite-events.tsx` — écran « Events intéressé.e.s » = événements favoris

Actuellement les boutons ❤️ utilisent du state local uniquement (`setIsFavorite(!isFavorite)`). Aucune table ni endpoint backend n'existe pour persister ces favoris.

**À ajouter** :

```sql
-- Migration
CREATE TABLE favorites (
  id            INT PK AUTO_INCREMENT,
  user_id       INT FK users.id (NOT NULL),
  favoritable_id   INT (NOT NULL),
  favoritable_type ENUM('artist', 'event') (NOT NULL),
  created_at    TIMESTAMP,
  UNIQUE(user_id, favoritable_id, favoritable_type)
);
```

```
-- Artistes favoris
GET    /api/me/favorites/artists        → Liste des artistes favoris
POST   /api/me/favorites/artists/{id}   → Ajouter un artiste en favori
DELETE /api/me/favorites/artists/{id}   → Retirer un artiste des favoris

-- Événements favoris / “je suis intéressé.e”
GET    /api/me/favorites/events         → Liste des événements intéressants
POST   /api/me/favorites/events/{id}    → Marquer un événement comme intéressant
DELETE /api/me/favorites/events/{id}    → Retirer l’événement des intérêts
```

---

### 7. Système social — amis / abonnements

**Manque** : Le frontend affiche partout des fonctionnalités sociales qui n’ont aucun support backend :

- `profile.tsx` : `friendsCount = 0` avec commentaire _« Ces champs seront à ajouter dans l’API plus tard »_
- `FriendsCard` component : bouton « Ajouter des ami.e.s »
- `EventCard` : champs `friendsGoing` et `friendsAvatars` (mock) — qui parmi mes amis va à cet événement
- `favorite-events.tsx` : même logique « amis qui y vont »

**À ajouter** :

```sql
-- Migration
CREATE TABLE follows (
  id           INT PK AUTO_INCREMENT,
  follower_id  INT FK users.id,
  followed_id  INT FK users.id,
  created_at   TIMESTAMP,
  UNIQUE(follower_id, followed_id),
  CHECK(follower_id != followed_id)
);
```

```
GET    /api/me/friends                  → Liste des amis / personnes suivies
POST   /api/me/friends/{userId}         → Suivre un utilisateur
DELETE /api/me/friends/{userId}         → Se désabonner
GET    /api/me/friends/count            → Nombre d’amis (pour les stats profil)
GET    /api/events/{eventId}/friends-going  → Amis intéressés par cet événement
```

---

## 🟠 Configuration Urgente

### 8. Système d'abonnement LemonSqueezy — configuration requise

**Statut** : Les 5 endpoints subscription sont **documentés et codés** côté backend (`POST /subscription/checkout`, `GET /subscription/status`, etc.). Cependant, le flux de paiement **ne peut pas fonctionner** sans une configuration côté serveur.

**Ce qui manque** (non-fonctionnel si absent) :

| Élément                          | Description                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------- |
| `LEMON_SQUEEZY_API_KEY`          | Clé API LemonSqueezy dans le `.env` backend                                       |
| `LEMON_SQUEEZY_STORE`            | ID du store LemonSqueezy                                                          |
| `LEMON_SQUEEZY_VARIANT_STANDARD` | ID de la variante plan standard (€4.99/mois)                                      |
| `LEMON_SQUEEZY_VARIANT_PRO`      | ID de la variante plan pro (€8.99/mois)                                           |
| `LEMON_SQUEEZY_SIGNING_SECRET`   | Secret pour vérifier les webhooks entrants                                        |
| Webhook enregistré               | URL `POST /api/webhooks/lemon-squeezy` enregistrée dans le dashboard LemonSqueezy |

**Flow complet** (à vérifier que chaque étape fonctionne) :

```
1. Frontend appelle POST /api/subscription/checkout { plan: "standard" }
2. Backend génère un lien LemonSqueezy → retourne { checkout_url }
3. Frontend ouvre checkout_url dans un WebView/navigateur
4. Utilisateur paie sur LemonSqueezy
5. LemonSqueezy envoie un webhook → POST /api/webhooks/lemon-squeezy
6. Backend reçoit le webhook et active l'abonnement en base
7. GET /api/subscription/status retourne { subscribed: true, ... }
```

> Sans le webhook (étape 5-6), le paiement est effectué mais l'abonnement ne s'active jamais côté backend.

---

## 🟡 Priorité Moyenne

### 9. Recherche full-text — artistes et événements

**Manque** : L’écran `search.tsx` a une barre de recherche avec `searchQuery` state et un filtre par style musical. Aucun endpoint de recherche n’existe actuellement.

**À ajouter** :

```
GET /api/artists?q=choi               → Recherche d’artistes par nom
GET /api/artists?style_id=2           → Filtrage par style musical
GET /api/artists?q=choi&style_id=2    → Combinaison

GET /api/events?q=festival            → Recherche d’événements par titre ou lieu
GET /api/events?style_id=2            → Filtrage événements par style
GET /api/events?date=2026-06-06       → Filtrage par date (paramètre CalendarBadge)
GET /api/events?status=PUBLISHED      → Filtrage par statut
```

Ces filtres s’ajoutent aux `GET /api/artists` et `GET /api/events` existants — pas de nouvelle route, juste support des query params.

---

### 10. Géolocalisation des événements

**Manque** : Les écrans Events et Votes affichent un `LocationBadge` « Annecy » pour filtrer les événements proches. Les cartes d’événements affichent `distance: "150km"` (mock). Le modèle `events` n’a pas de champs de coordonnées.

**À ajouter** :

```sql
-- Migration
ALTER TABLE events
  ADD COLUMN address     VARCHAR(255) NULL,
  ADD COLUMN latitude    DECIMAL(9,7) NULL,
  ADD COLUMN longitude   DECIMAL(9,7) NULL;
```

```
GET /api/events?lat=45.9&lng=6.1&radius=50   → Événements dans un rayon (km)
```

La réponse devrait inclure `distance_km` calculée comme pour `GET /api/artists/{id}/detail`.

---

### 11. Champs manquants sur le modèle `Event`

**Manque** : Le frontend utilise plusieurs champs qui ne sont pas dans la table `events` :

| Champ frontend            | Absent dans backend | Description                                                        |
| ------------------------- | ------------------- | ------------------------------------------------------------------ |
| `address`                 | Oui                 | Adresse détaillée affichée sur `event/[id].tsx`                    |
| `capacity`                | Oui                 | Nombre de places, obligatoire à la création (voir §12 Billetterie) |
| `time_range` / `end_time` | Oui                 | « 18h00 à 00h00 » affiché sur les cartes et le détail              |
| `ticket_url`              | Remplacé            | Géré par le système de billetterie dynamique §12                   |

**À ajouter** :

```sql
-- Migration
ALTER TABLE events
  ADD COLUMN address  VARCHAR(255) NULL,
  ADD COLUMN end_time DATETIME NULL;
-- capacity couvert par le système billetterie (§12)
-- lat/lng couverts par la géolocalisation (§10)
```

---

### 12. Système de billetterie dynamique

**Contexte** : À la création d’un événement, l’organisateur définit un nombre de places (`capacity`). Les billets **ne sont disponibles qu’après la clôture des votes** (`is_voting_open = false`). Le paiement est géré via **LemonSqueezy** (même intégration que les abonnements).

---

#### Cycle de vie

```
1. Événement créé  →  votes ouverts        →  vente FERMÉE
2. Votes clôturés (event_date - 7j)  →  vente OUVERTE
3. event_date - 24h               →  vente FERMÉE définitivement
```

---

#### Produits LemonSqueezy à créer (4 produits one-time)

| Produit LS             | Prix    | Description                              |
|------------------------|---------|------------------------------------------|
| `ticket-early-bird`    | 20 €    | Billet, votes clôturés > 30j avant event   |
| `ticket-standard`      | 25 €    | Billet, votes clôturés entre 30j et 7j     |
| `ticket-last-minute`   | 30 €    | Billet, votes clôturés entre 7j et 24h     |
| `ticket-insurance`     | 2,99 €  | Assurance remboursement (optionnelle)     |

---

#### Paliers de prix

| Palier      | Condition                                | Prix     |
|-------------|------------------------------------------|----------|
| Early bird  | `is_voting_open = false` + > 30j avant   | **20 €** |
| Standard    | `is_voting_open = false` + 30j – 7j avant  | **25 €** |
| Last minute | `is_voting_open = false` + 7j – 24h avant  | **30 €** |
| Fermé       | Votes encore ouverts OU < 24h avant      | —        |

---

#### Assurance remboursement (2,99 €)

- Option **facultative** proposée à l’achat du billet
- **Sans assurance** : aucun remboursement possible, quelle que soit la raison
- **Avec assurance** : remboursement du billet garanti (hors frais d’assurance)
- Achetée **séparément** dans LS (2 commandes distinctes) ou regroupée si LS le permet

**Logique de remboursement** :

```
si ticket.has_insurance = false  → 403 Forbidden (aucun remboursement sans assurance)
si ticket.status = 'CANCELLED'   → 409 (déjà annulé)
si event_date < now()            → 403 (event passé, trop tard)

sinon :
  1. Appel API LS : POST /v1/refunds { order_id: ticket.ls_order_id }
  2. ticket.status = 'CANCELLED'
  3. Libération de la place (sold--)
```

---

#### Webhooks LemonSqueezy à écouter

| Événement LS      | Action backend                                                    |
|-----------------|-------------------------------------------------------------------|
| `order_created` | Créer ticket en base (`PAID`), décrémenter `capacity`, générer QR   |
| `order_refunded`| Passer ticket en `CANCELLED`, incrémenter places disponibles       |

**Metadata à passer dans le checkout LS** :

```json
{
  "custom_data": {
    "event_id": 42,
    "user_id": 7,
    "tier": "last_minute",
    "has_insurance": true
  }
}
```

---

#### Modification du modèle `Event`

```sql
ALTER TABLE events
  ADD COLUMN capacity INT NOT NULL DEFAULT 100;
```

#### Nouvelle table `tickets`

```sql
CREATE TABLE tickets (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  event_id       INT NOT NULL REFERENCES events(id),
  user_id        INT NOT NULL REFERENCES users(id),
  tier           ENUM('early_bird', 'standard', 'last_minute') NOT NULL,
  price_paid     DECIMAL(5,2) NOT NULL,
  has_insurance  BOOLEAN NOT NULL DEFAULT FALSE,
  ls_order_id    VARCHAR(255) NULL,         -- order_id LemonSqueezy
  status         ENUM('RESERVED', 'PAID', 'CANCELLED') DEFAULT 'RESERVED',
  purchased_at   TIMESTAMP,
  created_at     TIMESTAMP,
  updated_at     TIMESTAMP
);
```

---

#### Endpoints à ajouter

```
-- Prix actuel + état de la vente
GET  /api/events/{eventId}/ticket-price
     → { sale_available, sale_opens_at, tier, price, capacity, sold, available }

-- Initier l’achat (génère l’URL checkout LS)
POST /api/events/{eventId}/tickets/checkout
     Body : { has_insurance: boolean }
     → { checkout_url: string }  -- URL LemonSqueezy avec metadata injectée
     → Erreur 403 si votes encore ouverts
     → Erreur 403 si vente fermée (< 24h avant event)
     → Erreur 409 si plus de places

-- Billets de l’utilisateur connecté
GET  /api/me/tickets
     → [ { ticket_id, event, tier, price_paid, has_insurance, status } ]

GET  /api/me/tickets/{ticketId}
     → Détail complet + QR code

-- Remboursement (uniquement si has_insurance = true)
DELETE /api/me/tickets/{ticketId}
     → 204 si remboursement initiaé
     → 403 si pas d’assurance ou event passé
```

#### Modification de `POST /api/events`

```json
{
  "title":      "string (required)",
  "location":   "string (required)",
  "event_date": "datetime (required)",
  "capacity":   "integer (required, min 1)",
  "status":     "DRAFT|PUBLISHED|DONE (optional)",
  "style_ids":  "array (optional)"
}
```

> **Note frontend** : Le champ `sale_opens_at` (= `voting_close_date`) permet d’afficher un compte à rebours « Vente ouverte dans X jours » sur la page détail de l’event. L’écran `(tabs)/tickets.tsx` et le menu « Voir vos billets » dans `profile.tsx` sont déjà prévus dans la navigation.

---

### 13. Commentaires sur les artistes

**Manque** : L’écran `artist/[id].tsx` contient un bouton « Voir les commentaires » avec `console.log("Lien commentaires cliqué")`. Aucun système de commentaires n’existe dans le backend.

**À ajouter** :

```sql
-- Migration
CREATE TABLE comments (
  id              INT PK AUTO_INCREMENT,
  user_id         INT FK users.id (NOT NULL),
  commentable_id   INT (NOT NULL),
  commentable_type ENUM('artist', 'event') (NOT NULL),
  content         TEXT (NOT NULL),
  created_at      TIMESTAMP,
  updated_at      TIMESTAMP
);
```

```
GET    /api/artists/{userId}/comments          → Commentaires d’un artiste
POST   /api/artists/{userId}/comments          → Poster un commentaire
DELETE /api/artists/{userId}/comments/{id}     → Supprimer un commentaire (auteur ou admin)

-- Extension future (non dans le code actuel mais logique) :
GET    /api/events/{eventId}/comments          → Commentaires d’un événement
POST   /api/events/{eventId}/comments          → Poster un commentaire
```

---

### 14. Système de notifications

**Manque** : `settings.tsx` a un item « Notifications » dans le menu. Pour des notifications push (Expo Push Notifications), le backend doit stocker les tokens.

**À ajouter** :

```sql
-- Migration
CREATE TABLE push_tokens (
  id         INT PK AUTO_INCREMENT,
  user_id    INT FK users.id,
  token      VARCHAR(255),
  platform   ENUM('ios', 'android'),
  created_at TIMESTAMP,
  UNIQUE(token)
);
```

```
POST   /api/me/push-token               → Enregistrer le token push de l’appareil
DELETE /api/me/push-token               → Désinscrire (déconnexion)
GET    /api/me/notification-preferences → Préférences de notifications
PUT    /api/me/notification-preferences → Mettre à jour les préférences
```

---

### 15. Statistiques du profil utilisateur

**Manque** : `profile.tsx` affiche `friendsCount` et `eventsCount` avec valeurs à `0` et un commentaire _« Ces champs seront à ajouter dans l’API plus tard »_.

**À ajouter** (peut être calculé directement dans la réponse `GET /api/me`) :

```json
// Modifier la réponse GET /api/me pour inclure :
{
  "id": 1,
  "name": "...",
  "friends_count": 12,       // ← count de follows
  "events_count": 5,         // ← count d’événements auxquels l’user est inscrit/favori
  ...
}
```

---

### 16. Raccourcis `GET /api/me/votes` et `GET /api/me/received-votes`

**Manque** : Le frontend appelle `GET /api/users/my-votes` et `GET /api/users/received-votes`. Ces routes n'existent pas.

**À ajouter** (endpoints de confort, filtrages de `GET /votes` pour l'user connecté) :

```
GET /api/me/votes
    → Votes émis par l'utilisateur connecté
    → Équivalent de GET /api/votes?user_id={auth()->id()}

GET /api/me/received-votes
    → Votes reçus par l'artiste connecté (role = ARTIST uniquement)
    → Équivalent de GET /api/votes?artist_id={auth()->id()}
```

---

### 17. Champ `description` sur le modèle `Event`

**Manque** : Le frontend affiche une description pour chaque événement mais le modèle `events` n'a pas ce champ.

**À ajouter** :

```sql
-- Migration
ALTER TABLE events ADD COLUMN description TEXT NULL;
```

```json
// Réponse GET /api/events après modification
{
  "id": 1,
  "title": "Summer Festival 2026",
  "description": "Un festival incroyable...",
  ...
}
```

---

### 18. Image principale d'un événement dans la réponse API

**Manque** : Le frontend attend un `image_url` sur les événements. Actuellement les images sont dans la table `media` mais ne sont pas exposées via les endpoints événements.

**Option recommandée** : Inclure l'URL de l'image primaire dans la réponse des événements.

```json
// Modification de la réponse GET /api/events
{
  "id": 1,
  "title": "Summer Festival 2026",
  "image_url": "https://storage.../event-cover.jpg",  // ← URL du media GALLERY is_primary=true lié à l'event
  ...
}
```

> Cela suppose d'ajouter une relation `media()` sur le modèle `Event` ou de stocker directement un `cover_image_id` FK.

---

## 🟢 Priorité Basse

### 19. Inclure la relation `styles` dans `GET /api/events/{eventId}`

**Manque** : La réponse de `GET /api/events/{eventId}` devrait systématiquement inclure le tableau `styles` (styles musicaux de l'événement). Le frontend le consomme mais ce n'est pas toujours retourné.

**Vérification à faire** : S'assurer que `EventResource` inclut bien `styles` dans `toArray()`.

```json
// La réponse doit toujours inclure :
{
  "id": 1,
  "title": "...",
  "styles": [
    { "id": 1, "name": "Rock" },
    { "id": 3, "name": "Electro" }
  ],
  ...
}
```

---

### 20. `primary_style_id` et `secondary_style_ids` acceptés au `POST /api/register`

---

### 21. Système de parrainage

**Manque** : `profile.tsx` a un item de menu « Parrainez un.e ami.e.s ». Fonctionnalité non prioritaire mais à prévoir.

**À ajouter** (amplitude minimale) :

```
GET  /api/me/referral-code    → Obtenir son code de parrainage unique
POST /api/referral/use        → Utiliser un code de parrainage { code: "ABC123" }
```

---

### 22. Completion de profil (progression étapes)

**Manque** : `profile.tsx` affiche « Compléter votre profil (Ét apes 1/5) ». Le calcul de progression n’est pas défini côté backend.

**À prévoir** (champ calculé dans `GET /api/me`) :

```json
{
  "profile_completion": {
    "percentage": 20,
    "completed_steps": 1,
    "total_steps": 5,
    "missing": ["profile_picture", "bio", "social_links", "styles"]
  }
}
```

**Statut** : Déjà documenté dans `BACKEND_API_REFERENCE.md` — ces champs **sont acceptés** par le backend au register si `role = ARTIST`.

**Action** : Côté **frontend uniquement** — le formulaire d'inscription artiste doit envoyer ces champs. Aucune modification backend nécessaire, juste une vérification que le champ est bien validé et traité.

---

## Récapitulatif des routes à créer / configurer

| Méthode | Route                                           | Priorité   | Notes                                      |
| ------- | ----------------------------------------------- | ---------- | ------------------------------------------ |
| `GET`   | `/api/artists`                                  | 🔴 Haute   | Liste filtrée `role=ARTIST` + query params |
| `GET`   | `/api/artists/{id}`                             | 🔴 Haute   | Alias de `/artists/{id}/detail`            |
| `GET`   | `/api/artists/top`                              | 🔴 Haute   | Artistes triés par `votes_count` DESC      |
| `GET`   | `/api/events/upcoming`                          | 🔴 Haute   | Événements futurs publiés                  |
| `POST`  | `/api/users/become-artist`                      | 🔴 Haute   | Passage PUBLIC → ARTIST                    |
| `GET`   | `/api/votes?user_id=&artist_id=&event_id=`      | 🔴 Haute   | Filtres sur la liste des votes             |
| `*`     | `/api/me/favorites/artists`                     | 🔴 Haute   | Favoris artistes (GET/POST/DELETE)         |
| `*`     | `/api/me/favorites/events`                      | 🔴 Haute   | Favoris événements (GET/POST/DELETE)       |
| —       | Configuration LemonSqueezy + webhook            | 🟠 Urgente | Sans ça les abonnements ne s’activent pas  |
| `GET`   | `/api/me/votes`                                 | 🟡 Moyenne | Votes émis par l’user connecté             |
| `GET`   | `/api/me/received-votes`                        | 🟡 Moyenne | Votes reçus (ARTIST)                       |
| `*`     | `/api/me/friends`                               | 🟡 Moyenne | Système social / amis (GET/POST/DELETE)    |
| `GET`   | `/api/events/{id}/friends-going`                | 🟡 Moyenne | Amis allant à un événement                 |
| `GET`   | `/api/artists?q=&style_id=`                     | 🟡 Moyenne | Recherche + filtres artistes               |
| `GET`   | `/api/events?q=&style_id=&date=&lat=&lng=`      | 🟡 Moyenne | Recherche + filtres événements             |
| `*`     | `/api/artists/{id}/comments`                    | 🟡 Moyenne | Commentaires artistes (GET/POST/DELETE)    |
| `GET`   | `/api/events/{id}/ticket-price`                 | 🟡 Moyenne | Prix actuel + places disponibles           |
| `POST`  | `/api/events/{id}/tickets`                      | 🟡 Moyenne | Achat d'un billet (palier auto)            |
| `GET`   | `/api/me/tickets`                               | 🟡 Moyenne | Billets de l'utilisateur connecté          |
| —       | Table `tickets` + capacité sur `events`         | 🟡 Moyenne | Nouveau modèle + migration                 |
| —       | Migrations `events` (address, end_time…)        | 🟡 Moyenne | Nouveaux champs table events               |
| —       | Migration `events.description`                  | 🟡 Moyenne | Nouveau champ TEXT                         |
| —       | `image_url` dans réponse Event                  | 🟡 Moyenne | Via relation Media                         |
| `*`     | `/api/me/push-token`                            | 🟢 Basse   | Token push notifications                   |
| —       | `friends_count` + `events_count` dans `GET /me` | 🟢 Basse   | Stats profil                               |
| —       | `profile_completion` dans `GET /me`             | 🟢 Basse   | Calcul étapes profil complété              |
| —       | `styles` dans réponse `GET /events/{id}`        | 🟢 Basse   | Vérification EventResource                 |

---

## Routes appelées par le frontend avec le mauvais chemin (corrections frontend uniquement)

Ces routes sont **appelées par le frontend** mais pointent vers des chemins qui n'existent pas dans le backend. **Le backend n'a pas besoin de les créer** — c'est le service frontend qui doit être corrigé pour utiliser le bon endpoint.

| Appel frontend actuel                             | Endpoint backend réel                          | Fichier à corriger   |
| ------------------------------------------------- | ---------------------------------------------- | -------------------- |
| `GET /api/users/profile`                          | `GET /api/me`                                  | `user.service.ts`    |
| `PUT /api/users/profile`                          | `PUT /api/users/{userId}`                      | `user.service.ts`    |
| `GET /api/users/my-votes`                         | `GET /api/votes?user_id={id}`                  | `user.service.ts`    |
| `GET /api/users/received-votes`                   | `GET /api/votes?artist_id={id}`                | `user.service.ts`    |
| `POST /api/artists/{id}/vote`                     | `POST /api/votes`                              | `artists.service.ts` |
| `DELETE /api/artists/{id}/vote`                   | `DELETE /api/votes/{id}`                       | `artists.service.ts` |
| `GET /api/artists/{id}/has-voted`                 | `GET /api/votes?user_id=&artist_id=&event_id=` | `artists.service.ts` |
| `POST /api/events/{eventId}/artists`              | `POST /api/artists/register`                   | `events.service.ts`  |
| `DELETE /api/events/{eventId}/artists/{artistId}` | `POST /api/artists/unregister`                 | `events.service.ts`  |

---

## Ce qui n'a PAS besoin d'être modifié côté backend

Les points suivants sont des corrections **frontend uniquement** :

- Renommer `name` → `title` et `date` → `event_date` dans les types TypeScript
- Réécrire `artists.service.ts` pour utiliser les vrais endpoints existants
- Corriger `user.service.ts` (`getProfile` → utiliser `GET /me` déjà en place)
- Ajouter `CreateVoteRequest` et le champ `event_id` dans les types TypeScript
- Créer `media.service.ts` et `social-links.service.ts` (endpoints backend déjà disponibles)
- Compléter `styles.service.ts` (endpoints `GET /me/styles` et `PUT /me/styles` déjà disponibles)
