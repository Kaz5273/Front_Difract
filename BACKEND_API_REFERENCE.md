# Difract Backend - API Reference Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Models & Data Structures](#models--data-structures)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Error Handling](#error-handling)

---

## Introduction

This is a comprehensive API reference for the Difract backend. The backend is built with **Laravel Framework 12.0** and uses **PHP 8.4** (compatible with PHP 8.2+).

**Base URL**: `http://localhost:8000/api`

**Authentication**: Bearer Token (Sanctum)

---

## Models & Data Structures

### User Model
Represents a user in the system with roles: PUBLIC, ARTIST, or ADMIN.

**Table**: `users`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | Integer (PK) | User identifier | Auto |
| name | String (255) | User's name | Yes |
| email | String (255) | User's email (unique) | Yes |
| password | String | Hashed password | Yes |
| role | Enum | PUBLIC, ARTIST, ADMIN | Yes, default: PUBLIC |
| bio | Text | User biography | No |
| media_url | String | URL to profile media | No |
| votes_count | Integer | Total votes received (artists) | Auto, default: 0 |
| created_at | Timestamp | Creation date | Auto |
| updated_at | Timestamp | Last update date | Auto |

**Relationships**:
- `votes()`: HasMany → Vote (votes created by this user)
- `votesReceived()`: HasMany → Vote (votes for this artist)
- `events()`: BelongsToMany → Event (through artist_event table)
- `styles()`: BelongsToMany → Style (through artist_style table)
- `socialLinks()`: HasMany → SocialLink
- `media()`: HasMany → Media

**Main Methods**:
- `primaryStyle()`: Get primary style (ARTIST only)
- `secondaryStyles()`: Get secondary styles (array)

---

### Event Model
Represents a music event where artists can perform.

**Table**: `events`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | Integer (PK) | Event identifier | Auto |
| title | String (255) | Event name | Yes |
| location | String (255) | Event location | Yes |
| event_date | DateTime | Event date/time | Yes, must be future date |
| price | Decimal (5,2) | Event ticket price | No |
| status | Enum | DRAFT, PUBLISHED, DONE | Yes, default: DRAFT |
| created_at | Timestamp | Creation date | Auto |
| updated_at | Timestamp | Last update date | Auto |

**Computed/Appended Attributes**:
- `voting_close_date`: DateTime - Closes 7 days before event_date
- `voting_time_remaining`: Integer - Seconds until voting closes (0 if closed)
- `is_voting_open`: Boolean - Whether voting is still open

**Relationships**:
- `artists()`: BelongsToMany → User (through artist_event table)
- `votes()`: HasMany → Vote
- `styles()`: BelongsToMany → Style (through event_style table)

---

### Vote Model
Represents votes cast by PUBLIC users for ARTIST participants in events.

**Table**: `votes`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | Integer (PK) | Vote identifier | Auto |
| user_id | Integer (FK) | PUBLIC user casting vote | Yes |
| event_id | Integer (FK) | Event being voted on | Yes |
| artist_id | Integer (FK) | ARTIST user receiving vote | Yes |
| created_at | Timestamp | Creation date | Auto |
| updated_at | Timestamp | Last update date | Auto |

**Constraints**:
- `user_id`: Must be a user with role = 'PUBLIC'
- `artist_id`: Must be a user with role = 'ARTIST'
- `artist_id`: Must be registered to the event
- Cannot vote twice for same artist in same event
- Event voting must be open

**Relationships**:
- `user()`: BelongsTo → User (the voter)
- `event()`: BelongsTo → Event
- `artist()`: BelongsTo → User (the artist being voted for)

---

### Style Model
Represents music genres/styles that artists and events are tagged with.

**Table**: `styles`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | Integer (PK) | Style identifier | Auto |
| name | String (255) | Style name (e.g., "Rock", "Jazz") | Yes |
| created_at | Timestamp | Creation date | Auto |
| updated_at | Timestamp | Last update date | Auto |

