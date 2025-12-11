import React from "react";
import { StyleSheet, View } from "react-native";

interface OnboardingPaginationProps {
  totalSlides: number;
  currentIndex: number;
}

export function OnboardingPagination({
  totalSlides,
  currentIndex,
}: OnboardingPaginationProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === currentIndex && styles.dotActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#FFFFFF",
  },
});
