import IconDifract from "@/components/icons/iconDifract";
import { Fonts } from "@/constants/theme";
import { AudioLines, Camera, Clapperboard, Link } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

interface ProfileCompletionModalProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function ProfileCompletionModal({
  visible,
  onComplete,
  onSkip,
}: ProfileCompletionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={styles.card}
        >
          <Animated.View
            entering={FadeIn.duration(300).delay(200)}
            style={styles.logoContainer}
          >
            <IconDifract width={48} height={36} />
          </Animated.View>

          <Text style={styles.title}>Complétez votre profil</Text>

          <Text style={styles.description}>
            En tant qu'abonné Pro, vous pouvez enrichir votre profil avec des photos supplémentaires, des musiques, une vidéo d'introduction et vos liens vers vos réseaux sociaux.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureRow}>
              <Camera size={18} color="rgba(255, 255, 255, 0.85)" />
              <Text style={styles.featureText}>Photos supplémentaires</Text>
            </View>
            <View style={styles.featureRow}>
              <AudioLines size={18} color="rgba(255, 255, 255, 0.85)" />
              <Text style={styles.featureText}>Musiques additionnelles</Text>
            </View>
            <View style={styles.featureRow}>
              <Clapperboard size={18} color="rgba(255, 255, 255, 0.85)" />
              <Text style={styles.featureText}>Extrait vidéo</Text>
            </View>
            <View style={styles.featureRow}>
              <Link size={18} color="rgba(255, 255, 255, 0.85)" />
              <Text style={styles.featureText}>Réseaux sociaux</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <Pressable style={styles.completeButton} onPress={onComplete}>
              <Text style={styles.completeButtonText}>
                Compléter maintenant
              </Text>
            </Pressable>

            <Pressable style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Plus tard</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.regular,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.44,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "left",
    lineHeight: 20,
    letterSpacing: -0.28,
    marginBottom: 20,
  },
  featureList: {
    width: "100%",
    gap: 12,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: -0.28,
  },
  buttons: {
    width: "100%",
    gap: 10,
    alignItems: "center",
  },
  completeButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#FC5F67",
    borderRadius: 49,
    alignItems: "center",
    justifyContent: "center",
  },
  completeButtonText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#000000",
    letterSpacing: -0.3,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.5)",
  },
});