**Relationships**:
- `artists()`: BelongsToMany → User (through artist_style table with is_primary pivot)
- `events()`: BelongsToMany → Event (through event_style table)

**Pivot Attributes**:
- `artist_style.is_primary`: Boolean - Whether this is the artist's primary style

---

### Media Model
Stores files uploaded by artists (photos, tracks, videos, etc).

**Table**: `media`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | Integer (PK) | Media identifier | Auto |
| user_id | Integer (FK) | Artist who owns media | Yes |
| type | Enum | IMAGE, VIDEO, AUDIO | Yes |
| role | Enum | PROFILE_PICTURE, GALLERY, TRACK, INTRO_VIDEO | Yes |
| path | String | Storage path | Yes |
| is_primary | Boolean | Is primary media for role | No, default: false |
| position | Integer | Order position | No |
| created_at | Timestamp | Creation date | Auto |
| updated_at | Timestamp | Last update date | Auto |

**Media Type & Role Combinations**:
- IMAGE + PROFILE_PICTURE: Profile photo
- IMAGE + GALLERY: Gallery images
- AUDIO + TRACK: Music tracks
- VIDEO + INTRO_VIDEO: Introduction video

**Computed Attributes**:
- `url`: Full public URL to media file
- `fullPath`: Full storage path

**Relationships**:
- `user()`: BelongsTo → User

**File Size Limits**:
- Images: 5MB max, formats: jpeg, png, jpg, gif
- Tracks: 20MB max per file, formats: mp3, wav, ogg (max 20 files)
- Intro Video: 100MB max (if configured)

---

### SocialLink Model
Social media profiles for artists.

**Table**: `social_links`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | Integer (PK) | Link identifier | Auto |
| user_id | Integer (FK) | Artist who owns link | Yes |
| platform | Enum | SOUNDCLOUD, SPOTIFY, DEEZER, APPLE_MUSIC, YOUTUBE, INSTAGRAM, FACEBOOK | Yes |
| url | String | Link URL | Yes |
| created_at | Timestamp | Creation date | Auto |
| updated_at | Timestamp | Last update date | Auto |

**Available Platforms**:
- `soundcloud` → SOUNDCLOUD
- `spotify` → SPOTIFY
- `deezer` → DEEZER
- `apple_music` → APPLE_MUSIC
- `youtube` → YOUTUBE
- `instagram` → INSTAGRAM
- `facebook` → FACEBOOK

**Relationships**:
- `user()`: BelongsTo → User

---

### ArtistProfile Model
Extended profile information for ARTIST users.

**Table**: `artist_profiles`

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | Integer (PK) | Profile identifier | Auto |
| user_id | Integer (FK) | Artist user | Yes |
| city | String | Artist's city | No |
| postal_code | String | Artist's postal code | No |
| latitude | Decimal (9,7) | Latitude for location | No |
| longitude | Decimal (9,7) | Longitude for location | No |
| started_year | Integer | Year artist started | No |
| professions | JSON | Array of professions | No |
| plays_with_others | Boolean | Whether artist collaborates | No |
| created_at | Timestamp | Creation date | Auto |
| updated_at | Timestamp | Last update date | Auto |

**Relationships**:
- `user()`: BelongsTo → User

---

## Authentication

### Register (Public)
**Endpoint**: `POST /register`

**Request Body**:
```json
{
  "name": "string (required, max 255)",
  "email": "string (required, unique email format)",
  "password": "string (required, min 8 chars)",
  "password_confirmation": "string (required, must match password)",
  "role": "PUBLIC|ARTIST|ADMIN (optional, default: PUBLIC)",
  "bio": "string (optional)",
  "media_url": "string (optional, valid URL format)",
  "primary_style_id": "integer (required if role=ARTIST, must exist in styles table)",
  "secondary_style_ids": "array of integers (optional, max 3, all must exist in styles, cannot include primary_style_id)"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ARTIST",
    "bio": null,
    "media_url": null,
    "votes_count": 0,
    "created_at": "2026-02-16T10:00:00Z",
    "updated_at": "2026-02-16T10:00:00Z"
  },
  "primary_style": {
    "id": 1,
    "name": "Rock"
  },
  "secondary_styles": [
    { "id": 2, "name": "Jazz" }
  ],
  "access_token": "1|hashed_token_string",
  "token_type": "Bearer"
}
```

