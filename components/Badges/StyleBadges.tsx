import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Fonts } from "@/constants/theme";

interface StyleBadgesProps {
  styles: string[];
  maxVisible?: number;
}

export const StyleBadges: React.FC<StyleBadgesProps> = ({
  styles: musicStyles,
  maxVisible = 2,
}) => {
  const displayStyles = musicStyles.slice(0, maxVisible);
  const remainingCount = musicStyles.length - maxVisible;

  return (
    <View style={styles.container}>
      {displayStyles.map((style, index) => (
        <BlurView
          key={index}
          intensity={15}
          tint="dark"
          style={styles.badge}
        >
          <Text style={styles.badgeText}>{style}</Text>
        </BlurView>
      ))}
      {remainingCount > 0 && (
        <BlurView
          intensity={15}
          tint="dark"
          style={styles.badge}
        >
          <Text style={styles.badgeText}>+{remainingCount}</Text>
        </BlurView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  badge: {
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 25,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(26, 26, 26, 0.8)",
  },
  badgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
});
