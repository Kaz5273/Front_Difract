import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAudioPlayer as useExpoAudioPlayer } from "expo-audio";
import {
  ChevronLeft,
  EllipsisVertical,
  ArrowDownUp,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { Fonts } from "@/constants/theme";
import { useGuestGuard } from "@/hooks/use-guest-guard";
import { GuestActionModal } from "@/components/GuestActionModal";
import { VoteCountdown } from "@/components/Vote/VoteCountdown";
import {
  VoteArtistCarousel,
  CarouselArtist,
} from "@/components/Vote/VoteArtistCarousel";
import { VoteTrackPlayer } from "@/components/Vote/VoteTrackPlayer";

// Musiques locales de test — à remplacer par l'API
const TRACK_BAKERSFIELD = require("@/musiqueTest/1 BAKERSFIELD.wav");
const TRACK_LIFE_IS_COOL = require("@/musiqueTest/6-LIFE-IS-COOL.mp3");

// Données mock — à remplacer par l'API
const mockArtists: CarouselArtist[] = [
  {
    id: "1",
    name: "Choi",
    votes: 124,
    rank: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    styles: ["Techno", "House", "Minimal", "Ambient", "Electro", "Trance"],
    track: { title: "Bakersfield", duration: "4:34" },
  },
  {
    id: "2",
    name: "Luna",
    votes: 156,
    rank: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop",
    styles: ["Jazz", "Soul", "R&B"],
    track: { title: "Life is cool", duration: "4:12" },
  },
  {
    id: "3",
    name: "Nova",
    votes: 98,
    rank: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=600&fit=crop",
    styles: ["Electronic", "House"],
    track: { title: "Bakersfield", duration: "3:30" },
  },
  {
    id: "4",
    name: "Echo",
    votes: 76,
    rank: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=600&fit=crop",
    styles: ["Rock", "Alternative"],
    track: { title: "Life is cool", duration: "4:01" },
  },
];


export default function VoteDetailScreen() {
  const { id } = useLocalSearchParams();

  const { showModal, setShowModal, guard } = useGuestGuard();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playingArtistId, setPlayingArtistId] = useState<string | null>(null);

  // One player per unique audio source
  const playerBakersfield = useExpoAudioPlayer(TRACK_BAKERSFIELD);
  const playerLifeIsCool = useExpoAudioPlayer(TRACK_LIFE_IS_COOL);

  const players: Record<string, ReturnType<typeof useExpoAudioPlayer>> = useMemo(
    () => ({
      "1": playerBakersfield,
      "2": playerLifeIsCool,
      "3": playerBakersfield,
      "4": playerLifeIsCool,
    }),
    [playerBakersfield, playerLifeIsCool]
  );

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedArtistIdRef = useRef<string | null>(null);
  const activePlayerRef = useRef<ReturnType<typeof useExpoAudioPlayer> | null>(null);

  const currentArtist = mockArtists[currentIndex];

  // Date de fin des votes (mock)
  const voteEndDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(date.getHours() + 3);
    date.setMinutes(date.getMinutes() + 39);
    return date;
  }, []);

  // Get the player for a given artist
  const getPlayer = useCallback(
    (artistId: string) => players[artistId] ?? playerBakersfield,
    [players, playerBakersfield]
  );

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      const p = activePlayerRef.current;
      if (!p || p.duration <= 0) return;

      const currentProgress = p.currentTime / p.duration;
      setProgress(currentProgress);

      if (!p.playing && p.currentTime >= p.duration - 0.1) {
        setPlayingArtistId(null);
        setProgress(0);
        p.seekTo(0);
        stopProgressTracking();
      }
    }, 250);
  }, [stopProgressTracking]);

  // Cancel any pending play timer
  const cancelPlayTimer = useCallback(() => {
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  // Stop the currently active player
  const stopActivePlayer = useCallback(() => {
    if (activePlayerRef.current) {
      try {
        activePlayerRef.current.pause();
        activePlayerRef.current.seekTo(0);
      } catch (_) {}
    }
  }, []);

  // Central function: transition to a given artist's track
  const transitionTo = useCallback(
    (artistId: string) => {
      cancelPlayTimer();
      stopProgressTracking();
      stopActivePlayer();

      const nextPlayer = getPlayer(artistId);
      activePlayerRef.current = nextPlayer;
      loadedArtistIdRef.current = artistId;
      setPlayingArtistId(artistId);
      setProgress(0);
      nextPlayer.seekTo(0);
      playTimerRef.current = setTimeout(() => {
        nextPlayer.play();
        startProgressTracking();
      }, 50);
    },
    [getPlayer, cancelPlayTimer, stopProgressTracking, stopActivePlayer, startProgressTracking]
  );

  // Cleanup all timers + stop player on unmount
  useEffect(() => {
    return () => {
      cancelPlayTimer();
      stopProgressTracking();
      stopActivePlayer();
    };
  }, [cancelPlayTimer, stopProgressTracking, stopActivePlayer]);

  const handlePlayPress = useCallback(
    (artistId: string) => {
      const p = getPlayer(artistId);

      // Same artist: toggle play/pause
      if (loadedArtistIdRef.current === artistId && activePlayerRef.current === p) {
        if (p.playing) {
          p.pause();
          setPlayingArtistId(null);
          stopProgressTracking();
        } else {
          p.play();
          setPlayingArtistId(artistId);
          startProgressTracking();
        }
        return;
      }

      // Different artist: transition
      transitionTo(artistId);
    },
    [getPlayer, transitionTo, startProgressTracking, stopProgressTracking]
  );

  // When scroll settles: play the landed-on artist (only if authenticated)
  const handleScrollEnd = useCallback(
    (index: number) => {
      const artist = mockArtists[index];
      if (!artist) return;
      guard(() => transitionTo(artist.id));
    },
    [transitionTo, guard]
  );

  const handleSeek = useCallback(
    (ratio: number) => {
      const p = activePlayerRef.current;
      if (p && p.duration > 0) {
        p.seekTo(ratio * p.duration);
        setProgress(ratio);
      }
    },
    []
  );

  const handleVote = useCallback(() => {
    router.push(`/vote/confirm/${id}`);
  }, [id]);

  const handleViewProfile = useCallback(() => {
    router.push(`/artist/${currentArtist.id}`);
  }, [currentArtist]);

  // Format current playback time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const activePlayer = activePlayerRef.current;
  const activeDuration = activePlayer?.duration ?? 0;
  const currentTimeStr =
    activeDuration > 0 ? formatTime(progress * activeDuration) : "0:00";
  const durationStr =
    activeDuration > 0 ? formatTime(activeDuration) : "0:00";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <ChevronLeft size={20} color="#FFFFFF" />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Espace rencontre
            </Text>
            <Text style={styles.headerSubtitle}>En savoir plus</Text>
          </View>

          <Pressable style={styles.headerButtonRight}>
            <EllipsisVertical size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Countdown row */}
        <View style={styles.countdownRow}>
          <Text style={styles.countdownLabel}>Fin des votes :</Text>
          <VoteCountdown endDate={voteEndDate} />
        </View>

        {/* Carousel Section: Rank + Carousel + Player */}
        <View style={styles.carouselSection}>
          {/* Rank pill + Sort button */}
          <View style={styles.rankRow}>
            <View style={styles.rankSpacer} />

            <BlurView intensity={7} tint="dark" style={styles.rankPill}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{currentArtist.rank}</Text>
              </View>
              <Text style={styles.rankVotes}>
                {currentArtist.votes} votes
              </Text>
            </BlurView>

            <Pressable style={styles.sortButton}>
              <ArrowDownUp size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Artist Carousel */}
          <VoteArtistCarousel
            artists={mockArtists}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            onScrollEnd={handleScrollEnd}
            playingArtistId={playingArtistId}
            onPlayPress={(artistId: string) => guard(() => handlePlayPress(artistId))}
          />

          {/* Track Player */}
          <View style={styles.trackPlayerContainer}>
            <VoteTrackPlayer
              currentTime={currentTimeStr}
              duration={durationStr}
              progress={progress}
              onSeek={handleSeek}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable onPress={() => guard(handleVote)} style={styles.voteButton}>
            <Text style={styles.voteButtonText}>Votez</Text>
          </Pressable>
          <Pressable onPress={handleViewProfile} style={styles.profileButton}>
            <Text style={styles.profileButtonText}>Voir le profil</Text>
          </Pressable>
        </View>
      </ScrollView>

      <GuestActionModal visible={showModal} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 48,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 44,
    
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#212121",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 2, // Visual centering for the left chevron
  },
  headerButtonRight: {
     width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#212121",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",

  },
  headerTitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.64,
  },
  headerSubtitle: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#848484",
    letterSpacing: -0.48,
  },

  // Countdown
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  countdownLabel: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.56,
  },

  // Rank row
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 18,
  },
  rankSpacer: {
    width: 40,
  },
  rankPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 40,
    paddingLeft: 4,
    paddingRight: 8,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#1D1C1B",
  },
  rankBadge: {
    width: 33,
    height: 32,
    borderRadius: 24,
    backgroundColor: "#383838",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  rankVotes: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: "#212121",
    justifyContent: "center",
    alignItems: "center",
  },

  // Carousel section (rank + carousel + player)
  carouselSection: {
    gap: 16,
    alignItems: "center",
  },

  // Track Player
  trackPlayerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 8,
  },

  // Buttons
  buttonsContainer: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 26,
  },
  voteButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  voteButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.28,
  },
  profileButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  profileButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
});
