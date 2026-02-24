import { Fonts } from "@/constants/theme";
import { StepArtistName } from "@/components/register-artist/StepArtistName";
import { CompletionScreen } from "@/components/CompletionScreen";
import { StepDescription } from "@/components/register-artist/StepDescription";
import { StepEmailPassword } from "@/components/register-artist/StepEmailPassword";
import { StepMusicUpload } from "@/components/register-artist/StepMusicUpload";
import { StepProfilePhoto } from "@/components/register-artist/StepProfilePhoto";
import { StepStyleSelection } from "@/components/register-artist/StepStyleSelection";
import { StepSubscription } from "@/components/register-artist/StepSubscription";
import { StepSummary } from "@/components/register-artist/StepSummary";
import { useAuth } from "@/hooks/use-auth";
import { MusicStyle } from "@/services/api/types";
import { stylesService } from "@/services/styles/styles.service";
import { subscriptionService } from "@/services/subscription/subscription.service";
import { userService } from "@/services/user/user.service";
import { Ionicons } from "@expo/vector-icons";
import type { DocumentPickerAsset } from "expo-document-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
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

const TOTAL_STEPS = 10;

interface ArtistRegistrationData {
  artistName: string;
  email: string;
  password: string;
  confirmPassword: string;
  primaryStyleId: number | null;
  secondaryStyleIds: number[];
  profilePhoto: ImagePickerAsset | null;
  bio: string;
  trackName: string;
  musicFile: DocumentPickerAsset | null;
  subscriptionPlan: "pro" | "standard";
}

