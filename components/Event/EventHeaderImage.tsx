import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ImageBackground,
} from "react-native";
import { Share } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { Fonts, Typography } from "@/constants/theme";
import { StyleBadges } from "../Badges/StyleBadges";

interface EventHeaderImageProps {
  imageUrl: string;
  eventDate: string;
  styles?: string[];
  onSharePress?: () => void;
}

export const EventHeaderImage: React.FC<EventHeaderImageProps> = ({
  imageUrl,
  eventDate,
  styles: musicStyles = [],
  onSharePress,
}) => {
  // Format date (ex: "ven.", "06", "juin")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("fr-FR", { weekday: "short" });
    const dayNum = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("fr-FR", { month: "short" });
    return { day, dayNum, month };
  };

  const { day, dayNum, month } = formatDate(eventDate);

  return (
    <ImageBackground
      source={{ uri: imageUrl }}
      style={styles.container}
      imageStyle={styles.image}
    >
      {/* Boutons en haut à droite */}
      <View style={styles.topRightButtons}>
        {onSharePress && (
          <Pressable onPress={onSharePress} style={styles.iconButtonWrapper}>
            <BlurView intensity={15} style={styles.iconButton}>
              <Share size={20} color="#FFFFFF" strokeWidth={2.5} />
            </BlurView>
          </Pressable>
        )}
      </View>

      {/* Styles musicaux et Date en bas */}
      <View style={styles.bottomContent}>
        {/* Music Styles en bas à gauche */}
        <View style={styles.stylesContainer}>
          <StyleBadges styles={musicStyles} maxVisible={musicStyles.length} />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",

  },
  image: {
    resizeMode: "cover",
  },
  topRightButtons: {
    position: "absolute",
    top: 60,
    right: 20,
    flexDirection: "row",
    gap: 10,
    zIndex: 5,
  },
  iconButtonWrapper: {
    width: 40,
    height: 40,
    borderRadius: 50,
    overflow: "hidden",
  },
  iconButton: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    zIndex: 5,
  },
  stylesContainer: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    flex: 1,
    marginRight: 10,
  },
  styleBadge: {
    padding: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
    justifyContent: "center",
  },
  styleText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  dateBadgeContainer: {
    flexShrink: 0,
  },
  dateBadge: {
    width: 54,
    height: 54,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  dateDay: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  dateDayNum: {
    ...Typography.body,
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: -0.8,
    textAlign: "center",
    marginTop: -4,
    marginBottom: -6,
  },
  dateMonth: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
    textAlign: "center",
  },
});
