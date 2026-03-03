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
import { StyleBadges } from "@/components/Badges/StyleBadges";

interface ArtistVoteCardProps {
  id: string;
  name: string;
  rank: number;
  votes: number;
  imageUrl: string;
  styles: string[];
  isVoted?: boolean;
  onPress?: () => void;
}

export const ArtistVoteCard: React.FC<ArtistVoteCardProps> = ({
  name,
  rank,
  votes,
  imageUrl,
  styles: musicStyles,
  isVoted = false,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress} style={cardStyles.container}>
      {/* Artist Name */}
      <View style={cardStyles.nameRow}>
        <Text style={cardStyles.artistName} numberOfLines={1}>
          {name}
        </Text>
      </View>

      {/* Image Card */}
      <View style={[cardStyles.imageCard, isVoted && cardStyles.imageCardVoted]}>
        <ImageBackground
          source={{ uri: imageUrl }}
          style={cardStyles.imageBackground}
          imageStyle={cardStyles.image}
        >
          <View style={cardStyles.content}>
            <StyleBadges styles={musicStyles} maxVisible={1} />
            {isVoted && (
              <View style={cardStyles.votedBadgeContainer}>
                <View style={cardStyles.votedBadge}>
                  <Text style={cardStyles.votedBadgeText}>Vous avez voté !</Text>
                </View>
              </View>
            )}
          </View>
        </ImageBackground>
      </View>

      {/* Rank + Votes Pill */}
      <BlurView intensity={7} tint="dark" style={cardStyles.rankPill}>
        <View style={cardStyles.rankBadge}>
          <Text style={cardStyles.rankText}>#{rank}</Text>
        </View>
        <Text style={cardStyles.votesText}>{votes} votes</Text>
      </BlurView>
    </Pressable>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    width: 132,
    gap: 8,
  },
  nameRow: {
    paddingHorizontal: 5,
  },
  artistName: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#8C8C8C",
    letterSpacing: -0.24,
  },
  imageCard: {
    width: 132,
    height: 132,
    borderRadius: 18,
    overflow: "hidden",
  },
  imageCardVoted: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
  },
  image: {
    borderRadius: 18,
  },
  content: {
    flex: 1,
    padding: 8,
    justifyContent: "flex-start",
  },
  // Rank + Votes pill
  rankPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 32,
    paddingLeft: 2,
    paddingRight: 8,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#1D1C1B",
    alignSelf: "flex-start",
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 14,
    backgroundColor: "#383838",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
  votesText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
  votedBadgeContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  votedBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 25,
  },
  votedBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: "#000000",
    letterSpacing: -0.2,
  },
});

export default ArtistVoteCard;
