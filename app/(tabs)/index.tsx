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
import { EventCard } from "@/components/Event/EventCard";
import { LocationBadge } from "@/components/Badges/LocationBadge";
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

  // Données d'exemple pour les événements
  const exampleEvents = [
    {
      id: 1,
      title: "Espace rencontre",
      location: "Annecy-le-vieux",
      distance: "150km",
      eventDate: "2025-06-06T18:00:00.000Z",
      timeRange: "18h00 à 00h00",
      price: 22.5,
      imageUrl:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop",
      styles: ["Jazz", "Expérimentale"],
      friendsGoing: 3,
      friendsAvatars: [
        "https://i.pravatar.cc/150?img=1",
        "https://i.pravatar.cc/150?img=2",
        "https://i.pravatar.cc/150?img=3",
      ],
    },
    {
      id: 2,
      title: "Festival Rock en Seine",
      location: "Paris",
      distance: "500km",
      eventDate: "2025-07-15T20:00:00.000Z",
      timeRange: "20h00 à 02h00",
      price: 45.0,
      imageUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop",
      styles: ["Rock", "Indie"],
      friendsGoing: 5,
      friendsAvatars: [
        "https://i.pravatar.cc/150?img=4",
        "https://i.pravatar.cc/150?img=5",
        "https://i.pravatar.cc/150?img=6",
      ],
    },
  ];

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
        <View style={styles.locationContainer}>
          <LocationBadge
            location="Annecy"
            onPress={() => console.log("Change location")}
          />
        </View>
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

        <ThemedView style={styles.titleContainer}>
          <ThemedText type="h1">
            Les événements {"\n"}proche de chez vous
          </ThemedText>
        </ThemedView>

        {/* Section Événements */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventSection}
        >
          {exampleEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              location={event.location}
              distance={event.distance}
              eventDate={event.eventDate}
              timeRange={event.timeRange}
              price={event.price}
              imageUrl={event.imageUrl}
              styles={event.styles}
              friendsGoing={event.friendsGoing}
              friendsAvatars={event.friendsAvatars}
              onPress={() => console.log("Événement cliqué:", event.title)}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 10,
    gap: 16,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  artistsSection: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  eventSection: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 20,
  },
  locationContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});
