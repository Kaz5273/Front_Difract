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
import { Play, Pause } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface VoteArtistCardProps {
  name: string;
  votes: number;
  rank: number;
  imageUrl: string;
  styles: string[];
  isPlaying?: boolean;
  onPlayPress?: () => void;
}

export const VoteArtistCard: React.FC<VoteArtistCardProps> = ({
  votes,
  rank,
  imageUrl,
  styles: musicStyles,
  isPlaying = false,
  onPlayPress,
}) => {
  const displayStyles = musicStyles.slice(0, 1);
  const remainingCount = musicStyles.length - 1;

  return (
    <View style={cardStyles.container}>
      {/* Header: votes + position */}
      <View style={cardStyles.header}>
        <View style={cardStyles.votesContainer}>
          <Text style={cardStyles.votesText}>{votes} votes</Text>
        </View>
        <View style={cardStyles.positionBadge}>
          <Text style={cardStyles.positionLabel}>Position</Text>
          <Text style={cardStyles.positionValue}>#{rank}</Text>
        </View>
      </View>

      {/* Image Card */}
      <View style={cardStyles.imageCard}>
        <ImageBackground
          source={{ uri: imageUrl }}
          style={cardStyles.imageBackground}
          imageStyle={cardStyles.image}
        >
          {/* Gradient overlays */}
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.63)"]}
            locations={[0.38, 1]}
            style={cardStyles.gradient}
          />

          {/* Play Button */}
          <Pressable onPress={onPlayPress} style={cardStyles.playButton}>
            <BlurView intensity={20} style={cardStyles.playButtonBlur}>
              {isPlaying ? (
                <Pause size={24} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </BlurView>
          </Pressable>

          {/* Music Styles */}
          <View style={cardStyles.stylesContainer}>
            {displayStyles.map((style, index) => (
              <BlurView key={index} intensity={15} style={cardStyles.styleBadge}>
                <Text style={cardStyles.styleText}>{style}</Text>
              </BlurView>
            ))}
            {remainingCount > 0 && (
              <BlurView intensity={15} style={cardStyles.styleBadge}>
                <Text style={cardStyles.styleText}>+{remainingCount}</Text>
              </BlurView>
            )}
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    width: 280,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  votesContainer: {
    paddingHorizontal: 5,
  },
  votesText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.42,
  },
  positionBadge: {
    padding: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 140, 66, 0.1)",
 
    height: 28,
  },
  positionLabel: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#FF8C42",
    letterSpacing: -0.24,
  },
  positionValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FF8C42",
    letterSpacing: -0.24,
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
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -35,
    marginLeft: -35,
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
  stylesContainer: {
    flexDirection: "row",
    gap: 5,
    padding: 8,
  },
  styleBadge: {
    padding: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  styleText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
});

export default VoteArtistCard;
