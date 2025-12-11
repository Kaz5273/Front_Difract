import { Header } from "@/components/Header/header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link, router } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/use-auth";
import { Fonts } from "@/constants/theme";
import { ArtistCard } from "@/components/Artist/ArtistCard";
import { useState } from "react";
export default function HomeScreen() {
  // 🪝 Récupération de la fonction logout et de l'état
  const { logout, isLoading, user } = useAuth();

  // État pour gérer les favoris
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});

  // Données d'exemple pour les artistes
  const exampleArtists = [
    {
      id: "1",
      name: "Choi",
      subtitle: "Here to know",
      location: "Annecy",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      styles: ["RockNRoll", "Indie", "Pop", "Rock"],
    },
    {
      id: "2",
      name: "Cosi",
      subtitle: "Soul & Jazz",
      location: "Lyon",
      imageUrl:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
      styles: ["Jazz", "Soul"],
    },
    {
      id: "3",
      name: "Cosi",
      subtitle: "Soul & Jazz",
      location: "Lyon",
      imageUrl:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
      styles: ["Jazz", "Soul"],
    },
  ];

  // Fonction pour basculer le favori
  const toggleFavorite = (artistId: string) => {
    setFavorites((prev) => ({
      ...prev,
      [artistId]: !prev[artistId],
    }));
  };

  // 🚪 Fonction de déconnexion
  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("🚪 User clicked logout");

            // Appel de la fonction logout du store
            await logout();

            console.log("✅ Logout successful, redirecting...");

            // Redirection vers l'écran de connexion
            router.replace("/Auth/Index");
          } catch (error) {
            console.error("❌ Logout error:", error);
            Alert.alert("Erreur", "Impossible de se déconnecter");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      <Header title="Accueil" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="h1">Découvrez des artistes</ThemedText>
        </ThemedView>

        {/* Section Artistes */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.artistsSection}
        >
          {exampleArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              id={artist.id}
              name={artist.name}
              subtitle={artist.subtitle}
              location={artist.location}
              imageUrl={artist.imageUrl}
              styles={artist.styles}
              isFavorite={favorites[artist.id]}
              onPress={() => console.log("Artiste cliqué:", artist.name)}
              onFavoritePress={() => toggleFavorite(artist.id)}
              onPlayPress={() => console.log("Play:", artist.name)}
            />
          ))}
        </ScrollView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="h1">Les événements proche de chez vous</ThemedText>
        </ThemedView>

        <ThemedView style={styles.stepContainer}></ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Test onboarding</ThemedText>

          <ThemedText type="link">
            <Link href="/OnBoarding/onboarding">Ouvrir le modal</Link>
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">test Page connexion</ThemedText>
          <Pressable
            onPress={() => {
              router.push("/Auth/Index");
            }}
          >
            <ThemedText type="link">Go to Auth Index</ThemedText>
          </Pressable>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Test déco</ThemedText>
          <Pressable
            onPress={handleLogout}
            disabled={isLoading}
            style={({ pressed }) => [styles.logoutButton]}
          >
            <ThemedText type="body">
              {isLoading ? "Déconnexion en cours..." : "Se déconnecter"}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 10,
    gap: 16,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  artistsSection: {
    flexDirection: "row",
    gap: 16,
    paddingRight: 20,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
});
