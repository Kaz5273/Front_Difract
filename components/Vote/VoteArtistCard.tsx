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
import { Play, Pause, SkipBack, SkipForward } from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import { StyleBadges } from "@/components/Badges/StyleBadges";

interface VoteArtistCardProps {
  name: string;
  trackTitle: string;
  imageUrl: string;
  styles: string[];
  isPlaying?: boolean;
  onPlayPress?: () => void;
  onPrevPress?: () => void;
  onNextPress?: () => void;
}

export const VoteArtistCard: React.FC<VoteArtistCardProps> = ({
  name,
  trackTitle,
  imageUrl,
  styles: musicStyles,
  isPlaying = false,
  onPlayPress,
  onPrevPress,
  onNextPress,
}) => {
  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.imageCard}>
        <ImageBackground
          source={{ uri: imageUrl }}
          style={cardStyles.imageBackground}
          imageStyle={cardStyles.image}
        >
          {/* Gradient overlay */}
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.63)"]}
            locations={[0.38, 1]}
            style={cardStyles.gradient}
          />

          {/* Play Controls - centered */}
          <View style={cardStyles.controlsRow}>
            <Pressable onPress={onPrevPress} style={cardStyles.smallControlButton}>
              <SkipBack size={14} color="#FFFFFF" fill="#FFFFFF" />
            </Pressable>

            <Pressable onPress={onPlayPress} style={cardStyles.playButton}>
              <BlurView intensity={20} style={cardStyles.playButtonBlur}>
                {isPlaying ? (
                  <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
                )}
              </BlurView>
            </Pressable>

            <Pressable onPress={onNextPress} style={cardStyles.smallControlButton}>
              <SkipForward size={14} color="#FFFFFF" fill="#FFFFFF" />
            </Pressable>
          </View>

          {/* Bottom content: artist name + track + styles */}
          <View style={cardStyles.bottomContent}>
            <View style={cardStyles.artistInfo}>
              <Text style={cardStyles.artistName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={cardStyles.trackTitle} numberOfLines={1}>
                {trackTitle}
              </Text>
            </View>
            <StyleBadges styles={musicStyles} maxVisible={1} />
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    width: 280,
  },
  imageCard: {
    width: 280,
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  image: {
    borderRadius: 20,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },

  // Play controls
  controlsRow: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    marginTop: -35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  smallControlButton: {
    width: 40,
    height: 40,
    borderRadius: 33,
    backgroundColor: "rgba(26, 26, 26, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
  },
  playButtonBlur: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  // Bottom content
  bottomContent: {
    padding: 8,
    gap: 12,
    alignItems: "center",
  },
  artistInfo: {
    alignItems: "center",
  },
  artistName: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
  trackTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.32,
  },
});

export default VoteArtistCard;
