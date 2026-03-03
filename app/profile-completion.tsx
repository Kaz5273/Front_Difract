import {
  StepAdditionalTracks,
  TrackItem,
} from "@/components/profile-completion/StepAdditionalTracks";
import { StepGalleryPhotos } from "@/components/profile-completion/StepGalleryPhotos";
import { StepRecap } from "@/components/profile-completion/StepRecap";
import {
  SocialLinks,
  StepSocialLinks,
} from "@/components/profile-completion/StepSocialLinks";
import { Fonts } from "@/constants/theme";
import { userService } from "@/services/user/user.service";
import { ChevronLeft } from "lucide-react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "photos" | "tracks" | "social" | "recap";
const STEPS: Step[] = ["photos", "tracks", "social", "recap"];

export default function ProfileCompletionScreen() {
  const [currentStep, setCurrentStep] = useState<Step>("photos");
  const [photos, setPhotos] = useState<ImagePickerAsset[]>([]);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFromRecap, setEditingFromRecap] = useState(false);

  const currentIndex = STEPS.indexOf(currentStep);
  const isRecap = currentStep === "recap";

  const goToNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goBack = () => {
    if (editingFromRecap) {
      setEditingFromRecap(false);
      setCurrentStep("recap");
      return;
    }
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  const goToStepFromRecap = (step: Step) => {
    setEditingFromRecap(true);
    setCurrentStep(step);
  };

  const handleContinue = () => {
    if (editingFromRecap) {
      setEditingFromRecap(false);
      setCurrentStep("recap");
      return;
    }
    goToNext();
  };

  const handleSkip = () => {
    if (editingFromRecap) {
      setEditingFromRecap(false);
      setCurrentStep("recap");
      return;
    }
    goToNext();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const errors: string[] = [];

    // Upload photos (indépendant)
    if (photos.length > 0) {
      try {
        const photoFormData = new FormData();
        photos.forEach((photo, index) => {
          // iOS renvoie souvent du HEIC que le serveur refuse
          // On normalise en JPEG (ImagePicker retourne déjà du JPEG compressé)
          const mimeType = photo.mimeType?.toLowerCase() || "image/jpeg";
          const isAccepted = ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(mimeType);
          const finalType = isAccepted ? mimeType : "image/jpeg";
          const ext = finalType === "image/png" ? "png" : "jpg";

          photoFormData.append("images[]", {
            uri: photo.uri,
            type: finalType,
            name: photo.fileName?.replace(/\.heic$/i, `.${ext}`) || `gallery_${index}_${Date.now()}.${ext}`,
          } as any);
        });
        await userService.uploadGallery(photoFormData);
        console.log("✅ Gallery uploaded successfully");
      } catch (err: any) {
        console.error("❌ Gallery upload failed:", err?.response?.data || err);
        errors.push("photos de galerie");
      }
    }

    // Upload tracks (indépendant)
    if (tracks.length > 0) {
      try {
        const trackFormData = new FormData();
        tracks.forEach((track) => {
          trackFormData.append("tracks[]", {
            uri: track.file.uri,
            type: track.file.mimeType || "audio/mpeg",
            name: track.file.name,
          } as any);
          trackFormData.append("names[]", track.name);
        });
        await userService.uploadTracks(trackFormData);
        console.log("✅ Tracks uploaded successfully");
      } catch (err: any) {
        console.error("❌ Tracks upload failed:", err?.response?.data || err);
        errors.push("musiques");
      }
    }

    // Update social links (indépendant)
    const filledLinks = Object.entries(socialLinks)
      .filter(([, url]) => url.length > 0)
      .map(([platform, url]) => ({
        platform,
        // S'assurer que l'URL a un protocole (requis par le backend)
        url: /^https?:\/\//i.test(url) ? url : `https://${url}`,
      }));

    if (filledLinks.length > 0) {
      try {
        console.log("📤 Sending social links:", JSON.stringify(filledLinks));
        await userService.updateSocialLinks(filledLinks);
        console.log("✅ Social links updated successfully");
      } catch (err: any) {
        console.error("❌ Social links update failed:", err?.response?.data || err);
        errors.push("liens sociaux");
      }
    }

    setIsSubmitting(false);

    if (errors.length > 0) {
      Alert.alert(
        "Attention",
        `Certains éléments n'ont pas pu être envoyés : ${errors.join(", ")}. Vous pourrez réessayer depuis votre profil.`,
        [{ text: "Continuer", onPress: () => router.replace("/(tabs)") }]
      );
    } else {
      router.replace("/(tabs)");
    }
  };

  const headerTitle = isRecap ? "Récapitulatif" : "Compléter votre profil";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <ChevronLeft size={28} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === "photos" && (
          <StepGalleryPhotos photos={photos} onUpdate={setPhotos} />
        )}
        {currentStep === "tracks" && (
          <StepAdditionalTracks tracks={tracks} onUpdate={setTracks} />
        )}
        {currentStep === "social" && (
          <StepSocialLinks links={socialLinks} onUpdate={setSocialLinks} />
        )}
        {currentStep === "recap" && (
          <StepRecap
            photos={photos}
            tracks={tracks}
            socialLinks={socialLinks}
            onEditPhotos={() => goToStepFromRecap("photos")}
            onEditTracks={() => goToStepFromRecap("tracks")}
            onEditSocialLinks={() => goToStepFromRecap("social")}
          />
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {isRecap ? (
          <Pressable
            style={[styles.continueButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.continueButtonText}>Confirmer</Text>
            )}
          </Pressable>
        ) : (
          <>
            <Pressable style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continuer</Text>
            </Pressable>
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>
                Passer cette étape pour le moment
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
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
  headerTitle: {
    fontSize: 17,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 0,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 30,
    backgroundColor: "#111111",
    gap: 8,
  },
  continueButton: {
    width: 316,
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
  skipButton: {
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#FFFFFF",
  },
});