---

### Login (Public)
**Endpoint**: `POST /login`

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ARTIST",
    "bio": null,
    "media_url": null,
    "votes_count": 0,
    "created_at": "2026-02-16T10:00:00Z",
    "updated_at": "2026-02-16T10:00:00Z"
  },
  "access_token": "1|hashed_token_string",
  "token_type": "Bearer"
}
```

**Error** (401 Unauthorized):
```json
{
  "message": "Invalid credentials"
}
```

---

### Logout (Protected)
**Endpoint**: `POST /logout`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Current User (Protected)
**Endpoint**: `GET /me`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK): Returns full User object with relationships

---

## API Endpoints

### Styles

#### Get All Styles (Public)
**Endpoint**: `GET /styles`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Rock",
    "created_at": "2026-02-16T10:00:00Z",
    "updated_at": "2026-02-16T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Jazz",
    "created_at": "2026-02-16T10:00:00Z",
    "updated_at": "2026-02-16T10:00:00Z"
  }
]
```

---

#### Get My Styles (Protected - ARTIST only)
**Endpoint**: `GET /me/styles`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK):
```json
{
  "artist_id": 1,
  "artist_name": "John Doe",
  "primary_style": {
    "id": 1,
    "name": "Rock"
  },
  "secondary_styles": [
    { "id": 2, "name": "Jazz" }
  ]
}
```

**Error** (403 Forbidden): User is not an artist

---

#### Get Styles of Specific Artist (Public)
**Endpoint**: `GET /artists/{userId}/styles`

**Path Parameters**:
- `userId`: integer (must be an ARTIST user)

**Response** (200 OK): Same as "Get My Styles"

---

#### Update My Styles (Protected - ARTIST only)
**Endpoint**: `PUT /me/styles`

**Headers**: `Authorization: Bearer {access_token}`

**Request Body**:
```json
{
  "primary_style_id": "integer (required, must exist in styles)",
  "secondary_style_ids": "array of integers (optional, max 3, all must exist, cannot include primary)"
}
```

**Response** (200 OK): Updated styles

---

#### Update Specific Artist's Styles (Protected - ADMIN)
**Endpoint**: `PUT /artists/{userId}/styles`

**Headers**: `Authorization: Bearer {access_token}`

**Path Parameters**:
- `userId`: integer (must be an ARTIST user)

**Request Body**: Same as "Update My Styles"

**Response** (200 OK): Updated styles

---

### Social Links

#### Get My Social Links (Protected)
**Endpoint**: `GET /me/social-links`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK):
```json
{
  "soundcloud": "https://soundcloud.com/artist",
  "spotify": "https://open.spotify.com/artist/123",
  "deezer": "https://www.deezer.com/artist/123",
  "apple_music": "https://music.apple.com/artist/123",
  "youtube": "https://youtube.com/channel/123",
  "instagram": "https://instagram.com/artist",
  "facebook": "https://facebook.com/artist"
}
```

---

#### Update My Social Links (Protected)
**Endpoint**: `PUT /me/social-links`

**Headers**: `Authorization: Bearer {access_token}`

**Request Body** (all optional, send null to remove):
```json
{
  "soundcloud": "string (URL or null to remove)",
  "spotify": "string (URL or null to remove)",
  "deezer": "string (URL or null to remove)",
  "apple_music": "string (URL or null to remove)",
  "youtube": "string (URL or null to remove)",
  "instagram": "string (URL or null to remove)",
  "facebook": "string (URL or null to remove)"
}
```

