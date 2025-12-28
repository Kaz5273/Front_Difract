import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { MapPin, Sparkle, Pause } from "lucide-react-native";
import IconPlay from "../icons/iconPlay";
import { Typography } from "@/constants/theme";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

interface ArtistCardProps {
  id: string;
  name: string;
  subtitle: string;
  location: string;
  imageUrl: string;
  styles: string[];
  trackId?: string; // ID de la musique principale de l'artiste
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  onPlayPress?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  name,
  subtitle,
  location,
  imageUrl,
  styles: musicStyles,
  trackId,
  isFavorite = false,
  onPress,
  onFavoritePress,
  onPlayPress,
}) => {
  const { currentTrack, isPlaying } = useAudioPlayer();

  // Vérifier si la musique de cet artiste est en cours de lecture
  const isArtistPlaying = currentTrack?.id === trackId && isPlaying;
  // Afficher maximum 2 styles + compteur
  const displayStyles = musicStyles.slice(0, 1);
  const remainingCount = musicStyles.length - 1;

  return (
    <View style={styles.container}>
      {/* Image Card avec gradient */}
      <Pressable onPress={onPress} style={styles.imageCard}>
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBackground}
          imageStyle={styles.image}
        >
          {/* Gradients overlay */}
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0)"]}
            locations={[0, 0.29]}
            style={styles.topGradient}
          />
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.63)"]}
            locations={[0.38, 1]}
            style={styles.bottomGradient}
          />
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.15)", "rgba(0, 0, 0, 0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.overlayGradient}
          />

          <View style={styles.content}>
            {/* Top Row - Location & Favorite */}
            <View style={styles.topRow}>
              {/* Location Badge */}
              <BlurView intensity={15} style={styles.locationBadge}>
                <MapPin size={14} color="#FFFFFF" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {location}
                </Text>
              </BlurView>

              {/* Favorite Button */}
              <Pressable
                onPress={onFavoritePress}
                style={styles.favoriteButton}
              >
                <BlurView intensity={15} style={styles.favoriteBlur}>
                  <Sparkle size={24} color="#FFFFFF" />
                </BlurView>
              </Pressable>
            </View>

            {/* Bottom - Music Styles */}
            <View style={styles.bottomRow}>
              <View style={styles.stylesContainer}>
                {displayStyles.map((style, index) => (
                  <BlurView
                    key={index}
                    intensity={15}
                    style={styles.styleBadge}
                  >
                    <Text style={styles.styleText}>{style}</Text>
                  </BlurView>
                ))}
                {remainingCount > 0 && (
                  <BlurView intensity={15} style={styles.styleBadge}>
                    <Text style={styles.styleText}>+{remainingCount}</Text>
                  </BlurView>
                )}
              </View>
            </View>
          </View>
        </ImageBackground>
      </Pressable>

      {/* Info Row - Name & Play Button */}
      <View style={styles.infoRow}>
        <View style={styles.nameContainer}>
          <Text style={styles.artistName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.artistSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {/* Play/Pause Button */}
        <Pressable onPress={onPlayPress} style={styles.playButtonContainer}>
          <BlurView intensity={2} style={styles.playButton}>
            {isArtistPlaying ? (
              <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <View style={styles.playIconWrapper}>
                <IconPlay color="#FFFFFF" />
              </View>
            )}
          </BlurView>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: "100%",
    gap: 10,
  },
  imageCard: {
    width: "100%",
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
  },
  image: {
    borderRadius: 20,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "29%",
    borderRadius: 20,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "62%",
    borderRadius: 20,
  },
  overlayGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  topRow: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    maxWidth: 100,
  },
  locationText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 32,
    overflow: "hidden",
  },
  favoriteBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomRow: {
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  stylesContainer: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
  },
  styleBadge: {
    padding: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    overflow: "hidden",
    justifyContent: "center",
  },
  styleText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
    gap: 10,
  },
  nameContainer: {
    flex: 1,
  },
  artistName: {
    ...Typography.body,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.56,
    marginBottom: -3,
  },
  artistSubtitle: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.48,
  },
  playButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
  },
  playButton: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  playIconWrapper: {
    marginLeft: 2,
    fontSize: 30,
  },
});
