import IconGoogle from "@/components/icons/iconGoogle";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuth();

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!isFormValid) return;

    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Erreur", "Email ou mot de passe incorrect");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Back button */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Votre adresse mail</Text>
              <TextInput
                style={styles.input}
                placeholder="@"
                placeholderTextColor="#b6b6b6"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError();
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#b6b6b6"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError();
                }}
                secureTextEntry
                autoComplete="password"
                editable={!isLoading}
              />
            </View>

            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Vous avez oublié votre mot de passe ?
              </Text>
            </Pressable>
          </View>

          {/* Bottom actions */}
          <View style={styles.bottomActions}>
            <Pressable
              style={[
                styles.loginButton,
                isFormValid && styles.loginButtonActive,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={isFormValid ? "#FFFFFF" : "#6c6c6c"} />
              ) : (
                <Text
                  style={[
                    styles.loginButtonText,
                    isFormValid && styles.loginButtonTextActive,
                  ]}
                >
                  Me connecter
                </Text>
              )}
            </Pressable>

            <Pressable style={styles.googleButton} disabled={isLoading}>
              <IconGoogle />
              <Text style={styles.googleButtonText}>
                Continuer avec google
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/Auth/register-public")}
              disabled={isLoading}
            >
              <Text style={styles.createAccountText}>Créer un compte</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 18,
    zIndex: 10,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  errorContainer: {
    backgroundColor: "#FF4444",
    padding: 12,
    borderRadius: 8,
    marginTop: 100,
  },
  errorText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  form: {
    marginTop: 112,
    gap: 16,
  },
  fieldGroup: {
    gap: 16,
  },
  label: {
    fontFamily: Fonts.extraBold,
    fontSize: 17,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  input: {
    backgroundColor: "#101010",
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    height: 48,
    fontSize: 14,
    fontFamily: Fonts.regular,
    borderWidth: 1,
    borderColor: "#a6a6a6",
  },
  forgotPassword: {
    alignItems: "center",
  },
  forgotPasswordText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#b6b6b6",
    textDecorationLine: "underline",
  },
  bottomActions: {
    alignItems: "center",
    gap: 8,
    paddingBottom: 40,
  },
  loginButton: {
    backgroundColor: "#9e9e9e",
    height: 44,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loginButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#6c6c6c",
    letterSpacing: -0.28,
  },
  loginButtonTextActive: {
    color: "#000000",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    height: 48,
    borderRadius: 59,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17,
    shadowRadius: 3,
    elevation: 3,
  },
  googleButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: "#000000",
  },
  createAccountText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#b6b6b6",
    textDecorationLine: "underline",
    marginTop: 8,
  },
});
