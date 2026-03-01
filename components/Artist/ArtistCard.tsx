import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import { Fonts } from "@/constants/theme";
import { MapPin, Sparkle, Pause } from "lucide-react-native";
import IconPlay from "../icons/iconPlay";
import { StyleBadges } from "@/components/Badges/StyleBadges";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

interface ArtistCardProps {
  id: string;
  name: string;
  subtitle: string;
  location: string;
  imageUrl: string;
  styles: string[];
  trackId?: string;
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

  const isArtistPlaying = currentTrack?.id === trackId && isPlaying;


  return (
    <View style={styles.container}>
      {/* Image Card */}
      <Pressable onPress={onPress} style={styles.imageCard}>
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBackground}
          imageStyle={styles.image}
        >
          <View style={styles.content}>
            {/* Top Row - Location & Favorite */}
            <View style={styles.topRow}>
              <BlurView intensity={15} tint="dark" style={styles.locationBadge}>
                <MapPin size={12} color="#FFFFFF" />
                <Text style={styles.badgeText} numberOfLines={1}>
                  {location}
                </Text>
              </BlurView>

              <Pressable onPress={onFavoritePress}>
                <BlurView intensity={15} tint="dark" style={styles.favoriteButton}>
                  <Sparkle size={20} color="#FFFFFF" />
                </BlurView>
              </Pressable>
            </View>

            {/* Bottom - Music Styles */}
            <View style={styles.bottomRow}>
              <StyleBadges styles={musicStyles} maxVisible={1} />
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

        <Pressable onPress={onPlayPress} style={styles.playButtonContainer}>
          <BlurView intensity={2} style={styles.playButton}>
            {isArtistPlaying ? (
              <Pause size={10} color="#FFFFFF" fill="#FFFFFF" />
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
    width: 180,
    gap: 8,
  },
  imageCard: {
    width: 180,
    height: 180,
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
  content: {
    flex: 1,
    padding: 8,
    justifyContent: "space-between",
  },
  // Top Row
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "rgba(26, 26, 26, 0.8)",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(26, 26, 26, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
  // Bottom Row
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    height: 32,
    gap: 10,
  },
  nameContainer: {
    flex: 1,
  },
  artistName: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.64,
  },
  artistSubtitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.48,
  },
  playButtonContainer: {
    width: 35,
    height: 35,
    borderRadius: 32,
    overflow: "hidden",
  },
  playButton: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconWrapper: {
    marginLeft: 2,
  },
});
