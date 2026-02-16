import type { Event } from '@/services/api/types';

/**
 * Hook `useEvents` (placeholder)
 * Ne contient pas de logique métier — TODO implémenter.
 */
export function useEvents(): {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  throw new Error('useEvents hook not implemented');
}

export default useEvents;
