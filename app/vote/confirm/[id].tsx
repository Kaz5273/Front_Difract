import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Text,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import { ChevronLeft, Check } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "@/constants/theme";
import { VoteArtistCard } from "@/components/Vote/VoteArtistCard";
import { artistsService, ArtistDetail } from "@/services/artists/artists.service";
import { votesService } from "@/services/votes/votes.service";
import { getMediaUrl } from "@/services/api/client";
import { useAuthStore } from "@/store/auth-store";

export default function VoteConfirmScreen() {
  const { id, artistId } = useLocalSearchParams<{ id: string; artistId: string }>();
  const eventId = Number(id);
  const artistIdNum = Number(artistId);
  const userId = useAuthStore((s) => s.user?.id);

  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [isLoadingArtist, setIsLoadingArtist] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!artistIdNum) return;
    artistsService.getDetail(artistIdNum)
      .then(setArtist)
      .catch(() => setArtist(null))
      .finally(() => setIsLoadingArtist(false));
  }, [artistIdNum]);

  const handleConfirm = async () => {
    if (isVoting) return;
    setIsVoting(true);
    setVoteError(null);
    try {
      await votesService.create({ user_id: userId!, artist_id: artistIdNum, event_id: eventId });
      setShowSuccess(true);
    } catch (e: any) {
      const data = e?.response?.data;
      const firstFieldError = data?.errors
        ? (Object.values(data.errors as Record<string, string[]>)[0])?.[0]
        : null;
      setVoteError(firstFieldError || data?.message || "Une erreur est survenue, réessayez.");
      setIsVoting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.replace(`/event/${id}`);
  };

  const profileMedia = artist?.media?.find((m) => m.role === "PROFILE" && m.is_primary);
  const imageUrl = profileMedia ? getMediaUrl(profileMedia) || "" : "";

  const trackMedia = artist?.media?.find((m) => m.role === "TRACK");
  const trackTitle =
    trackMedia?.title ||
    trackMedia?.path?.split("/").pop()?.replace(/\.[^.]+$/, "") ||
    "Track";

  const styles_list = [
    ...(artist?.primary_style ? [artist.primary_style.name] : []),
    ...(artist?.secondary_styles?.map((s) => s.name) ?? []),
  ];

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
          {isLoadingArtist ? (
            <View style={styles.cardPlaceholder}>
              <ActivityIndicator size="large" color="#FC5F67" />
            </View>
          ) : (
            <VoteArtistCard
              name={artist?.name ?? ""}
              trackTitle={trackTitle}
              imageUrl={imageUrl}
              styles={styles_list}
              showControls={false}
            />
          )}
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

        {voteError && (
          <Text style={styles.errorText}>{voteError}</Text>
        )}

        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable
            onPress={handleConfirm}
            style={[styles.confirmButton, isVoting && styles.confirmButtonDisabled]}
            disabled={isVoting}
          >
            {isVoting ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.confirmButtonText}>Je confirme mon vote !</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.cancelButton} disabled={isVoting}>
            <Text style={styles.cancelButtonText}>
              Je préfère prendre mon temps
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Success modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconContainer}>
              <Check size={36} color="#111111" strokeWidth={2.5} />
            </View>
            <Text style={styles.modalTitle}>Vote enregistré !</Text>
            <Text style={styles.modalBody}>
              Votre vote pour{" "}
              <Text style={styles.modalArtistName}>{artist?.name}</Text>
              {" "}a bien été pris en compte.
            </Text>
            <Pressable onPress={handleSuccessClose} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Retour à l'événement</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  cardPlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 20,
    backgroundColor: "#1D1C1B",
    justifyContent: "center",
    alignItems: "center",
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
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#FC5F67",
    textAlign: "center",
    marginTop: 16,
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
  confirmButtonDisabled: {
    opacity: 0.6,
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

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: "#1D1C1B",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: Fonts.regular,
    fontSize: 22,
    color: "#FFFFFF",
    letterSpacing: -0.88,
  },
  modalBody: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#848484",
    textAlign: "center",
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  modalArtistName: {
    fontFamily: Fonts.bold,
    color: "#FFFFFF",
  },
  modalButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 27,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.28,
  },
});
