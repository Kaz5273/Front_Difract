import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StyleChip } from "@/components/Selector/StyleChip";
import type { MusicStyle } from "@/services/api/types";

interface StyleSelectorProps {
  musicStyles: MusicStyle[]; // ✅ RENOMMÉ : styles → musicStyles
  primaryStyleId: number | null;
  secondaryStyleIds: number[];
  onPrimaryStyleChange: (styleId: number) => void;
  onSecondaryStyleToggle: (styleId: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function StyleSelector({
  musicStyles, // ✅ RENOMMÉ
  primaryStyleId,
  secondaryStyleIds,
  onPrimaryStyleChange,
  onSecondaryStyleToggle,
  isLoading = false,
  error = null,
}: StyleSelectorProps) {
  // Affichage du loader
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>
          Chargement des styles musicaux...
        </Text>
      </View>
    );
  }

  // Affichage erreur
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  // Aucun style disponible
  if (musicStyles.length === 0) {
    // ✅ Utilise musicStyles
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Aucun style musical disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section : Style principal */}
      <View style={styles.section}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Style principal</Text>
          <Text style={styles.required}>*</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Choisissez votre style musical principal
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {musicStyles.map(
            (
              style // ✅ Utilise musicStyles
            ) => (
              <StyleChip
                key={`primary-${style.id}`}
                id={style.id}
                name={style.name}
                isSelected={primaryStyleId === style.id}
                onPress={onPrimaryStyleChange}
                variant="primary"
              />
            )
          )}
        </ScrollView>
      </View>

      {/* Section : Styles secondaires */}
      <View style={styles.section}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Styles secondaires</Text>
          <Text style={styles.optional}>{secondaryStyleIds.length}/3</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Choisissez jusqu'à 3 styles secondaires (facultatif)
        </Text>

        <View style={styles.chipsWrapper}>
          {musicStyles // ✅ Utilise musicStyles
            .filter((style) => style.id !== primaryStyleId)
            .map((style) => {
              const isSelected = secondaryStyleIds.includes(style.id);
              const isDisabled = !isSelected && secondaryStyleIds.length >= 3;

              return (
                <StyleChip
                  key={`secondary-${style.id}`}
                  id={style.id}
                  name={style.name}
                  isSelected={isSelected}
                  onPress={onSecondaryStyleToggle}
                  disabled={isDisabled}
                  variant="secondary"
                />
              );
            })}
        </View>
      </View>
    </View>
  );
}

// ✅ StyleSheet.create utilise le nom 'styles' (pas de conflit maintenant)
const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  required: {
    fontSize: 16,
    color: "#ef4444",
    marginLeft: 4,
    fontWeight: "bold",
  },
  optional: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
    fontWeight: "500",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  chipsContainer: {
    paddingVertical: 4,
  },
  chipsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    padding: 16,
  },
});
