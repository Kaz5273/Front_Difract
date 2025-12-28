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

  // Ne pas afficher le player sur la page de détail de l'artiste (sauf si forceShow)
  const isArtistDetailPage = pathname?.startsWith("/artist/");

  // Ancienne méthode : if (!currentTrack) { return null; }
  // Le player disparaît maintenant quand la musique n'est plus en lecture (pause ou stop)
  if (!currentTrack || !isPlaying) {
    return null;
  }

  // Si on est sur la page artiste et que forceShow n'est pas activé, ne rien afficher
  if (isArtistDetailPage && !forceShow) {
    return null;
  }

  const containerStyle = [
    styles.container,
    bottomPosition !== undefined && { bottom: bottomPosition },
  ];

  return (
    <View style={containerStyle}>
      <BlurView intensity={20} style={styles.blurContainer}>
        <View style={styles.content}>
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
