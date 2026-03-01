import React, { useState } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { ChevronLeft, Link } from "lucide-react-native";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ImageCarousel } from "@/components/Artist/ImageCarousel";
import { ArtistAbout } from "@/components/Artist/ArtistAbout";
import { MusicPlayer } from "@/components/Artist/MusicPlayer";
import { VideoClip } from "@/components/Artist/VideoClip";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import { Fonts, Typography } from "@/constants/theme";

// Données d'exemple - à remplacer par les vraies données

const exampleArtists = [
  {
    id: "1",
    name: "Choi",
    subtitle: "Here to know",
    location: "Annecy",
    bio: "Joe Biden, 46 ans, est un véritable alchimiste du son. Entre ses doigts, un saxophone ténor prend vie ; ses improvisations, nourries de deux décennies d'amour inconditionnel pour le jazz, convoquent aussi bien les bruissements feutrés des clubs new-yorkais que l'énergie éclatante de la scène parisienne.\n\nAutodidacte devenu chef d'orchestre, il mêle les harmonies be-bop aux textures électroniques qu'il sculpte en studio, créant des paysages sonores aussi audacieux qu'intimes.",
    imageUrl: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
    ],
    styles: ["RockNRoll", "Indie", "Pop", "Rock"],
    distance: "150km",
    pastShows: 7,
    yearsActive: 14,
    instruments: "Chanteur, saxophoniste",
    playsWithOthers: true,
    tracks: [
      { id: "1", title: "Jazz Improvisation", duration: "3:45" },
      { id: "2", title: "Midnight Blues", duration: "4:20" },
      { id: "3", title: "Sunset Melody", duration: "3:12" },
      { id: "4", title: "Urban Groove", duration: "5:01" },
    ],
    videoClip: {
      // Exemple YouTube (commenté)
      // url: "https://www.youtube.com/watch?v=iywaBOMvYLI&list=RDiywaBOMvYLI&start_radio=1",
      // type: "youtube",

      // Exemple vidéo locale - utilisez require() pour les fichiers dans assets
      // url: require("@/assets/videos/RickRoll.mp4"),

      // Ou utilisez une URL distante pour tester
      // option permettant de tester avec un lien youtube directement
    /*   videoClip: {
      url: "https://www.youtube.com/watch?v=Aq5WXmQQooo&list=RDAq5WXmQQooo&start_radio=1",
      type: "youtube" as "youtube" | "local",
      thumbnail: "https://img.youtube.com/vi/Aq5WXmQQooo/maxresdefault.jpg", */
      url: "https://www.youtube.com/watch?v=Aq5WXmQQooo&list=RDAq5WXmQQooo&start_radio=1",
      type: "youtube" as "youtube" | "local",
      thumbnail: "https://img.youtube.com/vi/Aq5WXmQQooo/maxresdefault.jpg",
      /* url: require("@/assets/images/RickRoll.mp4"),
      type: "local" as "youtube" | "local",
      thumbnail:
        "https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/22312759/rickroll_4k.jpg?quality=90&strip=all&crop=0,10.749448450723,100,78.501103098554", */
    },
  },
];

export default function ArtistDetailScreen() {
  const [isFavorite, setIsFavorite] = useState(false);

  // Récupérer le premier artiste du tableau (ou utiliser l'id de la route pour filtrer)
  const artist = exampleArtists[0];

  return (
    <View style={{ flex: 1 }}>
      {/* Bouton Retour */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <BlurView intensity={15} style={styles.backButtonBlur}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </BlurView>
      </Pressable>

      <ParallaxScrollView
        headerBackgroundColor={{ light: "#080808", dark: "#080808" }}
        showsVerticalScrollIndicator={false}
        headerImage={
          <ImageCarousel
            images={artist.imageUrl}
            isFavorite={isFavorite}
            onFavoritePress={() => setIsFavorite(!isFavorite)}
          />
        }
      >
        <ThemedView style={styles.contentContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.styleTitle}>{artist.name}</ThemedText>
            <Pressable
              onPress={() => console.log("Lien commentaires cliqué")}
              style={styles.linkButton}
            >
              <ThemedText style={[Typography.link, { fontSize: 12 }]}>
                Voir les commentaires
              </ThemedText>
            </Pressable>
          </ThemedView>

          {artist.tracks && artist.tracks.length > 0 && (
            <MusicPlayer
              tracks={artist.tracks}
              artistName={artist.name}
              artistImage={artist.imageUrl[0]}
            />
          )}

          <ArtistAbout
            description={artist.bio}
            location={artist.location}
            distance={artist.distance}
            pastShows={artist.pastShows}
            yearsActive={artist.yearsActive}
            instruments={artist.instruments}
            playsWithOthers={artist.playsWithOthers}
          />
          <VideoClip
            videoUrl={artist.videoClip?.url}
            thumbnailUrl={artist.videoClip?.thumbnail || ""}
            videoType={artist.videoClip?.type}
          />
        </ThemedView>
      </ParallaxScrollView>

      {/* Lecteur audio global en bas de page */}
      <GlobalAudioPlayer forceShow={true} bottomPosition={25} />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 50,
    overflow: "hidden",
    zIndex: 10,
  },
  backButtonBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 2,
  },
  linkButton: {
    padding: 4,
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    gap: 16,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  styleTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 25,
    lineHeight: 32,
  },
});
