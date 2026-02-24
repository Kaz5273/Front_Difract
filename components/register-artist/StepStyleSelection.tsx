import { StyleChip } from "@/components/Selector/StyleChip";
import { StylePickerModal } from "@/components/Selector/StylePickerModal";
import { Fonts } from "@/constants/theme";
import { MusicStyle } from "@/services/api/types";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface StepStyleSelectionProps {
  musicStyles: MusicStyle[];
  isLoading: boolean;
  error: string | null;
  primaryStyleId: number | null;
  secondaryStyleIds: number[];
  onPrimaryStyleChange: (id: number) => void;
  onSecondaryStyleToggle: (id: number) => void;
  onSecondaryStylesSet?: (ids: number[]) => void;
}

export function StepStyleSelection({
  musicStyles,
  isLoading,
  error,
  primaryStyleId,
  secondaryStyleIds,
  onPrimaryStyleChange,
  onSecondaryStyleToggle,
  onSecondaryStylesSet,
}: StepStyleSelectionProps) {
  const [primaryModalVisible, setPrimaryModalVisible] = useState(false);
  const [secondaryModalVisible, setSecondaryModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const primaryStyle = musicStyles.find((s) => s.id === primaryStyleId);
  const secondaryStyles = musicStyles.filter((s) =>
    secondaryStyleIds.includes(s.id)
  );

  const handlePrimaryConfirm = (selectedIds: number[]) => {
    if (selectedIds.length > 0) {
      onPrimaryStyleChange(selectedIds[0]);
    }
  };

  const handleSecondaryConfirm = (selectedIds: number[]) => {
    if (onSecondaryStylesSet) {
      onSecondaryStylesSet(selectedIds);
    } else {
      const toRemove = secondaryStyleIds.filter(
        (id) => !selectedIds.includes(id)
      );
      const toAdd = selectedIds.filter(
        (id) => !secondaryStyleIds.includes(id)
      );
      toRemove.forEach(onSecondaryStyleToggle);
      toAdd.forEach(onSecondaryStyleToggle);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.formSection}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Quelles sont vos styles de musique ?</Text>
        <Text style={styles.subtitle}>
          Quelles style de musique faites vous et vous défini le mieux !
        </Text>
      </View>

      {/* Primary style */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLabelGroup}>
            <Text style={styles.sectionLabel}>Votre style principale</Text>
            <Text style={styles.sectionHint}>1 style max.</Text>
          </View>
          <Pressable
            style={styles.changeButton}
            onPress={() => setPrimaryModalVisible(true)}
          >
            <Text style={styles.changeButtonText}>Changer</Text>
          </Pressable>
        </View>
        {primaryStyle && (
          <View style={styles.chipsRow}>
            <StyleChip
              id={primaryStyle.id}
              name={primaryStyle.name}
              variant="selectedWhite"
            />
          </View>
        )}
      </View>

      {/* Secondary styles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLabelGroup}>
            <Text style={styles.sectionLabel}>Vos autres styles</Text>
            <Text style={styles.sectionHint}>3 styles max.</Text>
          </View>
          <Pressable
            style={styles.changeButton}
            onPress={() => setSecondaryModalVisible(true)}
          >
            <Text style={styles.changeButtonText}>Changer</Text>
          </Pressable>
        </View>
        {secondaryStyles.length > 0 && (
          <View style={styles.chipsRow}>
            {secondaryStyles.map((s) => (
              <StyleChip
                key={s.id}
                id={s.id}
                name={s.name}
                variant="selectedGray"
              />
            ))}
          </View>
        )}
      </View>

      {/* Primary modal */}
      <StylePickerModal
        visible={primaryModalVisible}
        onClose={() => setPrimaryModalVisible(false)}
        musicStyles={musicStyles}
        mode="primary"
        selectedIds={primaryStyleId ? [primaryStyleId] : []}
        onConfirm={handlePrimaryConfirm}
      />

      {/* Secondary modal */}
      <StylePickerModal
        visible={secondaryModalVisible}
        onClose={() => setSecondaryModalVisible(false)}
        musicStyles={musicStyles.filter((s) => s.id !== primaryStyleId)}
        mode="secondary"
        selectedIds={secondaryStyleIds}
        onConfirm={handleSecondaryConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: 32,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  section: {
    gap: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabelGroup: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#FFFFFF",
  },
  sectionHint: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "rgba(255, 255, 255, 0.6)",
  },
  changeButton: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 49,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  changeButtonText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#FFFFFF",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },
});
