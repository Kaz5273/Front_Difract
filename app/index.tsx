import { useOnboarding } from '@/hooks/use-onboarding';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isOnboardingComplete, isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }
  console.log('isOnboardingComplete:', isOnboardingComplete);
  if (!isOnboardingComplete) {
    return <Redirect href="/OnBoarding/onboarding" />;
  }

  return <Redirect href="/Auth/Index" />;
}