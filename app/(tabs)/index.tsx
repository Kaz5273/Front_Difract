import { Header } from '@/components/Header/header';
import { HelloWave } from '@/components/hello-wave';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
   
  <SafeAreaView style={styles.container}>
                  <Header 
                  title="Accueil" 
                  showBackButton 
                  showMenuButton 
                />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome!</ThemedText>
          <HelloWave />
        </ThemedView>
        
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 1: Try it</ThemedText>
          <ThemedText>
            Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
            Press{' '}
            <ThemedText type="defaultSemiBold">
              {Platform.select({
                ios: 'cmd + d',
                android: 'cmd + m',
                web: 'F12',
              })}
            </ThemedText>{' '}
            to open developer tools.
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.stepContainer}>
          <Link href="/modal">
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link>
          <ThemedText>
            {`Tap the Explore tab to learn more about what's included in this starter app.`}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
          <ThemedText>
            {`When you're ready, run `}
            <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> directory.
            <ThemedText type="link"><Link href="/onboarding">Ouvrir le modal</Link></ThemedText>
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
});
