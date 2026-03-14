import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fonts } from "@/constants/theme";

export function FaqSection() {
  return (
    <View style={styles.faqSection}>
      <Text style={styles.faqText}>
        Vous ne trouvez pas votre bonheur ? Des questions ?
      </Text>
      <Text style={styles.faqLink}>Rendez-vous dans notre FAQ.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  faqSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 8,
    alignItems: "center",
  },
  faqText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#7B7B7B",
    textAlign: "center",
    letterSpacing: -0.24,
  },
  faqLink: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.24,
    textDecorationLine: "underline",
  },
});
