/**
 * Endpoints API centralisés
 */
export const ENDPOINTS = {
  // Auth
  REGISTER: '/api/register',
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

  // Artists
  ARTISTS_REGISTER: '/api/artists/register',
  ARTISTS_UNREGISTER: '/api/artists/unregister',
  ARTIST_EVENTS: (userId: string | number) => `/api/artists/${userId}/events`,

  STYLES: '/api/styles',
  STYLE_BY_ID: (id: string | number) => `/api/styles/${id}`,
} as const;
  

export default ENDPOINTS;
