// ============================================
// USER TYPES
// ============================================
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  role: 'PUBLIC' | 'ARTIST' | 'ADMIN';
  bio?: string | null;
  media_url?: string | null;
  city?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_tracking_enabled?: boolean;
  votes_count: number;
  created_at: string;
  updated_at: string;
  media?: Media[];
  styles?: Array<{ id: number; name: string; pivot?: { is_primary: boolean } }>;
  social_links?: SocialLink[];
}

// ============================================
// TYPE HELPERS (pour filtrer par rôle)
// ============================================
export type Artist = User & { role: 'ARTIST' };
export type PublicUser = User & { role: 'PUBLIC' };
export type AdminUser = User & { role: 'ADMIN' };

// ============================================
// EVENT TYPES
// ============================================
export interface Event {
  id: number;
  title: string;
  description?: string;
  location: string;
  address?: string;
  event_date: string;
  end_time?: string | null;
  price?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'DONE';
  type?: 'classic' | 'special';
  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  capacity?: number | null;
  voting_start_date?: string | null;
  voting_end_date?: string | null;
  early_access_stock?: number | null;
  standard_stock?: number | null;
  last_minute_stock?: number | null;
  is_voting_open?: boolean;
  voting_time_remaining?: number | null;
  distance_km?: number;
  artists?: Artist[];
  votes?: Vote[];
  styles?: { id: number; name: string }[];
  created_at: string;
  updated_at: string;
}

// ============================================
// AUTH TYPES
// ============================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'PUBLIC' | 'ARTIST';
  bio?: string;
  city?: string;
  postal_code?: string;
  primary_style_id?: number | null;
  secondary_style_ids?: number[];
}
// ============================================
// VOTE TYPES
// ============================================
export interface VoteEvent {
  id: number;
  title: string;
  location: string;
  event_date: string;
  image_url: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'DONE';
  voting_start_date?: string | null;
  voting_end_date?: string | null;
  is_voting_open?: boolean;
}

export interface VoteArtist {
  id: number;
  name: string;
  media_url: string | null;
  city: string | null;
}

export interface Vote {
  id: number;
  user_id: number;
  artist_id: number;
  event_id: number;
  created_at: string;
  event?: VoteEvent;
  artist?: VoteArtist;
}

export interface CreateVoteRequest {
  artist_id: number;
  event_id: number;
}

/**
 * Représente un style musical
 */
export interface MusicStyle {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Payload pour la sélection des styles lors de l'inscription
 */
export interface StyleSelection {
  primary_style_id: number | null;
  secondary_style_ids: number[];
}

/**
 * Réponse API de la liste des styles
 */
export interface StylesResponse {
  data: MusicStyle[];
  message?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// ============================================
// PAGINATION TYPES
// ============================================
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ============================================
// MEDIA TYPES
// ============================================
export type MediaType = 'IMAGE' | 'AUDIO' | 'VIDEO';
export type MediaRole = 'PROFILE' | 'GALLERY' | 'TRACK' | 'INTRO_VIDEO';

export interface Media {
  id: number;
  user_id: number;
  type: MediaType;
  role: MediaRole;
  title?: string | null;
  url?: string;
  path?: string;
  is_primary: boolean;
  position: number | null;
  created_at: string;
  updated_at: string;
}

export interface MediaUploadResponse {
  message: string;
  media: Media | Media[];
}

export interface MediaGrouped {
  profile_picture: Media | null;
  gallery: Media[];
  tracks: Media[];
  intro_video: Media | null;
}

export interface MediaReorderPayload {
  type: 'IMAGE' | 'AUDIO';
  role: 'GALLERY' | 'TRACK';
  order: number[];
}

// ============================================
// SOCIAL LINK TYPES
// ============================================
export interface SocialLink {
  id: number;
  user_id: number;
  platform: string;
  url: string;
  created_at: string;
  updated_at: string;
}
