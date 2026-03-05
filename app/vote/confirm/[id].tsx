import React from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import { ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "@/constants/theme";
import { VoteArtistCard } from "@/components/Vote/VoteArtistCard";

// Données brutes - à remplacer par les vraies données API
const MOCK_ARTIST = {
  id: "1",
  name: "Choi",
  trackTitle: "Road to hell",
  imageUrl:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
  styles: ["Techno", "House", "Minimal", "Ambient", "Electro", "Trance"],
};

export default function VoteConfirmScreen() {
  const { id } = useLocalSearchParams();

  const handleConfirm = () => {
    // TODO: appel API pour confirmer le vote
    router.replace(`/vote/${id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <BlurView intensity={15} style={styles.backButtonBlur}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </BlurView>
          </Pressable>
        </View>

        {/* Artist Card */}
        <View style={styles.cardContainer}>
          <VoteArtistCard
            name={MOCK_ARTIST.name}
            trackTitle={MOCK_ARTIST.trackTitle}
            imageUrl={MOCK_ARTIST.imageUrl}
            styles={MOCK_ARTIST.styles}
            showControls={false}
          />
        </View>

        {/* Question */}
        <Text style={styles.questionText}>
          Étes-vous sur de vouloir voter pour cet artiste ?
        </Text>

        {/* Warning text */}
        <Text style={styles.warningText}>
          <Text style={styles.warningGray}>
            Attention, vous ne pourrez pas changer{" "}
          </Text>
          <Text style={styles.warningWhite}>
            votre vote avant une semaine{" "}
          </Text>
          <Text style={styles.warningGray}>
            et si vous avez déjà voté alors le{" "}
          </Text>
          <Text style={styles.warningWhite}>vote sera annulé</Text>
          <Text style={styles.warningGray}> !</Text>
        </Text>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>
              Je confirme mon vote !
            </Text>
          </Pressable>

          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>
              Je préfère prendre mon temps
            </Text>
          </Pressable>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 48,
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
  cardContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  questionText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.64,
    alignSelf: "center",
    width: 239,
    marginBottom: 48,
  },
  warningText: {
    textAlign: "center",
    alignSelf: "center",
    width: 281,
  },
  warningGray: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#8F8F8F",
    letterSpacing: -0.42,
    lineHeight: 18,
  },
  warningWhite: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.42,
    lineHeight: 18,
  },
  buttonsContainer: {
    alignItems: "center",
    gap: 8,
  },
  confirmButton: {
    backgroundColor: "#FFFFFF",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 27,
    width: 323,
  },
  confirmButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.28,
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
