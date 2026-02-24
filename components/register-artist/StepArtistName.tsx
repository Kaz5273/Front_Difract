import { Fonts } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface StepArtistNameProps {
  artistName: string;
  onUpdate: (value: string) => void;
}

export function StepArtistName({ artistName, onUpdate }: StepArtistNameProps) {
  return (
    <View style={styles.formSection}>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldTitle}>
          Quelle est votre nom d'artiste ?
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nom d'artiste"
          placeholderTextColor="#b6b6b6"
          value={artistName}
          onChangeText={onUpdate}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <Text style={styles.helperText}>
          Ce pseudonyme sera public. Il doit respecter les{" "}
          <Text style={styles.helperTextUnderline}>
            règles de la communauté
          </Text>
          .
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: 32,
    alignItems: "center",
  },
  fieldGroup: {
    width: "100%",
    maxWidth: 343,
    alignItems: "center",
    gap: 16,
  },
  fieldTitle: {
    fontSize: 17,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#101010",
    borderWidth: 1,
    borderColor: "#a6a6a6",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: "#FFFFFF",
  },
  helperText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    width: 261,
    lineHeight: 16,
  },
  helperTextUnderline: {
    textDecorationLine: "underline",
  },
});