**Response** (200 OK): Updated links

---

#### Get Artist's Social Links (Public)
**Endpoint**: `GET /artists/{userId}/social-links`

**Path Parameters**:
- `userId`: integer

**Response** (200 OK): Social links for the artist

---

#### Get Artist Detail (Public)
**Endpoint**: `GET /artists/{userId}/detail`

**Query Parameters**:
- `latitude`: optional (your latitude for distance calculation)
- `longitude`: optional (your longitude for distance calculation)

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ARTIST",
  "bio": "Professional musician",
  "media_url": "https://...",
  "votes_count": 42,
  "primary_style": { "id": 1, "name": "Rock" },
  "secondary_styles": [],
  "distance_km": 15.5
}
```

---

### Users (Protected - ADMIN/Self)

#### Get All Users
**Endpoint**: `GET /users`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK): Array of User objects with relationships

---

#### Get Specific User
**Endpoint**: `GET /users/{userId}`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK): User object with votes and events relationships

---

#### Create User
**Endpoint**: `POST /users`

**Headers**: `Authorization: Bearer {access_token}`

**Request Body**: Same as registration endpoint

**Response** (201 Created): User object

---

#### Update User
**Endpoint**: `PUT /users/{userId}`

**Headers**: `Authorization: Bearer {access_token}`

**Request Body** (all optional):
```json
{
  "name": "string",
  "email": "string (unique)",
  "password": "string (min 8)",
  "role": "PUBLIC|ARTIST|ADMIN",
  "bio": "string",
  "media_url": "string (URL)",
  "votes_count": "integer (min 0)",
  "primary_style_id": "integer (ARTIST only)",
  "secondary_style_ids": "array of integers (ARTIST only)"
}
```

**Response** (200 OK): Updated User object

---

#### Delete User
**Endpoint**: `DELETE /users/{userId}`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (204 No Content)

---

### Events (Protected)

#### Get All Events
**Endpoint**: `GET /events`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "title": "Summer Festival 2026",
    "location": "Paris, France",
    "event_date": "2026-06-15T18:00:00Z",
    "price": 25.50,
    "status": "PUBLISHED",
    "voting_close_date": "2026-06-08T18:00:00Z",
    "voting_time_remaining": 8640000,
    "is_voting_open": true,
    "created_at": "2026-02-16T10:00:00Z",
    "updated_at": "2026-02-16T10:00:00Z",
    "artists": [...],
    "votes": [...],
    "styles": [...]
  }
]
```

---

#### Get Specific Event
**Endpoint**: `GET /events/{eventId}`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK): Event object with artists, votes, and styles

---

#### Create Event (Protected)
**Endpoint**: `POST /events`

**Headers**: `Authorization: Bearer {access_token}`

**Request Body**:
```json
{
  "title": "string (required, max 255)",
  "location": "string (required, max 255)",
  "event_date": "datetime (required, must be after now)",
  "price": "numeric (optional, min 0, max 999.99)",
  "status": "DRAFT|PUBLISHED|DONE (optional, default: DRAFT)",
  "style_ids": "array of integers (optional, must exist in styles)"
}
```

**Response** (201 Created): Event object with styles

---

#### Update Event
**Endpoint**: `PUT /events/{eventId}`

**Headers**: `Authorization: Bearer {access_token}`

**Request Body** (all optional):
```json
{
  "title": "string",
  "location": "string",
  "event_date": "datetime",
  "price": "numeric",
  "status": "DRAFT|PUBLISHED|DONE",
  "style_ids": "array of integers"
}
```

**Response** (200 OK): Updated Event object

---

#### Delete Event
**Endpoint**: `DELETE /events/{eventId}`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (204 No Content)

---

### Votes (Protected)

