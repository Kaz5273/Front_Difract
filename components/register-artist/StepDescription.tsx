import { Fonts } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const MAX_BIO_LENGTH = 500;

interface StepDescriptionProps {
  bio: string;
  onUpdate: (value: string) => void;
}

export function StepDescription({ bio, onUpdate }: StepDescriptionProps) {
  return (
    <View style={styles.formSection}>
      <Text style={styles.fieldTitle}>Votre description</Text>
      <Text style={styles.subtitle}>
        C'est ce que les utilisateurs verront en premier, alors soignez la et
        représenter votre personnalité !
      </Text>

      <TextInput
        style={styles.textArea}
        placeholder="Maximum 500 caractères."
        placeholderTextColor="#b6b6b6"
        value={bio}
        onChangeText={(text) => onUpdate(text.slice(0, MAX_BIO_LENGTH))}
        multiline
        maxLength={MAX_BIO_LENGTH}
        textAlignVertical="top"
      />

      <Text style={styles.charCount}>
        {bio.length}/{MAX_BIO_LENGTH} caractères
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: {
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 321,
    alignSelf: "center",
  },
  fieldTitle: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "#b6b6b6",
    textAlign: "center",
    lineHeight: 20,
  },
  textArea: {
    width: "100%",
    height: 156,
    borderWidth: 1,
    borderColor: "#a6a6a6",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#FFFFFF",
  },
  charCount: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#b6b6b6",
    textAlign: "center",
  },
});
