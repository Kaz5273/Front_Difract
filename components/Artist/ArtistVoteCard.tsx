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
import { Fonts, Typography } from "@/constants/theme";

interface ArtistVoteCardProps {
  id: string;
  name: string;
  rank: number;
  votes: number;
  imageUrl: string;
  styles: string[];
  onPress?: () => void;
}

export const ArtistVoteCard: React.FC<ArtistVoteCardProps> = ({
  name,
  rank,
  votes,
  imageUrl,
  styles: musicStyles,
  onPress,
}) => {
  // Afficher maximum 1 style + compteur
  const displayStyles = musicStyles.slice(0, 1);
  const remainingCount = musicStyles.length - 1;

  return (
    <Pressable onPress={onPress} style={cardStyles.container}>
      {/* Votes count */}
      <View style={cardStyles.votesContainer}>
        <Text style={cardStyles.votesText}>{votes} votes</Text>
      </View>

      {/* Image Card */}
      <View style={cardStyles.imageCard}>
        <ImageBackground
          source={{ uri: imageUrl }}
          style={cardStyles.imageBackground}
          imageStyle={cardStyles.image}
        >
          {/* Gradients overlay */}
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0)"]}
            locations={[0, 0.38]}
            style={cardStyles.topGradient}
          />
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.63)"]}
            locations={[0.38, 1]}
            style={cardStyles.bottomGradient}
          />
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.15)", "rgba(0, 0, 0, 0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={cardStyles.overlayGradient}
          />

          <View style={cardStyles.content}>
            {/* Rank Badge */}
            <View style={cardStyles.rankBadge}>
              <Text style={cardStyles.rankText}>{rank}</Text>
            </View>

            {/* Music Styles */}
            <View style={cardStyles.stylesContainer}>
              {displayStyles.map((style, index) => (
                <BlurView
                  key={index}
                  intensity={15}
                  style={cardStyles.styleBadge}
                >
                  <Text style={cardStyles.styleText}>{style}</Text>
                </BlurView>
              ))}
              {remainingCount > 0 && (
                <BlurView intensity={15} style={cardStyles.styleBadge}>
                  <Text style={cardStyles.styleText}>+{remainingCount}</Text>
                </BlurView>
              )}
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Artist Name */}
      <View style={cardStyles.nameContainer}>
        <Text style={cardStyles.artistName} numberOfLines={1}>
          {name}
        </Text>
      </View>
    </Pressable>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    width: 110,
    gap: 10,
    alignItems: "flex-end",
  },
  votesContainer: {
    paddingHorizontal: 5,
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  votesText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#BBBBBB",
    letterSpacing: -0.4,
  },
  imageCard: {
    width: 110,
    height: 110,
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
    height: "38%",
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
    padding: 8,
    justifyContent: "space-between",
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    color: "#000000",
    letterSpacing: -0.48,
  },
  stylesContainer: {
    flexDirection: "row",
    gap: 5,
  },
  styleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  styleText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  nameContainer: {
    paddingHorizontal: 5,
    alignSelf: "stretch",
  },
  artistName: {
    ...Typography.body,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.48,
  },
});

export default ArtistVoteCard;
