/**
 * Endpoints API centralisés
 */
export const ENDPOINTS = {
  // Auth
  REGISTER: '/api/register',
  VERIFY_EMAIL: '/api/verify-email',
  RESEND_CODE: '/api/resend-code',
  LOGIN: '/api/login',
  LOGOUT: '/api/logout',
  ME: '/api/me',

  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string | number) => `/api/users/${id}`,

  // Events
  EVENTS: '/api/events',
  EVENT_BY_ID: (id: string | number) => `/api/events/${id}`,
  EVENT_ARTISTS: (eventId: string | number) => `/api/events/${eventId}/artists`,

  // Votes
  VOTES: '/api/votes',
  VOTE_BY_ID: (id: string | number) => `/api/votes/${id}`,
  MY_VOTES: '/api/me/votes',

  // Artists
  ARTISTS_REGISTER: '/api/artists/register',
  ARTISTS_UNREGISTER: '/api/artists/unregister',
  ARTIST_EVENTS: (userId: string | number) => `/api/artists/${userId}/events`,

  STYLES: '/api/styles',
  STYLE_BY_ID: (id: string | number) => `/api/styles/${id}`,

  // Media
  MEDIA: '/api/media',
  MEDIA_PROFILE_PICTURE: '/api/media/profile-picture',
  MEDIA_GALLERY: '/api/media/gallery',
  MEDIA_TRACKS: '/api/media/tracks',
  MEDIA_INTRO_VIDEO: '/api/media/intro-video',
  MEDIA_DELETE: (mediaId: string | number) => `/api/media/${mediaId}`,
  MEDIA_REORDER: '/api/media/reorder',

  // Social Links
  SOCIAL_LINKS: (userId: string | number) => `/api/artists/${userId}/social-links`,
  ME_SOCIAL_LINKS: '/api/me/social-links',

  // Favorites
  MY_FAVORITE_ARTISTS: '/api/me/favorites/artists',
  FAVORITE_ARTIST: (id: string | number) => `/api/me/favorites/artists/${id}`,

  // Friends
  MY_FRIENDS: '/api/me/friends',
  MY_FRIENDS_COUNT: '/api/me/friends/count',
  FRIEND: (userId: string | number) => `/api/me/friends/${userId}`,

  // Subscription
  SUBSCRIPTION_CHECKOUT: '/api/subscription/checkout',
  SUBSCRIPTION_STATUS: '/api/subscription/status',
  SUBSCRIPTION_CANCEL: '/api/subscription/cancel',
  SUBSCRIPTION_RESUME: '/api/subscription/resume',
  SUBSCRIPTION_PORTAL: '/api/subscription/portal',
} as const;
  

export default ENDPOINTS;