#### Get All Votes
**Endpoint**: `GET /votes`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "user_id": 5,
    "event_id": 1,
    "artist_id": 2,
    "created_at": "2026-02-16T10:00:00Z",
    "updated_at": "2026-02-16T10:00:00Z",
    "user": { ...user object },
    "event": { ...event object },
    "artist": { ...user object (artist) }
  }
]
```

---

#### Get Specific Vote
**Endpoint**: `GET /votes/{voteId}`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK): Vote object with relationships

---

#### Create Vote (Protected)
**Endpoint**: `POST /votes`

**Headers**: `Authorization: Bearer {access_token}`

**Request Body**:
```json
{
  "user_id": "integer (required, must be PUBLIC role)",
  "event_id": "integer (required, must exist)",
  "artist_id": "integer (required, must be ARTIST role and registered to event)"
}
```

**Constraints Checked**:
- Event voting must be open
- voter (user_id) must have role = PUBLIC
- artist_id must have role = ARTIST
- artist must be registered to the event
- Cannot vote twice for same artist in same event

**Response** (201 Created): Vote object with relationships

**Error** (403 Forbidden): 
```json
{
  "message": "Voting is closed for this event",
  "voting_close_date": "2026-06-08T18:00:00Z"
}
```

**Error** (400 Bad Request):
```json
{
  "message": "The specified user is not an artist"
}
```

**Error** (409 Conflict):
```json
{
  "message": "User has already voted for this artist in this event"
}
```

---

#### Delete Vote
**Endpoint**: `DELETE /votes/{voteId}`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (204 No Content)

---

### Artist-Event Management (Protected)

#### Register Artist to Event
**Endpoint**: `POST /artists/register`

**Headers**: `Authorization: Bearer {access_token}`

**Request Body**:
```json
{
  "user_id": "integer (required, must be ARTIST role)",
  "event_id": "integer (required, must exist)"
}
```

**Response** (201 Created):
```json
{
  "message": "Artist registered successfully"
}
```

**Error** (403 Forbidden):
```json
{
  "message": "Only artists can register to events"
}
```

**Error** (409 Conflict):
```json
{
  "message": "Artist already registered to this event"
}
```

---

#### Unregister Artist from Event
**Endpoint**: `POST /artists/unregister`

**Headers**: `Authorization: Bearer {access_token}`

**Request Body**:
```json
{
  "user_id": "integer (required)",
  "event_id": "integer (required)"
}
```

**Response** (200 OK):
```json
{
  "message": "Artist unregistered successfully"
}
```

---

#### Get Artists for Specific Event
**Endpoint**: `GET /events/{eventId}/artists`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK): Array of User objects (ARTIST role)

---

#### Get Events for Specific Artist
**Endpoint**: `GET /artists/{userId}/events`

**Headers**: `Authorization: Bearer {access_token}`

**Path Parameters**:
- `userId`: integer (must be ARTIST role)

**Response** (200 OK): Array of Event objects

**Error** (400 Bad Request):
```json
{
  "message": "User is not an artist"
}
```

---

### Media Management (Protected)

#### Get User's Media
**Endpoint**: `GET /media`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "type": "IMAGE",
    "role": "PROFILE_PICTURE",
    "url": "https://storage.../profile.jpg",
    "path": "media/users/1/profile.jpg",
    "is_primary": true,
    "position": 1,
    "created_at": "2026-02-16T10:00:00Z",
    "updated_at": "2026-02-16T10:00:00Z"
  }
]
```

---

#### Upload Profile Picture
**Endpoint**: `POST /media/profile-picture`

**Headers**: 
- `Authorization: Bearer {access_token}`
- `Content-Type: multipart/form-data`

**Request Body**:
```
image: file (required, image, jpeg/png/jpg/gif, max 5MB)
```

**Response** (201 Created):
```json
{
  "message": "Profile picture uploaded successfully",
  "media": {
    "id": 1,
    "type": "IMAGE",
    "role": "PROFILE_PICTURE",
    "url": "https://storage.../profile.jpg",
    "is_primary": true
  }
}
```

