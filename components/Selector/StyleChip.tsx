import { Fonts } from "@/constants/theme";
import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

type ChipVariant =
  | "outline"       // modal: non sélectionné (bordure noire, fond transparent)
  | "selectedBlack" // modal: sélectionné (fond noir, texte blanc)
  | "selectedWhite" // écran principal: style principal (fond blanc, texte noir)
  | "selectedGray"; // écran principal: style secondaire (fond #a0a0a0, texte noir)

interface StyleChipProps {
  id: number;
  name: string;
  onPress?: (id: number) => void;
  disabled?: boolean;
  variant?: ChipVariant;
}

export function StyleChip({
  id,
  name,
  onPress,
  disabled = false,
  variant = "outline",
}: StyleChipProps) {
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress(id);
    }
  };

  const chipStyle = [
    styles.chip,
    variant === "outline" && styles.chipOutline,
    variant === "selectedBlack" && styles.chipBlack,
    variant === "selectedWhite" && styles.chipWhite,
    variant === "selectedGray" && styles.chipGray,
    disabled && styles.chipDisabled,
  ];

  const textStyle = [
    styles.chipText,
    variant === "outline" && styles.textOutline,
    variant === "selectedBlack" && styles.textBlack,
    variant === "selectedWhite" && styles.textWhite,
    variant === "selectedGray" && styles.textGray,
    disabled && styles.textDisabled,
  ];

  return (
    <Pressable
      style={chipStyle}
      onPress={handlePress}
      disabled={disabled || !onPress}
    >
      <Text style={textStyle}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
  },

  // Outline: bordure noire, fond transparent (modal - non sélectionné)
  chipOutline: {
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "transparent",
  },
  textOutline: {
    color: "#000000",
  },

  // Noir: fond noir, texte blanc (modal - sélectionné)
  chipBlack: {
    backgroundColor: "#000000",
  },
  textBlack: {
    color: "#FFFFFF",
  },

  // Blanc: fond blanc, texte noir (écran principal - style principal)
  chipWhite: {
    backgroundColor: "#FFFFFF",
  },
  textWhite: {
    color: "#000000",
  },

  // Gris: fond gris, texte noir (écran principal - styles secondaires)
  chipGray: {
    backgroundColor: "#a0a0a0",
  },
  textGray: {
    color: "#000000",
  },

  chipDisabled: {
    opacity: 0.4,
  },

  chipText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },

  textDisabled: {
    color: "#9ca3af",
  },
});
