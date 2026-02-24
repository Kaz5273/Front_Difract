import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Volume2,
} from "lucide-react-native";
import { ThemedText } from "@/components/themed-text";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Fonts } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GlobalAudioPlayerProps {
  forceShow?: boolean; // Permet de forcer l'affichage même sur la page artiste
  bottomPosition?: number; // Position personnalisée du bas
}

export function GlobalAudioPlayer({
  forceShow = false,
  bottomPosition,
}: GlobalAudioPlayerProps) {
  const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack } =
    useAudioPlayer();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Ne pas afficher le player sur certaines pages détail
  const isArtistDetailPage = pathname?.startsWith("/artist/");
  const isEventDetailPage = pathname?.startsWith("/event/");
  const isVoteDetailPage = pathname?.startsWith("/vote/");
  const isDetailPage = isArtistDetailPage || isEventDetailPage;

  if (!currentTrack || !isPlaying) {
    return null;
  }

  // Masquer sur la page artiste (sauf si forceShow) et sur la page vote detail
  if ((isArtistDetailPage && !forceShow) || isVoteDetailPage) {
    return null;
  }

  const containerStyle = [
    styles.container,
    isDetailPage ? styles.containerDetail : null,
    !isDetailPage && bottomPosition !== undefined && { bottom: bottomPosition },
  ];

  const blurStyle = [
    styles.blurContainer,
    isDetailPage && styles.blurContainerDetail,
  ];

  const contentStyle = [
    styles.content,
    isDetailPage && styles.contentDetail,
    isDetailPage && { paddingBottom: Math.max(insets.bottom, 12) },
  ];
  return (
    <View style={containerStyle}>
      <BlurView intensity={20} style={blurStyle}>
        <View style={contentStyle}>
          {/* Image et info de la piste */}
          <View style={styles.trackInfo}>
            <Image
              source={{ uri: currentTrack.artistImage }}
              style={styles.artistImage}
            />
            <View style={styles.textContainer}>
              <ThemedText style={styles.artistName} numberOfLines={1}>
                {currentTrack.artistName}
              </ThemedText>
              <ThemedText style={styles.trackTitle} numberOfLines={1}>
                {currentTrack.title}
              </ThemedText>
            </View>
          </View>

          {/* Contrôles */}
          <View style={styles.controls}>
            {/* Bouton Précédent */}
            <Pressable style={styles.controlButton} onPress={previousTrack}>
              <BlurView intensity={10} style={styles.controlButtonBlur}>
                <SkipBack size={16} color="#FFFFFF" fill="#FFFFFF" />
              </BlurView>
            </Pressable>

            {/* Bouton Play/Pause */}
            <Pressable style={styles.playButton} onPress={togglePlayPause}>
              <BlurView intensity={10} style={styles.playButtonBlur}>
                {isPlaying ? (
                  <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                )}
              </BlurView>
            </Pressable>

            {/* Bouton Suivant */}
            <Pressable style={styles.controlButton} onPress={nextTrack}>
              <BlurView intensity={10} style={styles.controlButtonBlur}>
                <SkipForward size={16} color="#FFFFFF" fill="#FFFFFF" />
              </BlurView>
            </Pressable>

            {/* Bouton Volume */}
            <Pressable style={styles.volumeButton}>
              <Volume2 size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 110,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  // Style pour les pages détail (pleine largeur, collé en bas)
  containerDetail: {
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Pas d'arrondis sur les pages détail
  blurContainerDetail: {
    borderRadius: 0,
  },
  // Plus de padding horizontal sur les pages détail
  contentDetail: {
    paddingTop: 10,
    paddingLeft: 16,
    paddingRight: 16,
    justifyContent: "center",
  },
  blurContainer: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(22, 22, 22, 1)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    paddingRight: 10,
  },
  trackInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  artistImage: {
    width: 55,
    height: 55,
    borderRadius: 20,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  artistName: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    letterSpacing: -0.48,
    color: "#FFFFFF",
  },
  trackTitle: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    letterSpacing: -0.4,
    marginTop: -6,
    color: "rgba(255, 255, 255, 0.7)",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 32,
    overflow: "hidden",
  },
  controlButtonBlur: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 36,
    overflow: "hidden",
  },
  playButtonBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 1,
  },
  volumeButton: {
    marginLeft: 8,
  },
});
