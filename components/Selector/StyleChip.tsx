import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

interface StyleChipProps {
  id: number;
  name: string;
  isSelected: boolean;
  onPress: (id: number) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

/**
 * Composant représentant un chip de style musical
 */
export function StyleChip({
  id,
  name,
  isSelected,
  onPress,
  disabled = false,
  variant = "primary",
}: StyleChipProps) {
  const handlePress = () => {
    if (!disabled) {
      onPress(id);
    }
  };

  return (
    <Pressable
      style={[
        styles.chip,
        isSelected && styles.chipSelected,
        disabled && styles.chipDisabled,
        variant === "secondary" && styles.chipSecondary,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.chipText,
          isSelected && styles.chipTextSelected,
          disabled && styles.chipTextDisabled,
        ]}
      >
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSecondary: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  chipDisabled: {
    opacity: 0.5,
    backgroundColor: "#f9fafb",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  chipTextDisabled: {
    color: "#9ca3af",
  },
});
