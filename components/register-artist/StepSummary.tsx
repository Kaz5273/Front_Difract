import { Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pencil } from "lucide-react-native";
import type { DocumentPickerAsset } from "expo-document-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface SummaryData {
  artistName: string;
  email: string;
  primaryStyleId: number | null;
  secondaryStyleIds: number[];
  profilePhoto: ImagePickerAsset | null;
  bio: string;
  trackName: string;
  musicFile: DocumentPickerAsset | null;
}

interface StepSummaryProps {
  data: SummaryData;
  onEditStep: (step: number) => void;
}

export function StepSummary({
  data,
  onEditStep,
}: StepSummaryProps) {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        {/* Profile photo + artist name */}
        <View style={styles.profileRow}>
          <View style={styles.profilePhoto}>
            {data.profilePhoto ? (
              <Image
                source={{ uri: data.profilePhoto.uri }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={24} color="#666" />
              </View>
            )}
          </View>
          <Text style={styles.artistName}>{data.artistName || "Votre nom d'artiste"}</Text>
        </View>

        {/* Bio */}
        <Text style={styles.bioText}>
          {data.bio || "Aucune description"}
        </Text>

        {/* Mini player */}
        <View style={styles.playerCard}>
          <View style={styles.playerContent}>
            <View style={styles.playerLeft}>
              <View style={styles.playerThumbnail}>
                {data.profilePhoto ? (
                  <Image
                    source={{ uri: data.profilePhoto.uri }}
                    style={styles.playerThumbnailImage}
                  />
                ) : (
                  <View style={styles.playerThumbnailPlaceholder}>
                    <Ionicons name="person" size={14} color="#666" />
                  </View>
                )}
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerArtist} numberOfLines={1}>
                  {data.artistName || "Artiste"}
                </Text>
                <Text style={styles.playerTrack} numberOfLines={1}>
                  {data.trackName || "Nom de la musique"}
                </Text>
              </View>
            </View>
            <View style={styles.playButton}>
              <Ionicons name="play" size={12} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Pencil buttons positioned outside the card */}
        {/* Edit photo/name - top left */}
        <Pressable
          style={[styles.pencilButton, styles.pencilTopLeft]}
          onPress={() => onEditStep(3)}
          hitSlop={8}
        >
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
        </Pressable>

        {/* Edit photo - top right */}
        <Pressable
          style={[styles.pencilButton, styles.pencilTopRight]}
          onPress={() => onEditStep(0)}
          hitSlop={8}
        >
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
        </Pressable>

        {/* Edit bio - middle left */}
        <Pressable
          style={[styles.pencilButton, styles.pencilMiddleLeft]}
          onPress={() => onEditStep(4)}
          hitSlop={8}
        >
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
        </Pressable>

        {/* Edit music - bottom left */}
        <Pressable
          style={[styles.pencilButton, styles.pencilBottomLeft]}
          onPress={() => onEditStep(5)}
          hitSlop={8}
        >
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginTop: -80,
    marginHorizontal: -24,
  },
  container: {
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: "center",
    paddingHorizontal: 48,
  },
  card: {
    width: 280,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 32,
  },

  // Profile row
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  profilePhoto: {
    width: 56,
    height: 56,
    borderRadius: 5000,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  artistName: {
    fontSize: 18,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    letterSpacing: -0.3,
    flexShrink: 1,
  },

  // Bio
  bioText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "#b8b8b8",
    letterSpacing: -0.56,
    lineHeight: 20,
  },

  // Mini player
  playerCard: {
    width: "100%",
    height: 57,
    backgroundColor: "#353535",
    borderRadius: 20,
    padding: 5,
  },
  playerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 10,
  },
  playerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playerThumbnail: {
    width: 39,
    height: 39,
    borderRadius: 15,
    overflow: "hidden",
  },
  playerThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  playerThumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  playerInfo: {
    flex: 1,
    gap: 6,
  },
  playerArtist: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#FFFFFF",
    letterSpacing: -0.48,
  },
  playerTrack: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.4,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 2,
  },

  // Pencil buttons
  pencilButton: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 33,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  pencilTopLeft: {
    left: -33,
    top: 21,
  },
  pencilTopRight: {
    right: -33,
    top: 21,
  },
  pencilMiddleLeft: {
    left: -33,
    top: 110,
  },
  pencilBottomLeft: {
    left: -33,
    bottom: 16,
  },
});
