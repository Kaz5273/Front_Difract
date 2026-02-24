import { Fonts } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface StepEmailPasswordProps {
  email: string;
  password: string;
  confirmPassword: string;
  onUpdateEmail: (value: string) => void;
  onUpdatePassword: (value: string) => void;
  onUpdateConfirmPassword: (value: string) => void;
}

export function StepEmailPassword({
  email,
  password,
  confirmPassword,
  onUpdateEmail,
  onUpdatePassword,
  onUpdateConfirmPassword,
}: StepEmailPasswordProps) {
  return (
    <View style={styles.formSection}>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldTitle}>Votre adresse email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#b6b6b6"
          value={email}
          onChangeText={onUpdateEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        {email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
          <Text style={styles.helperText}>
            Saisissez une adresse mail valide
          </Text>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldTitle}>Votre mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Mot de passe (min. 8 caractères)"
          placeholderTextColor="#b6b6b6"
          value={password}
          onChangeText={onUpdatePassword}
          secureTextEntry
          autoComplete="password-new"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldTitle}>Confirmez le mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor="#b6b6b6"
          value={confirmPassword}
          onChangeText={onUpdateConfirmPassword}
          secureTextEntry
        />
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
    maxWidth: 327,
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
    fontSize: 14,
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
});
