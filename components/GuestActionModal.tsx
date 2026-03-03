import IconDifract from "@/components/icons/iconDifract";
import { Fonts } from "@/constants/theme";
import { router } from "expo-router";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

interface GuestActionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function GuestActionModal({ visible, onClose }: GuestActionModalProps) {
  const handleCreateAccount = () => {
    onClose();
    router.push("/OnBoarding/onboarding");
  };

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

          <Text style={styles.title}>Créez votre compte</Text>

          <Text style={styles.description}>
            Créez un compte pour profiter de toutes les fonctionnalités de
            Difract : écouter de la musique, voter pour vos artistes préférés,
            et bien plus encore.
          </Text>

          <View style={styles.buttons}>
            <Pressable style={styles.createButton} onPress={handleCreateAccount}>
              <Text style={styles.createButtonText}>Créer un compte</Text>
            </Pressable>

            <Pressable style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>
                Je continue à visiter
              </Text>
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
    marginBottom: 28,
  },
  buttons: {
    width: "100%",
    gap: 10,
    alignItems: "center",
  },
  createButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 49,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#000000",
    letterSpacing: -0.3,
  },
  continueButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.5)",
  },
});
