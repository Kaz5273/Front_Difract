import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuthStore } from '@/store/auth-store';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isOnboardingComplete, isLoading: onboardingLoading } = useOnboarding();
  const { isAuthenticated, isLoading: authLoading, loadUser } = useAuthStore();

  // Charger l'utilisateur depuis le storage au démarrage
  useEffect(() => {
    loadUser();
  }, []);

  if (onboardingLoading || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111111' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  console.log('isOnboardingComplete:', isOnboardingComplete, '| isAuthenticated:', isAuthenticated);

  // Si l'utilisateur est connecté, aller directement à l'app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Sinon, afficher l'onboarding
  return <Redirect href="/OnBoarding/onboarding" />;
}
