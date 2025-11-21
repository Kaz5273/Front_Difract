import { useAuthStore } from "@/store/auth-store";

/**
 * Hook simplifié pour accéder au store d'authentification
 */
export function useAuth() {
  return useAuthStore();
}

export default useAuth;