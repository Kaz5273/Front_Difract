import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuthStore } from '@/store/auth-store';
import { subscriptionService } from '@/services/subscription/subscription.service';
import { locationService } from '@/services/location/location.service';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isLoading: onboardingLoading } = useOnboarding();
  const { isAuthenticated, loadUser, user } = useAuthStore();
  // authInitialized passe à true uniquement après que loadUser() ait terminé
  const [authInitialized, setAuthInitialized] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);

  // Charger l'utilisateur depuis le storage au démarrage
  useEffect(() => {
    loadUser().finally(() => setAuthInitialized(true));
  }, []);

  // Rafraîchir la localisation en arrière-plan si l'utilisateur est connecté et a accordé la permission
  useEffect(() => {
    if (!authInitialized || !isAuthenticated) return;
    locationService.updateLocationInBackground();
  }, [authInitialized, isAuthenticated]);

  // Vérifier l'abonnement uniquement après que l'auth soit réellement initialisée
  useEffect(() => {
    if (!authInitialized) return;

    if (!isAuthenticated || !user || user.role !== 'ARTIST') {
      setSubscriptionChecked(true);
      return;
    }

    subscriptionService.getStatus()
      .then((status) => {
        setNeedsSubscription(!status.subscribed);
      })
      .catch(() => {
        // En cas d'erreur réseau, on laisse passer
        setNeedsSubscription(false);
      })
      .finally(() => setSubscriptionChecked(true));
  }, [authInitialized, isAuthenticated, user?.role]);

  const isChecking = onboardingLoading || !authInitialized || !subscriptionChecked;

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111111' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  console.log('isAuthenticated:', isAuthenticated, '| needsSubscription:', needsSubscription);

  if (isAuthenticated) {
    if (needsSubscription) {
      return <Redirect href="/Auth/artist-subscribe" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  // Non-authentifié → toujours l'onboarding (welcome screen)
  return <Redirect href="/OnBoarding/onboarding" />;
}
