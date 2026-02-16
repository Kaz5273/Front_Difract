import { useAuth } from "@/hooks/use-auth";
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
import { useStyles } from "@/hooks/useStyle";
import { StyleSelector } from "@/components/Selector/StyleSelector";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"PUBLIC" | "ARTIST">("PUBLIC");
  const { register, isLoading, error, clearError } = useAuth();
  const [primaryStyleId, setPrimaryStyleId] = useState<number | null>(null);
  const [secondaryStyleIds, setSecondaryStyleIds] = useState<number[]>([]);
  const {
    styles: musicStyles,
    isLoading: stylesLoading,
    error: stylesError,
  } = useStyles();

  const handleRoleChange = (newRole: "PUBLIC" | "ARTIST") => {
    setRole(newRole);

    // Réinitialiser les styles si on passe à PUBLIC
    if (newRole === "PUBLIC") {
      setPrimaryStyleId(null);
      setSecondaryStyleIds([]);
      console.log("🧹 Styles reset (role changed to PUBLIC)");
    }
  };

  const handlePrimaryStyleChange = (styleId: number) => {
    setPrimaryStyleId(styleId);
    console.log("🎵 Primary style set to:", styleId);
  };

  const handleSecondaryStyleToggle = (styleId: number) => {
    // Si le style est déjà sélectionné, on le retire
    if (secondaryStyleIds.includes(styleId)) {
      const newIds = secondaryStyleIds.filter((id) => id !== styleId);
      setSecondaryStyleIds(newIds);
      console.log("➖ Secondary style removed:", styleId);
      return;
    }

    // Si on a déjà 3 styles, on refuse d'en ajouter plus
    if (secondaryStyleIds.length >= 3) {
      Alert.alert(
        "Limite atteinte",
        "Vous ne pouvez sélectionner que 3 styles secondaires maximum"
      );
      return;
    }

    // Ajout du nouveau style
    const newIds = [...secondaryStyleIds, styleId];
    setSecondaryStyleIds(newIds);
    console.log("➕ Secondary style added:", styleId);
  };

  const handleRegister = async () => {
    // Validation
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 8 caractères"
      );
      return;
    }

    if (role === "ARTIST") {
      if (primaryStyleId === null) {
        Alert.alert(
          "Style manquant",
          "Vous devez sélectionner un style musical principal"
        );
        return;
      }
    }

    try {
      await register(
        name.trim(),
        email.trim(),
        password,
        role,
        primaryStyleId,
        secondaryStyleIds
      );
      // Redirection après inscription réussie
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer le compte");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Inscription</Text>
            <Text style={styles.subtitle}>Rejoignez Difract</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              placeholderTextColor="#666"
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearError();
              }}
              autoCapitalize="words"
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
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

            <TextInput
              style={styles.input}
              placeholder="Mot de passe (min. 8 caractères)"
              placeholderTextColor="#666"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError();
              }}
              secureTextEntry
              autoComplete="password-new"
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError();
              }}
              secureTextEntry
              editable={!isLoading}
            />

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Je suis :</Text>
              <View style={styles.roleButtons}>
                <Pressable
                  style={[
                    styles.roleButton,
                    role === "PUBLIC" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("PUBLIC")}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === "PUBLIC" && styles.roleButtonTextActive,
                    ]}
                  >
                    Public
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.roleButton,
                    role === "ARTIST" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("ARTIST")}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === "ARTIST" && styles.roleButtonTextActive,
                    ]}
                  >
                    Artiste
                  </Text>
                </Pressable>
              </View>
            </View>
            {role === "ARTIST" && (
              <View style={styles.stylesSection}>
                <Text style={styles.stylesSectionTitle}>
                  Vos styles musicaux
                </Text>
                <Text style={styles.stylesSectionSubtitle}>
                  Sélectionnez vos préférences musicales
                </Text>

                <StyleSelector
                  musicStyles={musicStyles} // ✅ Passer musicStyles (pas styles)
                  primaryStyleId={primaryStyleId}
                  secondaryStyleIds={secondaryStyleIds}
                  onPrimaryStyleChange={handlePrimaryStyleChange}
                  onSecondaryStyleToggle={handleSecondaryStyleToggle}
                  isLoading={stylesLoading}
                  error={stylesError}
                />
              </View>
            )}
            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>Créer mon compte</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <Pressable
              onPress={() => router.push("/Auth/Login")}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>Se connecter</Text>
            </Pressable>
          </View>

          {/* Back button */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.backText}>← Retour</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "500",
  },
  roleButtons: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
  },
  roleButtonActive: {
    borderColor: "#FC5F67",
    backgroundColor: "#2a1a1c",
  },
  roleButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  roleButtonTextActive: {
    color: "#FC5F67",
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FF4444",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  linkText: {
    color: "#FC5F67",
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 15,
    alignItems: "center",
  },
  backText: {
    color: "#666",
    fontSize: 14,
  },
  stylesSection: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  stylesSectionHeader: {
    marginBottom: 12,
  },
  stylesSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  stylesSectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});
