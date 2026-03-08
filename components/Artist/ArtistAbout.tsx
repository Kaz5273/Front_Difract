import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";

interface ArtistAboutProps {
  description: string;
}

export function ArtistAbout({
  description,
}: ArtistAboutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // ~38 chars/ligne × 8 lignes = 300 chars (hauteur par défaut du container)
  const MAX_CHARS = 300;
  const showExpandButton = description.length > MAX_CHARS;

  return (
    <View style={styles.container}>
      {/* Titre de la section */}
      <ThemedText style={styles.sectionTitle}>À propos de l'artiste</ThemedText>

      {/* Carte de description */}
        <View style={styles.descriptionContainer}>
          <ThemedText
            style={styles.descriptionText}
            numberOfLines={isExpanded ? undefined : 8}
          >
            {description}
          </ThemedText>
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

        {/* Bouton "... plus" - affiché seulement si le texte dépasse */}
        

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
    backgroundColor: "#212121",
  },
  artistName: {
    fontFamily: Fonts.semiBold,
    fontSize: 25,
    lineHeight: 25,
    letterSpacing: -1,
    color: "#FFFFFF",
  },
  descriptionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 15,
    letterSpacing: -0.6,
    color: "#FFFFFF",
  },
  descriptionContainer: {
    position: "relative",
    borderRadius: 10,
    padding: 15,
    minHeight: 190,
    backgroundColor: "#212121",
    overflow: "hidden",
  },
  descriptionText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.56,
    color: "#B8B8B8",
  },
  fadeGradient: {
    position: "absolute",
    bottom: 0,
    left: -15,
    right: -15,
    height: 60,
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
  infoList: {
    gap: 5,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  iconContainer: {
    width: 14,
    height: 14,
  },
  infoText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: -0.24,
    color: "#D7D7D7",
  },
});
