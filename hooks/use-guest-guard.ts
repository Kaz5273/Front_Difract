import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * Hook pour protéger les actions réservées aux utilisateurs connectés.
 * Affiche une modal si l'utilisateur est invité (non connecté).
 *
 * Usage :
 *   const { showModal, setShowModal, guard } = useGuestGuard();
 *   guard(() => playMusic(id)); // affiche la modal si invité
 */
export function useGuestGuard() {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const guard = (action: () => void) => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }
    action();
  };

  return { showModal, setShowModal, guard };
}
