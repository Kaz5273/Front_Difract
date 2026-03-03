import { Fonts } from "@/constants/theme";
import { Pencil, Play, X } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const MAX_TRACKS = 4;
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface TrackItem {
  file: DocumentPicker.DocumentPickerAsset;
  name: string;
}

interface StepAdditionalTracksProps {
  tracks: TrackItem[];
  onUpdate: (tracks: TrackItem[]) => void;
}

function TrackRow({
  track,
  onRemove,
  onRename,
}: {
  track: TrackItem;
  onRemove: () => void;
  onRename: (name: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <View style={styles.trackRow}>
      {/* Remove button */}
      <Pressable onPress={onRemove} style={styles.actionButton}>
        <X size={20} color="#FFFFFF" />
      </Pressable>

      {/* Rename button */}
      <Pressable
        onPress={() => setIsEditing(!isEditing)}
        style={styles.actionButton}
      >
        <Pencil size={20} color="#FFFFFF" />
      </Pressable>

      {/* Track bar */}
      <View style={styles.trackBar}>
        {isEditing ? (
          <TextInput
            style={styles.trackNameInput}
            value={track.name}
            onChangeText={onRename}
            onBlur={() => setIsEditing(false)}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Text style={styles.trackName} numberOfLines={1}>
            {track.name}
          </Text>
        )}

        {/* Play button */}
        <View style={styles.playButton}>
          <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      </View>
    </View>
  );
}

export function StepAdditionalTracks({
  tracks,
  onUpdate,
}: StepAdditionalTracksProps) {
  const pickTrack = async () => {
    if (tracks.length >= MAX_TRACKS) {
      Alert.alert(
        "Limite atteinte",
        `Vous pouvez ajouter ${MAX_TRACKS} musiques maximum.`
      );
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: ["audio/mpeg", "audio/wav", "audio/ogg"],
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
      const name = file.name.replace(/\.[^/.]+$/, "");
      onUpdate([...tracks, { file, name }]);
    }
  };

  const removeTrack = (index: number) => {
    onUpdate(tracks.filter((_, i) => i !== index));
  };

  const renameTrack = (index: number, name: string) => {
    const updated = [...tracks];
    updated[index] = { ...updated[index], name };
    onUpdate(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload d'autres musiques</Text>
      <Text style={styles.subtitle}>
        Ces musiques seront complémentaires de votre musique principale !
      </Text>

      {/* Track list */}
      <View style={styles.trackList}>
        {tracks.map((track, index) => (
          <TrackRow
            key={index}
            track={track}
            onRemove={() => removeTrack(index)}
            onRename={(name) => renameTrack(index, name)}
          />
        ))}
      </View>

      {/* Upload button */}
      {tracks.length < MAX_TRACKS && (
        <Pressable onPress={pickTrack} style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload une musique</Text>
        </Pressable>
      )}

      {/* Counter */}
      <Text style={styles.counterText}>
        {tracks.length}/{MAX_TRACKS} musiques chargées
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 17,
    fontFamily: Fonts.regular,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "#b6b6b6",
    textAlign: "center",
    letterSpacing: -0.3,
    maxWidth: 321,
  },

  // Track list
  trackList: {
    width: 328,
    gap: 18,
    marginTop: 8,
  },

  // Track row
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 44,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  trackBar: {
    flex: 1,
    backgroundColor: "#161616",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 15,
    paddingRight: 5,
    paddingVertical: 10,
  },
  trackName: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.6,
  },
  trackNameInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: "#FFFFFF",
    letterSpacing: -0.6,
    padding: 0,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Upload
  uploadButton: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 49,
    paddingHorizontal: 36,
    paddingVertical: 13,
  },
  uploadButtonText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#FFFFFF",
  },

  // Counter
  counterText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#b6b6b6",
    marginTop: 8,
  },
});