---

#### Upload Gallery Images
**Endpoint**: `POST /media/gallery`

**Headers**: 
- `Authorization: Bearer {access_token}`
- `Content-Type: multipart/form-data`

**Request Body**:
```
images: array of files (required, images, max 10 files, each max 5MB)
```

**Response** (201 Created):
```json
{
  "message": "5 images uploaded successfully",
  "media": [
    {
      "id": 2,
      "url": "https://storage.../gallery1.jpg",
      "position": 1
    },
    {
      "id": 3,
      "url": "https://storage.../gallery2.jpg",
      "position": 2
    }
  ]
}
```

---

#### Upload Tracks
**Endpoint**: `POST /media/tracks`

**Headers**: 
- `Authorization: Bearer {access_token}`
- `Content-Type: multipart/form-data`

**Request Body**:
```
tracks: array of files (required, audio files, max 20 files, each max 20MB)
Supported formats: mp3, wav, ogg
```

**Response** (201 Created):
```json
{
  "message": "3 tracks uploaded successfully",
  "media": [
    {
      "id": 4,
      "type": "AUDIO",
      "role": "TRACK",
      "url": "https://storage.../track1.mp3",
      "position": 1
    }
  ]
}
```

---

#### Upload Intro Video
**Endpoint**: `POST /media/intro-video`

**Headers**: 
- `Authorization: Bearer {access_token}`
- `Content-Type: multipart/form-data`

**Request Body**:
```
video: file (required, video file, max 100MB, formats: mp4, avi, mov)
```

**Response** (201 Created):
```json
{
  "message": "Intro video uploaded successfully",
  "media": {
    "id": 5,
    "type": "VIDEO",
    "role": "INTRO_VIDEO",
    "url": "https://storage.../intro.mp4",
    "is_primary": true
  }
}
```

---

#### Delete Media
**Endpoint**: `DELETE /media/{mediaId}`

**Headers**: `Authorization: Bearer {access_token}`

**Response** (204 No Content)

---

#### Reorder Media
**Endpoint**: `PUT /media/reorder`

**Headers**: `Authorization: Bearer {access_token}`

**Request Body**:
```json
{
  "reorder": [
    {
      "id": 2,
      "position": 1
    },
    {
      "id": 3,
      "position": 2
    },
    {
      "id": 4,
      "position": 3
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "message": "Media reordered successfully",
  "media": [
    {
      "id": 2,
      "position": 1
    }
  ]
}
```

---

## Error Handling

### Standard HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - User lacks permission |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

### Validation Errors (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Authentication Errors (401)

```json
{
  "message": "Unauthenticated."
}
```

### Permission Errors (403)

```json
{
  "message": "You are not authorized to perform this action."
}
```

---

## Quick Reference: User Roles & Permissions

### PUBLIC User
- Can vote for artists in events
- Can register account
- Can view artist profiles
- Cannot create events
- Cannot upload media

### ARTIST User
- Can register to events
- Can create events (if ADMIN)
- Can upload media (profile pic, gallery, tracks, videos)
- Can manage social links
- Can have styles assigned
- Receives votes from PUBLIC users
- Has vote count tracked

### ADMIN User
- Full access to all endpoints
- Can create/edit/delete events
- Can manage users
- Can manage styles
- Can update any artist's styles

---

## Integration Notes

When implementing on the frontend, AI agents should:

1. **Authentication First**: Always validate user role before allowing operations
2. **Event Voting**: Check `voting_close_date` before submitting votes
3. **Artist Registration**: Verify event exists and user is ARTIST before registering
4. **Media Uploads**: Validate file types and sizes on frontend before upload
5. **Social Links**: Handle null values to remove links
6. **Styles**: ARTIST users need primary style at registration; max 3 secondary

---

**Last Updated**: February 16, 2026
**Backend Version**: Laravel 12.0 (PHP 8.4)
