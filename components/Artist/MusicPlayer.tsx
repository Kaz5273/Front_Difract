import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, FlatList, Image } from "react-native";
import { Play, Pause } from "lucide-react-native";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

interface Track {
  id: string;
  title: string;
  duration: string;
  url?: string;
}

interface MusicPlayerProps {
  tracks: Track[];
  artistName: string;
  artistImage: string;
  onBeforePlay?: (action: () => void) => void;
}

export function MusicPlayer({
  tracks,
  artistName,
  artistImage,
  onBeforePlay,
}: MusicPlayerProps) {
  const { currentTrack, isPlaying, play, pause, setPlaylist } = useAudioPlayer();

  // Enregistre la playlist dans le contexte pour que next/prev fonctionnent
  useEffect(() => {
    setPlaylist(
      tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artistName,
        artistImage,
        duration: t.duration,
        url: t.url,
      }))
    );
  }, [tracks, artistName, artistImage]);

  const togglePlay = (track: Track) => {
    const action = () => {
      if (currentTrack?.id === track.id && isPlaying) {
        pause();
      } else {
        play({
          id: track.id,
          title: track.title,
          artistName,
          artistImage,
          duration: track.duration,
          url: track.url,
        });
      }
    };
    if (onBeforePlay) {
      onBeforePlay(action);
    } else {
      action();
    }
  };

  const renderTrack = ({ item, index }: { item: Track; index: number }) => {
    const isActive = currentTrack?.id === item.id;
    const isTrackPlaying = isActive && isPlaying;

    return (
      <View style={styles.trackContainer}>
        <Image source={{ uri: artistImage }} style={styles.artistImage} />

        <View style={styles.textContainer}>
          <ThemedText style={styles.trackTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
        </View>

        <Pressable
          style={[styles.playButton, isActive && styles.playButtonActive]}
          onPress={() => togglePlay(item)}
        >
          {isTrackPlaying ? (
            <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
          )}
        </Pressable>
      </View>
    );
  };

  if (!tracks || tracks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ overflow: "visible" }}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "visible",
  },
  listContainer: {
    paddingRight: 20,
  },
  separator: {
    width: 10,
  },
  trackContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    paddingRight: 12,
    borderRadius: 20,
    backgroundColor: "#161616",
    width: 280,
    gap: 8,
  },
  artistImage: {
    width: 45,
    height: 45,
    borderRadius: 18,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    letterSpacing: -0.48,
    color: "rgba(255, 255, 255, 0.70)",
  },
  trackNumber: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: -0.4,
    marginTop: -4,
    color: "rgba(255, 255, 255, 0.7)",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 1,
  },
  playButtonActive: {
    backgroundColor: "#FC5F67",
  },
});
