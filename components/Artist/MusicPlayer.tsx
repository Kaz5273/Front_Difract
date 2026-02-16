import React from "react";
import { View, StyleSheet, Pressable, FlatList } from "react-native";
import { Play, Pause } from "lucide-react-native";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
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
}

export function MusicPlayer({
  tracks,
  artistName,
  artistImage,
}: MusicPlayerProps) {
  const { currentTrack, isPlaying, play, pause } = useAudioPlayer();

  const togglePlay = (track: Track) => {
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

  const renderTrack = ({ item, index }: { item: Track; index: number }) => {
    const isTrackPlaying = currentTrack?.id === item.id && isPlaying;

    return (
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.04)"]}
        start={{ x: 0.16, y: 0 }}
        end={{ x: 0.84, y: 1 }}
        style={styles.trackContainer}
      >
        <Pressable style={styles.playButton} onPress={() => togglePlay(item)}>
          {isTrackPlaying ? (
            <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
          )}
        </Pressable>

        <View style={styles.trackInfo}>
          <ThemedText style={styles.trackNumber}>{index + 1}.</ThemedText>
          <ThemedText style={styles.trackTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
        </View>

        <ThemedText style={styles.trackDuration}>{item.duration}</ThemedText>
      </LinearGradient>
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
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 10,
    width: 250,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(252, 95, 103, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  trackInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
  },
  trackNumber: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  trackTitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    flex: 1,
  },
  trackDuration: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#B8B8B8",
  },
});
