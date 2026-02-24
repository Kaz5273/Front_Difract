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
    gap: 10,
    paddingVertical: 13,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 26,
    backgroundColor: "#3D3D3D",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
});