export default function RegisterArtistScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ArtistRegistrationData>({
    artistName: "",
    email: "",
    password: "",
    confirmPassword: "",
    primaryStyleId: null,
    secondaryStyleIds: [],
    profilePhoto: null,
    bio: "",
    trackName: "",
    musicFile: null,
    subscriptionPlan: "pro",
  });
  const [musicStyles, setMusicStyles] = useState<MusicStyle[]>([]);
  const [stylesLoading, setStylesLoading] = useState(true);
  const [stylesError, setStylesError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFromSummary, setEditingFromSummary] = useState(false);
  const [code, setCode] = useState(["", "", "", "", ""]);
  const codeInputRefs = useRef<(TextInputType | null)[]>([]);

  const { register, verifyEmail, resendCode, isLoading, error, clearError } = useAuth();

  // Charger les styles musicaux au montage
  useEffect(() => {
    stylesService
      .getStyles()
      .then((styles) => setMusicStyles(Array.isArray(styles) ? styles : []))
      .catch(() => setStylesError("Impossible de charger les styles musicaux"))
      .finally(() => setStylesLoading(false));
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 4) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    clearError();
    try {
      await resendCode(data.email.trim());
      Alert.alert("Succès", "Un nouveau code a été envoyé.");
    } catch {
      // Erreur gérée par le store
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  const handleSecondaryStyleToggle = (id: number) => {
    const current = data.secondaryStyleIds;
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : current.length < 3
        ? [...current, id]
        : current;
    setData((prev) => ({ ...prev, secondaryStyleIds: updated }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Créer le compte artiste (bio inclus dans le payload register)
      await register(
        data.artistName.trim(),
        data.email.trim(),
        data.password,
        "ARTIST",
        data.primaryStyleId,
        data.secondaryStyleIds,
        data.bio.trim() || undefined
      );

      // 2. Upload photo de profil
      if (data.profilePhoto) {
        const formData = new FormData();
        formData.append("image", {
          uri: data.profilePhoto.uri,
          type: data.profilePhoto.mimeType || "image/jpeg",
          name: data.profilePhoto.fileName || "profile.jpg",
        } as any);
        await userService.uploadProfilePicture(formData);
      }

      // 3. Upload musique
      if (data.musicFile) {
        const formData = new FormData();
        formData.append("tracks[]", {
          uri: data.musicFile.uri,
          type: data.musicFile.mimeType || "audio/mpeg",
          name: data.musicFile.name || "track.mp3",
        } as any);
        await userService.uploadTracks(formData);
      }

      setCurrentStep(7); // Aller à la vérification du code email
    } catch (err) {
      // L'erreur est gérée par le store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const { checkout_url } = await subscriptionService.checkout(
        data.subscriptionPlan
      );

      // Ouvre le checkout LemonSqueezy dans un navigateur in-app (modal)
      const result = await WebBrowser.openBrowserAsync(checkout_url, {
        presentationStyle:
          WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        dismissButtonStyle: "close",
        toolbarColor: "#080808",
        controlsColor: "#FFFFFF",
      });

      // Après fermeture du navigateur, vérifier le statut de l'abonnement
      if (result.type === "cancel" || result.type === "dismiss") {
        const status = await subscriptionService.getStatus();
        if (status.subscribed) {
          setCurrentStep(9); // Aller à la page de complétion
        } else {
          Alert.alert(
            "Paiement non finalisé",
            "Vous pouvez réessayer ou annuler pour continuer sans abonnement."
          );
        }
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Erreur lors du paiement";
      Alert.alert("Erreur", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    clearError();

    switch (currentStep) {
      case 0: // Nom d'artiste
        if (!data.artistName.trim()) {
          Alert.alert("Erreur", "Veuillez saisir votre nom d'artiste");
          return;
        }
        break;

      case 1: // Email + Mot de passe
        if (!data.email.trim()) {
          Alert.alert("Erreur", "Veuillez saisir votre adresse email");
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
          Alert.alert("Erreur", "Veuillez saisir une adresse email valide");
          return;
        }
        if (!data.password.trim()) {
          Alert.alert("Erreur", "Veuillez saisir un mot de passe");
          return;
        }
        if (data.password.length < 8) {
          Alert.alert(
            "Erreur",
            "Le mot de passe doit contenir au moins 8 caractères"
          );
          return;
        }
        if (data.password !== data.confirmPassword) {
          Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
          return;
        }
        break;

      case 2: // Styles musicaux
        if (!data.primaryStyleId) {
          Alert.alert("Erreur", "Veuillez choisir un style musical principal");
          return;
        }
        break;

      case 3: // Photo de profil
        if (!data.profilePhoto) {
          Alert.alert("Erreur", "Veuillez sélectionner une photo de profil");
          return;
        }
        break;

      case 4: // Description
        if (!data.bio.trim()) {
          Alert.alert("Erreur", "Veuillez saisir une description");
          return;
        }
        break;

      case 5: // Musique
        if (!data.trackName.trim()) {
          Alert.alert("Erreur", "Veuillez saisir le nom de la musique");
          return;
        }
        if (!data.musicFile) {
          Alert.alert("Erreur", "Veuillez sélectionner un fichier audio");
          return;
        }
        break;

      case 6: // Récapitulatif -> Soumission
        await handleSubmit();
        return;

      case 7: // Vérification du code email
        if (!isCodeComplete) {
          Alert.alert("Erreur", "Veuillez saisir le code complet");
          return;
        }
        try {
          const fullCode = code.join("");
          await verifyEmail(data.email.trim(), fullCode);
          setCurrentStep(8); // Aller à l'abonnement
        } catch {
          // Erreur gérée par le store
        }
        return;

      case 8: // Abonnement -> Checkout
        await handleCheckout();
        return;

      case 9: // Completion -> Accès à l'app
        router.replace("/(tabs)");
        return;
    }

    // Si on édite depuis le récap, retourner au récap
    if (editingFromSummary) {
      setEditingFromSummary(false);
      setCurrentStep(6);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (editingFromSummary) {
      setEditingFromSummary(false);
      setCurrentStep(6);
      return;
    }
    if (currentStep >= 7) {
      // Pas de retour possible après la soumission
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.replace("/OnBoarding/onboarding");
    }
  };

  const handleEditStep = (step: number) => {
    setEditingFromSummary(true);
    setCurrentStep(step);
  };

  const isLastStep = currentStep === 9;
  const showHeader = !isLastStep;
  const showFooter = !isLastStep;
  const buttonLoading = isLoading || isSubmitting;

  const getButtonLabel = () => {
    if (currentStep === 6) return "Confirmer";
    if (currentStep === 7) return "Valider";
    if (currentStep === 8) return "Valider l'inscription";
    return "Continuer";
  };

  // Écran de complétion plein écran
  if (currentStep === 9) {
    return (
      <CompletionScreen onFinish={() => router.replace("/(tabs)")} />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.keyboardView}>
          {/* Header */}
          {showHeader && (
            <View style={styles.header}>
              <Pressable
                onPress={handleBack}
                style={styles.backButton}
                disabled={currentStep >= 7}
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={currentStep >= 7 ? "transparent" : "#FFFFFF"}
                />
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
              <View style={styles.backButton} />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {currentStep === 0 && (
              <StepArtistName
                artistName={data.artistName}
                onUpdate={(v) =>
                  setData((prev) => ({ ...prev, artistName: v }))
                }
              />
            )}

            {currentStep === 1 && (
              <StepEmailPassword
                email={data.email}
                password={data.password}
                confirmPassword={data.confirmPassword}
                onUpdateEmail={(v) =>
                  setData((prev) => ({ ...prev, email: v }))
                }
                onUpdatePassword={(v) =>
                  setData((prev) => ({ ...prev, password: v }))
                }
                onUpdateConfirmPassword={(v) =>
                  setData((prev) => ({ ...prev, confirmPassword: v }))
                }
              />
            )}

            {currentStep === 2 && (
              <StepStyleSelection
                musicStyles={musicStyles}
                isLoading={stylesLoading}
                error={stylesError}
                primaryStyleId={data.primaryStyleId}
                secondaryStyleIds={data.secondaryStyleIds}
                onPrimaryStyleChange={(id) =>
                  setData((prev) => ({ ...prev, primaryStyleId: id }))
                }
                onSecondaryStyleToggle={handleSecondaryStyleToggle}
                onSecondaryStylesSet={(ids) =>
                  setData((prev) => ({ ...prev, secondaryStyleIds: ids }))
                }
              />
            )}

            {currentStep === 3 && (
              <StepProfilePhoto
                profilePhoto={data.profilePhoto}
                onUpdate={(photo) =>
                  setData((prev) => ({ ...prev, profilePhoto: photo }))
                }
              />
            )}

            {currentStep === 4 && (
              <StepDescription
                bio={data.bio}
                onUpdate={(v) => setData((prev) => ({ ...prev, bio: v }))}
              />
            )}

            {currentStep === 5 && (
              <StepMusicUpload
                musicFile={data.musicFile}
                trackName={data.trackName}
                artistName={data.artistName}
                profilePhoto={data.profilePhoto}
                onUpdateFile={(file) =>
                  setData((prev) => ({ ...prev, musicFile: file }))
                }
                onUpdateTrackName={(name) =>
                  setData((prev) => ({ ...prev, trackName: name }))
                }
              />
            )}

            {currentStep === 6 && (
              <StepSummary
                data={data}
                onEditStep={handleEditStep}
              />
            )}

            {currentStep === 7 && (
              <View style={styles.formSection}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.codeLabel}>Code de confirmation</Text>
                  <Text style={styles.codeHelper}>
                    Un code a été envoyé à {data.email}
                  </Text>
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
                <Pressable onPress={handleResendCode} disabled={isLoading}>
                  <Text style={styles.resendCodeText}>Renvoyer le code</Text>
                </Pressable>
              </View>
            )}

            {currentStep === 8 && (
              <StepSubscription
                selectedPlan={data.subscriptionPlan}
                onSelectPlan={(plan) =>
                  setData((prev) => ({ ...prev, subscriptionPlan: plan }))
                }
              />
            )}

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          {showFooter && (
            <View style={styles.footer}>
              <Pressable
                style={[
                  styles.continueButton,
                  buttonLoading && styles.buttonDisabled,
                ]}
                onPress={handleContinue}
                disabled={buttonLoading}
              >
                {buttonLoading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.continueButtonText}>
                    {getButtonLabel()}
                  </Text>
                )}
              </Pressable>
              {currentStep === 8 && (
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => router.replace("/(tabs)")}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </Pressable>
              )}
            </View>
          )}
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
    gap: 6,
  },
  paginationDot: {
    height: 5,
    borderRadius: 34,
  },
  paginationDotActive: {
    width: 30,
    backgroundColor: "#FFFFFF",
  },
  paginationDotInactive: {
    width: 12,
    backgroundColor: "#5e5e5e",
  },

  // Content
  content: {
    flex: 1,
    paddingTop: 80,
    paddingBottom: 150,
    paddingHorizontal: 24,
  },

  // Form
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

  // Code verification
  codeLabel: {
    fontSize: 17,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  codeHelper: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
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
    backgroundColor: "#080808",
  },
  continueButton: {
    width: 311,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 49,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  continueButtonText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#000000",
  },
  cancelButton: {
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    width: 310,
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#9d9d9d",
  },
});
