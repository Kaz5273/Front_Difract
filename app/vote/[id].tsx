import React, { useState, useCallback, useEffect, useRef, useMemo, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
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
import { useEventDetail } from "@/hooks/use-events";
import { VoteCountdown } from "@/components/Vote/VoteCountdown";
import {
  VoteArtistCarousel,
  CarouselArtist,
} from "@/components/Vote/VoteArtistCarousel";
import { VoteTrackPlayer } from "@/components/Vote/VoteTrackPlayer";
import { getMediaUrl } from "@/services/api/client";
import { votesService } from "@/services/votes/votes.service";
import { useAuthStore } from "@/store/auth-store";
import type { Vote } from "@/services/api/types";

export default function VoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const eventId = Number(id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { event, isLoading, error, fetchEvent } = useEventDetail(eventId);
  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  const [existingVote, setExistingVote] = useState<Vote | null>(null);

  // Check if user already voted for this event (also refreshes on screen focus)
  const checkExistingVote = useCallback(() => {
    if (!isAuthenticated || !eventId) return;
    votesService.getMyVotes()
      .then(votes => {
        setExistingVote(votes.find(v => Number(v.event_id) === eventId || Number(v.event?.id) === eventId) ?? null);
      })
      .catch(() => {});
  }, [isAuthenticated, eventId]);

  useEffect(() => { checkExistingVote(); }, [checkExistingVote]);

  useFocusEffect(useCallback(() => { checkExistingVote(); }, [checkExistingVote]));

  const { showModal, setShowModal, guard } = useGuestGuard();
  const [{ sortAsc, currentIndex }, dispatchSort] = useReducer(
    (state: { sortAsc: boolean; currentIndex: number }, action: { type: "TOGGLE_SORT" } | { type: "SET_INDEX"; index: number }) => {
      if (action.type === "TOGGLE_SORT") return { sortAsc: !state.sortAsc, currentIndex: 0 };
      return { ...state, currentIndex: action.index };
    },
    { sortAsc: false, currentIndex: 0 }
  );
  const [progress, setProgress] = useState(0);
  const [playingArtistId, setPlayingArtistId] = useState<string | null>(null);

  // Single audio player — source replaced on artist change
  const player = useExpoAudioPlayer(null);

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedArtistIdRef = useRef<string | null>(null);

  // Derive CarouselArtist list from event artists (sorted by votes desc)
  const carouselArtists = useMemo((): CarouselArtist[] => {
    if (!event?.artists?.length) return [];

    // Rank is always based on votes desc (most votes = #1), independent of display order
    // Stable sort: tiebreaker on id ensures asc is exact reverse of desc
    const descSort = (a: typeof event.artists[0], b: typeof event.artists[0]) => {
      const diff = (b.votes_count ?? 0) - (a.votes_count ?? 0);
      return diff !== 0 ? diff : a.id - b.id;
    };

    const rankMap = new Map<number, number>();
    [...event.artists]
      .sort(descSort)
      .forEach((artist, index) => rankMap.set(artist.id, index + 1));

    const sorted = [...event.artists].sort(
      sortAsc ? (a, b) => -descSort(a, b) : descSort
    );

    return sorted.map((artist) => {
      const profileMedia = artist.media?.find(
        (m) => m.role === "PROFILE" && m.is_primary
      );
      const imageUrl =
        (profileMedia ? getMediaUrl(profileMedia) : null) ||
        artist.media_url ||
        "";

      const trackMedia = artist.media?.find((m) => m.role === "TRACK");
      const trackTitle =
        trackMedia?.title ||
        trackMedia?.path?.split("/").pop()?.replace(/\.[^.]+$/, "") ||
        "Track";
      const trackUrl = trackMedia ? getMediaUrl(trackMedia) : null;

      const styles = artist.styles?.map((s) => s.name) ?? [];

      return {
        id: String(artist.id),
        name: artist.name,
        votes: artist.votes_count ?? 0,
        rank: rankMap.get(artist.id) ?? 0,
        imageUrl,
        styles,
        track: { title: trackTitle, duration: "" },
        trackUrl,
      };
    });
  }, [event?.artists, sortAsc]);

  const currentArtist = carouselArtists[currentIndex];
  const votingSecondsRemaining = event?.voting_time_remaining ?? 0;
  const isVotingOver = event?.status === "DONE" || votingSecondsRemaining <= 0;

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      if (player.duration <= 0) return;
      const currentProgress = player.currentTime / player.duration;
      setProgress(currentProgress);

      if (!player.playing && player.currentTime >= player.duration - 0.1) {
        setPlayingArtistId(null);
        setProgress(0);
        player.seekTo(0);
        stopProgressTracking();
      }
    }, 250);
  }, [player, stopProgressTracking]);

  const cancelPlayTimer = useCallback(() => {
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  // Central function: switch to an artist's track
  const transitionTo = useCallback(
    (artistId: string) => {
      cancelPlayTimer();
      stopProgressTracking();
      try {
        player.pause();
        player.seekTo(0);
      } catch (_) {}

      const artist = carouselArtists.find((a) => a.id === artistId);
      if (!artist?.trackUrl) return;

      loadedArtistIdRef.current = artistId;
      setPlayingArtistId(artistId);
      setProgress(0);

      player.replace({ uri: artist.trackUrl });
      playTimerRef.current = setTimeout(() => {
        player.play();
        startProgressTracking();
      }, 50);
    },
    [player, carouselArtists, cancelPlayTimer, stopProgressTracking, startProgressTracking]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelPlayTimer();
      stopProgressTracking();
      try { player.pause(); } catch (_) {}
    };
  }, [cancelPlayTimer, stopProgressTracking, player]);

  const handlePlayPress = useCallback(
    (artistId: string) => {
      // Same artist: toggle
      if (loadedArtistIdRef.current === artistId) {
        if (player.playing) {
          player.pause();
          setPlayingArtistId(null);
          stopProgressTracking();
        } else {
          player.play();
          setPlayingArtistId(artistId);
          startProgressTracking();
        }
        return;
      }
      transitionTo(artistId);
    },
    [player, transitionTo, startProgressTracking, stopProgressTracking]
  );

  // Auto-play when scroll settles
  const handleScrollEnd = useCallback(
    (index: number) => {
      const artist = carouselArtists[index];
      if (!artist) return;
      guard(() => transitionTo(artist.id));
    },
    [carouselArtists, transitionTo, guard]
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
    if (!currentArtist) return;
    router.push(`/vote/confirm/${id}?artistId=${currentArtist.id}`);
  }, [id, currentArtist]);

  const handleViewProfile = useCallback(() => {
    if (!currentArtist) return;
    router.push(`/artist/${currentArtist.id}`);
  }, [currentArtist]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Re-vote allowed after 7 days
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const canRevote = existingVote
    ? Date.now() - new Date(existingVote.created_at).getTime() >= ONE_WEEK_MS
    : false;
  const daysRemaining = existingVote && !canRevote
    ? Math.ceil((ONE_WEEK_MS - (Date.now() - new Date(existingVote.created_at).getTime())) / (24 * 60 * 60 * 1000))
    : 0;

  const activeDuration = player.duration ?? 0;
  const currentTimeStr = activeDuration > 0 ? formatTime(progress * activeDuration) : "0:00";
  const durationStr = activeDuration > 0 ? formatTime(activeDuration) : "0:00";

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FC5F67" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Événement introuvable"}</Text>
          <Pressable onPress={() => router.back()} style={styles.voteButton}>
            <Text style={styles.voteButtonText}>Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
              {event.title}
            </Text>
            <Pressable onPress={() => router.push(`/event/${id}`)}>
              <Text style={styles.headerSubtitle}>En savoir plus</Text>
            </Pressable>
          </View>
        </View>

        {/* Countdown row */}
        <View style={styles.countdownRow}>
          <Text style={styles.countdownLabel}>Fin des votes :</Text>
          <VoteCountdown secondsRemaining={votingSecondsRemaining} />
        </View>

        {/* Carousel Section: Rank + Carousel + Player */}
        {carouselArtists.length > 0 && currentArtist ? (
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

              <Pressable
                style={styles.sortButton}
                onPress={() => {
                  dispatchSort({ type: "TOGGLE_SORT" });
                  setPlayingArtistId(null);
                  try { player.pause(); } catch (_) {}
                }}
              >
                <ArrowDownUp size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Artist Carousel — key forces remount on sort change so FlatList reorders views */}
            <VoteArtistCarousel
              key={sortAsc ? "asc" : "desc"}
              artists={carouselArtists}
              currentIndex={currentIndex}
              onIndexChange={(index) => dispatchSort({ type: "SET_INDEX", index })}
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
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun artiste inscrit pour cet événement</Text>
          </View>
        )}

        {/* Action Buttons */}
        {currentArtist && (
          <View style={styles.buttonsContainer}>
            {isVotingOver ? (
              <View style={styles.alreadyVotedBanner}>
                <Text style={styles.alreadyVotedText}>La session de vote est terminée</Text>
                {existingVote && (
                  <Text style={styles.alreadyVotedSub}>
                    Vous aviez voté pour{" "}
                    <Text style={styles.alreadyVotedName}>
                      {carouselArtists.find((a) => a.id === String(existingVote.artist_id))?.name ?? "un artiste"}
                    </Text>
                  </Text>
                )}
              </View>
            ) : existingVote && !canRevote ? (
              <View style={styles.alreadyVotedBanner}>
                <Text style={styles.alreadyVotedText}>
                  Vous avez voté pour{" "}
                  <Text style={styles.alreadyVotedName}>
                    {carouselArtists.find((a) => a.id === String(existingVote.artist_id))?.name ?? "un artiste"}
                  </Text>
                </Text>
                <Text style={styles.alreadyVotedSub}>
                  Vous pourrez changer dans{" "}
                  <Text style={styles.alreadyVotedName}>
                    {daysRemaining} jour{daysRemaining > 1 ? "s" : ""}
                  </Text>
                </Text>
              </View>
            ) : (
              <Pressable onPress={() => guard(handleVote)} style={styles.voteButton}>
                <Text style={styles.voteButtonText}>
                  {canRevote ? "Changer mon vote" : "Votez"}
                </Text>
              </Pressable>
            )}
            <Pressable onPress={handleViewProfile} style={styles.profileButton}>
              <Text style={styles.profileButtonText}>Voir le profil</Text>
            </Pressable>
          </View>
        )}
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
    paddingRight: 2,
  },
  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
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

  // Carousel section
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

  // States
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#848484",
    textAlign: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#848484",
    textAlign: "center",
  },
  alreadyVotedBanner: {
    backgroundColor: "#1D1C1B",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  alreadyVotedText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#848484",
    letterSpacing: -0.28,
    textAlign: "center",
  },
  alreadyVotedSub: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#848484",
    letterSpacing: -0.24,
    marginTop: 2,
  },
  alreadyVotedName: {
    fontFamily: Fonts.regular,
    color: "#FFFFFF",
  },
});
