import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header } from "@/components/Header/header";
import { FavoriteArtistCard } from "@/components/Favorites/FavoriteArtistCard";
import { Fonts, Typography } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";

export default function FavoritesScreen() {
  const router = useRouter();

  // Données d'exemple pour les artistes avec fin de votes proche
  const endingSoonArtists = [
    {
      id: "1",
      firstName: "Joe",
      lastName: "Biden",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      dateInfo: {
        dayOfWeek: "ven.",
        dayNumber: "06",
        month: "juin",
      },
    },
    {
      id: "2",
      firstName: "Joe",
      lastName: "Biden",
      imageUrl:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
      dateInfo: {
        dayOfWeek: "ven.",
        dayNumber: "06",
        month: "juin",
      },
    },
  ];

  // Données d'exemple pour les artistes avec votes en cours
  const votingArtists = [
    {
      id: "3",
      firstName: "Joe",
      lastName: "Biden",
      imageUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
      votesCount: 123,
    },
    {
      id: "4",
      firstName: "Joe",
      lastName: "Biden",
      imageUrl:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
      votesCount: 123,
    },
    {
      id: "5",
      firstName: "Joe",
      lastName: "Biden",
      imageUrl:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
      votesCount: 123,
    },
  ];

  const handleArtistPress = (artistId: string) => {
    router.push(`/artist/${artistId}`);
  };

  const handleFavoritePress = (artistId: string) => {
    console.log("Toggle favorite for:", artistId);
  };

  const handleSearchPress = () => {
    console.log("Search pressed");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="Vos stars"
        variant="detail"
        showSearchButton
        onSearchPress={handleSearchPress}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Fins des votes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h1">Fins des votes</ThemedText>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {endingSoonArtists.map((artist) => (
              <FavoriteArtistCard
                key={artist.id}
                id={artist.id}
                firstName={artist.firstName}
                lastName={artist.lastName}
                imageUrl={artist.imageUrl}
                badgeType="date"
                dateInfo={artist.dateInfo}
                isFavorite={true}
                onPress={() => handleArtistPress(artist.id)}
                onFavoritePress={() => handleFavoritePress(artist.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Section Les votes en cours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h1">Les votes en cours</ThemedText>
          </View>

          <View style={styles.gridContainer}>
            {votingArtists.map((artist) => (
              <FavoriteArtistCard
                key={artist.id}
                id={artist.id}
                firstName={artist.firstName}
                lastName={artist.lastName}
                imageUrl={artist.imageUrl}
                badgeType="votes"
                votesCount={artist.votesCount}
                isFavorite={true}
                onPress={() => handleArtistPress(artist.id)}
                onFavoritePress={() => handleFavoritePress(artist.id)}
              />
            ))}
          </View>
        </View>

        {/* Footer FAQ */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Vous ne trouvez pas votre bonheur ? Des questions ?
          </Text>
          <Pressable onPress={() => console.log("FAQ pressed")}>
            <Text style={styles.footerLink}>Rendez-vous dans notre FAQ.</Text>
          </Pressable>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 200,
  },
  section: {
    gap: 15,
    marginBottom: 35,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  horizontalList: {
    flexDirection: "row",
    gap: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#606060",
    letterSpacing: -0.24,
    textAlign: "center",
  },
  footerLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    textDecorationLine: "underline",
    marginTop: 4,
  },
});
