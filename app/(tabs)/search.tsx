import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Header } from "@/components/Header/header";
import { SearchBar } from "@/components/Search/SearchBar";
import { StyleFilter } from "@/components/Button/StyleFilter";
import { ArtistCard } from "@/components/Artist/ArtistCard";
import { EventCard } from "@/components/Event/EventCard";
import { useStyles } from "@/hooks/useStyle";
import { router } from "expo-router";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const { styles: musicStyles, isLoading } = useStyles();
  const { currentTrack, isPlaying, play, pause } = useAudioPlayer();

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
      mainTrack: {
        id: "track-1",
        title: "Jazz Improvisation",
        duration: "3:45",
      },
    },
    {
      id: "2",
      name: "Cosi",
      subtitle: "Soul & Jazz",
      location: "Lyon",
      imageUrl:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
      styles: ["Jazz", "Soul"],
      mainTrack: {
        id: "track-2",
        title: "Midnight Blues",
        duration: "4:20",
      },
    },
    {
      id: "3",
      name: "Luna",
      subtitle: "Electronic Vibes",
      location: "Paris",
      imageUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop",
      styles: ["Électro", "House"],
      mainTrack: {
        id: "track-3",
        title: "Sunset Melody",
        duration: "3:12",
      },
    },
  ];

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

  // Fonction pour basculer le favori
  const toggleFavorite = (artistId: string) => {
    setFavorites((prev) => ({
      ...prev,
      [artistId]: !prev[artistId],
    }));
  };

  // Fonction pour lancer/mettre en pause la musique principale d'un artiste
  const handlePlayArtist = (artist: typeof exampleArtists[0]) => {
    if (artist.mainTrack) {
      if (currentTrack?.id === artist.mainTrack.id && isPlaying) {
        pause();
      } else {
        play({
          id: artist.mainTrack.id,
          title: artist.mainTrack.title,
          artistName: artist.name,
          artistImage: artist.imageUrl,
          duration: artist.mainTrack.duration,
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Recherche" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabContainer}>
          <View style={styles.searchBarWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Artistes, morceaux, lieux, ect."
            />
          </View>
          <StyleFilter
            styles={musicStyles}
            selectedStyleId={selectedStyle}
            onSelectStyle={setSelectedStyle}
          />
        </View>

        {/* Section Artistes */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="h1">Découvrez des artistes</ThemedText>
        </ThemedView>

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
              trackId={artist.mainTrack?.id}
              isFavorite={favorites[artist.id]}
              onPress={() => router.push(`/artist/${artist.id}`)}
              onFavoritePress={() => toggleFavorite(artist.id)}
              onPlayPress={() => handlePlayArtist(artist)}
            />
          ))}
        </ScrollView>

        {/* Section Événements */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="h1">
            Les événements {"\n"}proche de chez vous
          </ThemedText>
        </ThemedView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventSection}
        >
          {exampleEvents.map((event) => (
            <View key={event.id} style={styles.eventCardWrapper}>
              <EventCard
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
            </View>
          ))}
        </ScrollView>
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
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 130,
    gap: 16,
  },
  tabContainer: {
    gap: 16,
  },
  searchBarWrapper: {
    paddingHorizontal: 20,
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
    paddingBottom: 10,
  },
  eventCardWrapper: {
    width: 355,
  },
});
