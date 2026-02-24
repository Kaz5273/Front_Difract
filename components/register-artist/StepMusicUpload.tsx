import { Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface StepMusicUploadProps {
  musicFile: DocumentPicker.DocumentPickerAsset | null;
  trackName: string;
  artistName: string;
  profilePhoto: ImagePickerAsset | null;
  onUpdateFile: (file: DocumentPicker.DocumentPickerAsset | null) => void;
  onUpdateTrackName: (name: string) => void;
}

export function StepMusicUpload({
  musicFile,
  trackName,
  artistName,
  profilePhoto,
  onUpdateFile,
  onUpdateTrackName,
}: StepMusicUploadProps) {
  const pickMusic = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/mpeg",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const file = result.assets[0];
      if (file.size && file.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert(
          "Fichier trop volumineux",
          `Le fichier ne doit pas dépasser ${MAX_FILE_SIZE_MB} Mo.`
        );
        return;
      }
      onUpdateFile(file);
      // Pré-remplir le titre avec le nom du fichier (sans extension)
      if (!trackName) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        onUpdateTrackName(nameWithoutExtension);
      }
    }
  };

  return (
    <View style={styles.formSection}>
      {/* Title */}
      <Text style={styles.fieldTitle}>Upload ta meilleure musique</Text>
      <Text style={styles.subtitle}>
        Choisissez bien la musique que vous souhaitez mettre en avant !
      </Text>

      {/* Mini player preview */}
      <View style={styles.playerCard}>
        <View style={styles.playerContent}>
          <View style={styles.playerLeft}>
            {/* Artist thumbnail */}
            <View style={styles.playerThumbnail}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto.uri }}
                  style={styles.playerThumbnailImage}
                />
              ) : (
                <View style={styles.playerThumbnailPlaceholder}>
                  <Ionicons name="person" size={18} color="#666" />
                </View>
              )}
            </View>
            {/* Track info */}
            <View style={styles.playerInfo}>
              <Text style={styles.playerArtist} numberOfLines={1}>
                {artistName || "Artiste"}
              </Text>
              <Text style={styles.playerTrack} numberOfLines={1}>
                {trackName || "Nom de la musique"}
              </Text>
            </View>
          </View>
          {/* Play button */}
          <View style={styles.playButton}>
            <Ionicons name="play" size={14} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* Track name input + upload button + helper */}
      <View style={styles.bottomSection}>
        <TextInput
          style={styles.input}
          placeholder="Nom de la musique"
          placeholderTextColor="#b6b6b6"
          value={trackName}
          onChangeText={onUpdateTrackName}
          autoCorrect={false}
        />

        <View style={styles.uploadGroup}>
          <Pressable onPress={pickMusic} style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>
              {musicFile ? "Changer la musique" : "Upload une musique"}
            </Text>
          </Pressable>

          <View style={styles.helperContainer}>
            <Text style={styles.helperText}>Upload au format .MP3</Text>
            <Text style={styles.helperText}>Maximum {MAX_FILE_SIZE_MB}mo</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: {
    alignItems: "center",
    gap: 16,
  },
  fieldTitle: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "#b6b6b6",
    textAlign: "center",
    maxWidth: 321,
    lineHeight: 20,
  },

  // Mini player card
  playerCard: {
    marginTop: 24,
    width: 287,
    height: 57,
    backgroundColor: "#161616",
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
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  playerInfo: {
    flex: 1,
    gap: 5,
  },
  playerArtist: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },
  playerTrack: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.52,
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

  // Bottom section
  bottomSection: {
    width: 327,
    gap: 24,
    alignItems: "center",
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
    fontFamily: Fonts.regular,
    color: "#FFFFFF",
  },
  uploadGroup: {
    alignItems: "center",
    gap: 10,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 49,
    paddingHorizontal: 36,
    paddingVertical: 13,
  },
  uploadButtonText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#FFFFFF",
  },
  helperContainer: {
    alignItems: "center",
  },
  helperText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#b6b6b6",
    textAlign: "center",
  },
});
