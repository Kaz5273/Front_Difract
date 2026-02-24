import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAudioPlayer as useExpoAudioPlayer } from "expo-audio";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ListFilter,
} from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import { VoteCountdown } from "@/components/Vote/VoteCountdown";
import { VoteEventCard } from "@/components/Vote/VoteEventCard";
import {
  VoteArtistCarousel,
  CarouselArtist,
} from "@/components/Vote/VoteArtistCarousel";
import { VoteTrackPlayer } from "@/components/Vote/VoteTrackPlayer";

// Musique de test (même fichier pour tous les artistes en mock)
const TEST_MUSIC = require("@/musiqueTest/1 BAKERSFIELD.wav");

// Données mock — à remplacer par l'API
const mockArtists: CarouselArtist[] = [
  {
    id: "1",
    name: "Choi",
    votes: 132,
    rank: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    styles: ["Folk", "Indie", "Rock", "Pop"],
    track: { title: "Road to hell", duration: "3:45" },
  },
  {
    id: "2",
    name: "Luna",
    votes: 156,
    rank: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop",
    styles: ["Jazz", "Soul", "R&B"],
    track: { title: "Midnight blue", duration: "4:12" },
  },
  {
    id: "3",
    name: "Nova",
    votes: 98,
    rank: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=600&fit=crop",
    styles: ["Electronic", "House"],
    track: { title: "Pulse wave", duration: "3:30" },
  },
  {
    id: "4",
    name: "Echo",
    votes: 76,
    rank: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=600&fit=crop",
    styles: ["Rock", "Alternative"],
    track: { title: "Fading lights", duration: "4:01" },
  },
];

const mockEvent = {
  eventName: "Espace rencontre",
  location: "Annecy-le-vieux",
  distance: "150km",
  dayOfWeek: "ven.",
  dayNumber: "06",
  month: "juin",
};

export default function VoteDetailScreen() {
  const { id } = useLocalSearchParams();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playingArtistId, setPlayingArtistId] = useState<string | null>(null);

  const player = useExpoAudioPlayer(TEST_MUSIC);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadedArtistIdRef = useRef<string | null>(null);

  const currentArtist = mockArtists[currentIndex];

  // Date de fin des votes (mock)
  const voteEndDate = new Date();
  voteEndDate.setDate(voteEndDate.getDate() + 1);
  voteEndDate.setHours(voteEndDate.getHours() + 3);
  voteEndDate.setMinutes(voteEndDate.getMinutes() + 39);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // Le player expo-audio se cleanup automatiquement au unmount du hook
    };
  }, []);

  // Stop and reset when changing artist
  useEffect(() => {
    stopAudio();
  }, [currentIndex]);

  const stopAudio = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    try {
      player.pause();
      player.seekTo(0);
    } catch (e) {
      // Player might not be ready yet
    }
    setPlayingArtistId(null);
    setProgress(0);
    loadedArtistIdRef.current = null;
  }, [player]);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(() => {
      if (player.duration > 0) {
        const currentProgress = player.currentTime / player.duration;
        setProgress(currentProgress);

        // Auto-stop when track ends
        if (!player.playing && player.currentTime >= player.duration - 0.1) {
          setPlayingArtistId(null);
          setProgress(0);
          player.seekTo(0);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        }
      }
    }, 250);
  }, [player]);

  const handlePlayPress = useCallback(
    (artistId: string) => {
      // Même artiste chargé : toggle pause/play (reprend où on en était)
      if (loadedArtistIdRef.current === artistId) {
        if (player.playing) {
          player.pause();
          setPlayingArtistId(null);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        } else {
          player.play();
          setPlayingArtistId(artistId);
          startProgressTracking();
        }
        return;
      }

      // Nouvel artiste : stop l'ancien, charge et joue depuis le début
      stopAudio();

      try {
        player.seekTo(0);
        player.play();
        setPlayingArtistId(artistId);
        loadedArtistIdRef.current = artistId;
        setProgress(0);
        startProgressTracking();
      } catch (error) {
        console.error("Erreur lecture audio:", error);
      }
    },
    [stopAudio, startProgressTracking, player]
  );

  const handleSeek = useCallback(
    (ratio: number) => {
      if (player.duration > 0) {
        player.seekTo(ratio * player.duration);
        setProgress(ratio);
      }
    },
    [player]
  );

  const handleVote = useCallback(() => {
    console.log("Vote pour:", currentArtist.name, "event:", id);
  }, [currentArtist, id]);

  const handleViewProfile = useCallback(() => {
    router.push(`/artist/${currentArtist.id}`);
  }, [currentArtist]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Back button */}
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft size={20} color="#FFFFFF" />
          </Pressable>

          {/* Navigation arrows */}
{/*           <View style={styles.navArrows}>
            <Pressable
              onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              style={[
                styles.iconButton,
                currentIndex === 0 && styles.iconButtonDisabled,
              ]}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() =>
                setCurrentIndex(
                  Math.min(mockArtists.length - 1, currentIndex + 1)
                )
              }
              style={[
                styles.iconButton,
                currentIndex === mockArtists.length - 1 &&
                  styles.iconButtonDisabled,
              ]}
              disabled={currentIndex === mockArtists.length - 1}
            >
              <ChevronRight size={20} color="#FFFFFF" />
            </Pressable>
          </View> */}

          {/* Sort & Filter */}
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <ArrowUpDown size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <ListFilter size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.countdownContainer}>
          <VoteCountdown endDate={voteEndDate} compact />
        </View>

        {/* Event Info */}
        <View style={styles.eventContainer}>
          <VoteEventCard
            eventName={mockEvent.eventName}
            location={mockEvent.location}
            distance={mockEvent.distance}
            dayOfWeek={mockEvent.dayOfWeek}
            dayNumber={mockEvent.dayNumber}
            month={mockEvent.month}
            showSeeMore={false}
          />
        </View>

        {/* Artist Carousel */}
        <VoteArtistCarousel
          artists={mockArtists}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          playingArtistId={playingArtistId}
          onPlayPress={handlePlayPress}
        />

        {/* Track Player */}
        <View style={styles.trackPlayerContainer}>
          <VoteTrackPlayer
            artistName={currentArtist.name}
            trackTitle={currentArtist.track.title}
            progress={progress}
            onSeek={handleSeek}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable onPress={handleVote} style={styles.voteButton}>
            <Text style={styles.voteButtonText}>Votez</Text>
          </Pressable>
          <Pressable onPress={handleViewProfile} style={styles.profileButton}>
            <Text style={styles.profileButtonText}>Voir le profil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
    gap: 10,
  },

  // Header
  header: {
    
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    height: 46,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#323232",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonDisabled: {
    opacity: 0.3,
  },
  navArrows: {
    flexDirection: "row",
    gap: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },

  // Countdown
  countdownContainer: {
    paddingHorizontal: 20,
  },

  // Event
  eventContainer: {
    paddingHorizontal: 10,
  },

  // Track Player
  trackPlayerContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },

  // Buttons
  buttonsContainer: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  voteButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  voteButtonText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.56,
  },
  profileButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  profileButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.56,
  },
});
