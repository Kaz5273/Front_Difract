import { CompletionScreen } from "@/components/CompletionScreen";
import IconGoogle from "@/components/icons/iconGoogle";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import type { TextInput as TextInputType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TOTAL_STEPS = 3;

export default function RegisterPublicScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCompletion, setShowCompletion] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { register, verifyEmail, resendCode, isLoading, error, clearError } =
    useAuth();
  const codeInputRefs = useRef<(TextInputType | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus le champ suivant
    if (text && index < 4) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    // Retour au champ précédent sur Backspace si vide
    if (key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendCode = async () => {
    clearError();
    if (isRegistered) {
      // Le compte existe déjà, renvoyer le code
      try {
        await resendCode(email.trim());
        Alert.alert("Succès", "Un nouveau code a été envoyé à votre adresse email.");
      } catch {
        // Erreur gérée par le store
      }
    } else {
      // Première fois : créer le compte + envoyer le code
      try {
        await register(pseudo.trim(), email.trim(), password, "PUBLIC");
        setIsRegistered(true);
        Alert.alert("Succès", "Un code de vérification a été envoyé à votre adresse email.");
      } catch {
        // Erreur gérée par le store
      }
    }
  };

  const handleResendCode = async () => {
    clearError();
    try {
      await resendCode(email.trim());
      Alert.alert("Succès", "Un nouveau code a été envoyé.");
    } catch {
      // Erreur gérée par le store
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  const handleContinue = async () => {
    clearError();

    if (currentStep === 0) {
      // Étape 0 : Pseudo
      if (!pseudo.trim()) {
        Alert.alert("Erreur", "Veuillez saisir un pseudonyme");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Étape 1 : Email + Mot de passe
      if (!email.trim()) {
        Alert.alert("Erreur", "Veuillez saisir votre adresse email");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert("Erreur", "Veuillez saisir une adresse email valide");
        return;
      }
      if (!password.trim()) {
        Alert.alert("Erreur", "Veuillez saisir un mot de passe");
        return;
      }
      if (password.length < 8) {
        Alert.alert(
          "Erreur",
          "Le mot de passe doit contenir au moins 8 caractères"
        );
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Étape 2 : Vérification du code email
      if (!isRegistered) {
        Alert.alert("Erreur", "Veuillez d'abord envoyer le code de confirmation");
        return;
      }
      if (!isCodeComplete) {
        Alert.alert("Erreur", "Veuillez saisir le code complet");
        return;
      }

      try {
        const fullCode = code.join("");
        await verifyEmail(email.trim(), fullCode);
        setShowCompletion(true);
      } catch {
        // Erreur gérée par le store
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.replace("/OnBoarding/onboarding");
    }
  };

  const handleGuest = () => {
    router.replace("/(tabs)");
  };

  if (showCompletion) {
    return <CompletionScreen onFinish={() => router.replace("/(tabs)")} />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={styles.container}>
      <View style={styles.keyboardView}>
        {/* Header: Back + Pagination */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </Pressable>
          <View style={styles.pagination}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentStep
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                ]}
              />
            ))}
          </View>
          {/* Spacer to center pagination */}
          <View style={styles.backButton} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Étape 0 : Pseudo */}
          {currentStep === 0 && (
            <View style={styles.formSection}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldTitle}>Votre pseudonyme</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Pseudonyme"
                  placeholderTextColor="#b6b6b6"
                  value={pseudo}
                  onChangeText={(text) => {
                    setPseudo(text);
                    clearError();
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <Text style={styles.helperText}>
                  Ce pseudonyme sera public. Il doit respecter les{" "}
                  <Text style={styles.helperTextUnderline}>
                    règles de la communauté
                  </Text>
                </Text>
              </View>
            </View>
          )}

          {/* Étape 1 : Email + Mot de passe */}
          {currentStep === 1 && (
            <View style={styles.formSection}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldTitle}>Votre adresse email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
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
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError();
                  }}
                  secureTextEntry
                  autoComplete="password-new"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldTitle}>Confirmez le mot de passe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer le mot de passe"
                  placeholderTextColor="#b6b6b6"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    clearError();
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
            </View>
          )}

          {/* Étape 2 : Code de confirmation */}
          {currentStep === 2 && (
            <View style={styles.formSection}>
              <View style={styles.fieldGroup}>
                <Text style={styles.codeLabel}>Code de confirmation</Text>
                <View style={styles.codeContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        codeInputRefs.current[index] = ref;
                      }}
                      style={styles.codeInput}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      onKeyPress={({ nativeEvent }) =>
                        handleCodeKeyPress(nativeEvent.key, index)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                    />
                  ))}
                </View>
              </View>

              <View style={styles.codeActionsGroup}>
                {!isRegistered ? (
                  <Pressable
                    style={[styles.sendCodeButton, isLoading && styles.buttonDisabled]}
                    onPress={handleSendCode}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.sendCodeButtonText}>
                        Envoyer un code de confirmation
                      </Text>
                    )}
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleResendCode}
                    disabled={isLoading}
                  >
                    <Text style={styles.resendCodeText}>
                      Renvoyer le code
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.continueButton,
              isLoading && styles.buttonDisabled,
              currentStep === 2 && (!isCodeComplete || !isRegistered) && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={isLoading || (currentStep === 2 && (!isCodeComplete || !isRegistered))}
          >
            {isLoading && currentStep !== 2 ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.continueButtonText}>
                {currentStep === 2 ? "Valider" : "Continuer"}
              </Text>
            )}
          </Pressable>

          {currentStep !== 2 && (
            <Pressable style={styles.googleButton} onPress={() => {}}>
              <View style={styles.googleButtonContent}>
                <IconGoogle width={20} height={20} />
                <Text style={styles.googleButtonText}>Créer avec google</Text>
              </View>
            </Pressable>
          )}

          <Pressable onPress={handleGuest} style={styles.guestButton}>
            <Text style={styles.guestText}>
              Je continue en tant qu'invité
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  keyboardView: {
    flex: 1,
    position: "relative",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paginationDot: {
    height: 5,
    borderRadius: 34,
  },
  paginationDotActive: {
    width: 40,
    backgroundColor: "#FFFFFF",
  },
  paginationDotInactive: {
    width: 16,
    backgroundColor: "#5e5e5e",
  },

  // Content
  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 220,
    paddingHorizontal: 24,
  },
  formSection: {
    gap: 32,
    alignItems: "center",
  },
  fieldGroup: {
    width: "100%",
    maxWidth: 327,
    alignItems: "center",
    gap: 15,
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
    lineHeight: 15,
  },
  helperTextUnderline: {
    textDecorationLine: "underline",
  },

  // Code verification
  codeLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.26,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  codeInput: {
    width: 33,
    height: 44,
    backgroundColor: "#101010",
    borderWidth: 1,
    borderColor: "#a6a6a6",
    borderRadius: 10,
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#FFFFFF",
  },
  codeActionsGroup: {
    width: 334,
    alignItems: "center",
    gap: 0,
  },
  sendCodeButton: {
    width: 334,
    height: 44,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 49,
    alignItems: "center",
    justifyContent: "center",
  },
  sendCodeButtonText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: "#FFFFFF",
    textAlign: "center",
  },
  resendCodeText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    paddingVertical: 13,
  },

  // Error
  errorContainer: {
    marginTop: 16,
    backgroundColor: "rgba(255, 68, 68, 0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "center",
    maxWidth: 327,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 13,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 31,
    gap: 8,
    backgroundColor: "#080808",
  },
  continueButton: {
    width: 313,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 49,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#000000",
  },
  googleButton: {
    width: 313,
    backgroundColor: "#FFFFFF",
    borderRadius: 59,
    paddingVertical: 14,
    paddingHorizontal: 54,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17,
    shadowRadius: 3,
    elevation: 3,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  googleButtonText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#000000",
  },
  guestButton: {
    paddingVertical: 13,
  },
  guestText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
