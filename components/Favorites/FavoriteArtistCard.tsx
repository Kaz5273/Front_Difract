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
import { Star } from "lucide-react-native";
import { Fonts, Typography } from "@/constants/theme";

type BadgeType = "date" | "votes";

interface DateInfo {
  dayOfWeek: string;
  dayNumber: string;
  month: string;
}

interface FavoriteArtistCardProps {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  isFavorite?: boolean;
  badgeType: BadgeType;
  dateInfo?: DateInfo;
  votesCount?: number;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export const FavoriteArtistCard: React.FC<FavoriteArtistCardProps> = ({
  firstName,
  lastName,
  imageUrl,
  isFavorite = true,
  badgeType,
  dateInfo,
  votesCount,
  onPress,
  onFavoritePress,
}) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        {/* Gradient du haut */}
        <LinearGradient
          colors={["#020202", "rgba(0, 0, 0, 0)"]}
          locations={[0, 1]}
          style={styles.topGradient}
        />

        {/* Gradient du bas */}
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "#020202"]}
          locations={[0, 1]}
          style={styles.bottomGradient}
        />

        <View style={styles.content}>
          {/* Nom de l'artiste en haut à gauche */}
          <View style={styles.nameContainer}>
            <Text style={styles.firstName}>{firstName}</Text>
            <Text style={styles.lastName}>{lastName}</Text>
          </View>

          {/* Badges en bas */}
          <View style={styles.bottomRow}>
            {/* Badge Date ou Votes */}
            {badgeType === "date" && dateInfo && (
              <View style={styles.dateBadge}>
                <Text style={styles.dayOfWeek}>{dateInfo.dayOfWeek}</Text>
                <Text style={styles.dayNumber}>{dateInfo.dayNumber}</Text>
                <Text style={styles.month}>{dateInfo.month}</Text>
              </View>
            )}

            {badgeType === "votes" && votesCount !== undefined && (
              <View style={styles.votesBadge}>
                <Text style={styles.votesNumber}>{votesCount}</Text>
                <Text style={styles.votesLabel}>votes</Text>
              </View>
            )}

            {/* Bouton Favoris */}
            <Pressable onPress={onFavoritePress} style={styles.favoriteButton}>
              <BlurView intensity={2} style={styles.favoriteBlur}>
                <Star
                  size={20}
                  color="#FFFFFF"
                  fill={isFavorite ? "#FFFFFF" : "transparent"}
                />
              </BlurView>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
  },
  image: {
    borderRadius: 10,
  },
  topGradient: {
    position: "absolute",
    top: -28,
    left: 0,
    right: 0,
    height: 70,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  content: {
    flex: 1,
    padding: 7,
    justifyContent: "space-between",
  },
  nameContainer: {
    alignItems: "flex-start",
    gap: 2,
  },
  firstName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: -0.6,
    gap: 2,
  },
  lastName: {
    fontFamily: Fonts.regular,
    fontSize: 25,
    color: "#FFFFFF",
    letterSpacing: -1,
    marginTop: -6,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  dateBadge: {
    width: 54,
    height: 54,
    backgroundColor: "rgba(54, 54, 54, 1)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  dayOfWeek: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  dayNumber: {
    ...Typography.body,
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: -0.8,
    textAlign: "center",
    marginTop: -4,
    marginBottom: -6,
  },
  month: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  votesBadge: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  votesNumber: {
    fontFamily: Fonts.normalBlack,
    fontSize: 20,
    color: "#000000",
    letterSpacing: -0.8,
  },
  votesLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: "#000000",
    letterSpacing: -0.4,
    lineHeight: 10,
    marginTop: -2,
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 32,
    overflow: "hidden",
  },
  favoriteBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FavoriteArtistCard;
