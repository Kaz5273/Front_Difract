import React, { useState } from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import { ChevronLeft, Calendar, Check } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "@/constants/theme";

// Données brutes - à remplacer par les vraies données API
const MOCK_EVENT = {
  id: 1,
  eventDate: "2026-06-17T18:00:00.000Z",
};

function formatFullDate(dateString: string) {
  const date = new Date(dateString);
  const weekday = date.toLocaleDateString("fr-FR", { weekday: "long" });
  const dayNum = date.getDate();
  const month = date.toLocaleDateString("fr-FR", { month: "long" });
  const year = date.getFullYear();
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${dayNum} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}

export default function ParticipateConfirmScreen() {
  const { id } = useLocalSearchParams();
  const [accepted, setAccepted] = useState(false);

  const handleConfirm = () => {
    if (!accepted) return;
    // TODO: appel API pour confirmer la participation
    // Pour l'instant, retourner à la page de l'événement
    router.replace(`/event/${id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <BlurView intensity={15} style={styles.backButtonBlur}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </BlurView>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Top section */}
          <View style={styles.topSection}>
            {/* Title */}
            <Text style={styles.questionText}>
              Confirmer vous votre disponibilité pour cet événement ?
            </Text>

            {/* Date */}
            <View style={styles.dateRow}>
              <Calendar size={16} color="#FFFFFF" />
              <Text style={styles.dateText}>
                {formatFullDate(MOCK_EVENT.eventDate)}
              </Text>
            </View>

            {/* Warning */}
            <Text style={styles.warningText}>
              Si jamais vous ne venez pas, vous pourrez avoir une interdiction de
              participer.
            </Text>
          </View>

          {/* Bottom section */}
          <View style={styles.bottomSection}>
            {/* Checkbox + CGU */}
            <View style={styles.cguContainer}>
              <Pressable
                onPress={() => setAccepted(!accepted)}
                style={styles.checkboxRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    accepted && styles.checkboxChecked,
                  ]}
                >
                  {accepted && <Check size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  J'accepte les conditions générales
                </Text>
              </Pressable>

              <Pressable onPress={() => {/* TODO: ouvrir CGU */}}>
                <Text style={styles.cguLink}>
                  Conditions générales d'utilisations
                </Text>
              </Pressable>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <Pressable
                onPress={handleConfirm}
                style={[
                  styles.confirmButton,
                  !accepted && styles.confirmButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    !accepted && styles.confirmButtonTextDisabled,
                  ]}
                >
                  Je confirme ma participation
                </Text>
              </Pressable>

              <Pressable onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>
                  Je préfère prendre mon temps
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111111",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 32,
    overflow: "hidden",
  },
  backButtonBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "#373737",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
    gap: 48,
  },
  questionText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.32,
    width: 301,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    lineHeight: 14,
  },
  warningText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#8F8F8F",
    textAlign: "center",
    letterSpacing: -0.42,
    lineHeight: 18,
    width: 281,
  },
  bottomSection: {
    alignItems: "center",
    gap: 32,
  },
  cguContainer: {
    alignItems: "center",
    gap: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 22,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#F9F871",
    borderColor: "#F9F871",
  },
  checkboxLabel: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  cguLink: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#8F8F8F",
    letterSpacing: -0.42,
    lineHeight: 18,
    textDecorationLine: "underline",
  },
  buttonsContainer: {
    alignItems: "center",
    gap: 8,
  },
  confirmButton: {
    backgroundColor: "#F9F871",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 27,
    width: 323,
  },
  confirmButtonDisabled: {
    backgroundColor: "#8B8B41",
  },
  confirmButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#5F5F2B",
    letterSpacing: -0.28,
  },
  confirmButtonTextDisabled: {
    color: "#59592B",
  },
  cancelButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 27,
    width: 323,
  },
  cancelButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
});
