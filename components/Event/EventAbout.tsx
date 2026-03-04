import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";

interface EventAboutProps {
  description: string;
}

export function EventAbout({ description }: EventAboutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Environ 45 caractères par ligne × 6 lignes = 270 caractères
  const MAX_CHARS = 315;
  const showExpandButton = description.length > MAX_CHARS;

  return (
    <View style={styles.container}>
      {/* Titre de la section */}
      <ThemedText style={styles.sectionTitle}>
        À propos de l'événements
      </ThemedText>

      {/* Carte de description */}

        <View style={styles.descriptionContainer}>
          <ThemedText
            style={styles.descriptionText}
            numberOfLines={isExpanded ? undefined : 6}
          >
            {description}
          </ThemedText>
        </View>

        {/* Bouton "... plus" - affiché seulement si le texte dépasse */}
        {showExpandButton && (
          <Pressable
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.expandButton}
          >
            <ThemedText style={styles.expandText}>
              {isExpanded ? "... moins" : "... plus"}
            </ThemedText>
          </Pressable>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 15,
  },
  sectionTitle: {
    fontFamily: Fonts.regular,
    fontSize: 17,
    lineHeight: 17,
    letterSpacing: -0.68,
    color: "#FFFFFF",
  },
  descriptionCard: {
    borderRadius: 10,
    padding: 15,
    gap: 10,
    overflow: "hidden",
  },

  descriptionContainer: {
    position: "relative",
    backgroundColor: "#212121",
    borderRadius: 10,
    padding: 15,
    gap: 10,
    overflow: "hidden",
  },
  descriptionText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.56,
    color: "#B8B8B8",
  },
  expandButton: {
    alignSelf: "flex-end",
  },
  expandText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    letterSpacing: -0.68,
    color: "#DCDCDC",
  },
});
