import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { BlurView } from "expo-blur";
import { ChevronLeft, MapPin, Calendar, Clock } from "lucide-react-native";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { EventHeaderImage } from "@/components/Event/EventHeaderImage";
import { EventAbout } from "@/components/Event/EventAbout";
import { ArtistVoteCard } from "@/components/Artist/ArtistVoteCard";
import { VoteCountdown } from "@/components/Vote/VoteCountdown";
import { Fonts } from "@/constants/theme";
import { useGuestGuard } from "@/hooks/use-guest-guard";
import { GuestActionModal } from "@/components/GuestActionModal";
import { useEventDetail } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { getMediaUrl } from "@/services/api/client";
import { Artist } from "@/services/api/types";
import { markEventsNeedRefresh } from "@/store/events-store";
import { locationService } from "@/services/location/location.service";
import { haversineKm } from "@/utils/distance";

function getVotingSecondsRemaining(
  votingTimeRemaining?: number | null,
  votingEndDate?: string | null
): number {
  if (votingTimeRemaining != null && votingTimeRemaining > 0) return votingTimeRemaining;
  if (votingEndDate) return Math.max(0, Math.floor((new Date(votingEndDate).getTime() - Date.now()) / 1000));
  return 0;
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTimeRange(eventDate: string, endTime?: string | null): string {
  const start = new Date(eventDate);
  const startH = start.getHours().toString().padStart(2, "0");
  const startM = start.getMinutes().toString().padStart(2, "0");
  if (!endTime) return `${startH}h${startM}`;
  const end = new Date(endTime);
  const endH = end.getHours().toString().padStart(2, "0");
  const endM = end.getMinutes().toString().padStart(2, "0");
  return `${startH}h${startM} à ${endH}h${endM}`;
}

function getArtistImage(artist: Artist): string {
  const profileMedia = artist.media?.find((m) => m.role === "PROFILE" && m.is_primary);
  return profileMedia ? getMediaUrl(profileMedia) || "" : artist.media_url || "";
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const eventId = Number(id);
  const { showModal, setShowModal, guard } = useGuestGuard();
  const { user } = useAuth();
  const { event, isLoading, error, fetchEvent } = useEventDetail(eventId);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    locationService.getCachedLocation().then((c) => { if (c) setUserCoords(c); });
  }, []);

  // Chargement initial + refresh silencieux au retour sur l'écran
  useFocusEffect(useCallback(() => { fetchEvent(); }, [fetchEvent]));

  // Détecter quand is_voting_open passe de true → false pour signaler le refresh
  const prevVotingOpenRef = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (prevVotingOpenRef.current === true && event?.is_voting_open === false) {
      markEventsNeedRefresh();
    }
    prevVotingOpenRef.current = event?.is_voting_open;
  }, [event?.is_voting_open]);

  // Auto-refresh quand les votes sont ouverts :
  // - Polling de fond toutes les 30s (détecte une fermeture anticipée)
  // - 5s avant la fin prévue → poll toutes les 1s pour mise à jour précise
  // voting_time_remaining exclu des dépendances pour éviter le feedback loop
  useEffect(() => {
    if (!event?.is_voting_open) return;

    const remaining = event.voting_time_remaining;
    let fastTimer: ReturnType<typeof setTimeout>;
    let fastInterval: ReturnType<typeof setInterval>;

    // Polling de fond : détecte fermeture anticipée dans les 30s
    const slowInterval = setInterval(() => { fetchEvent(); }, 30_000);

    // Polling rapide dans les 5 dernières secondes
    if (remaining != null && remaining > 5) {
      fastTimer = setTimeout(() => {
        fastInterval = setInterval(() => { fetchEvent(); }, 1_000);
      }, (remaining - 5) * 1000);
    } else {
      fastInterval = setInterval(() => { fetchEvent(); }, 1_000);
    }

    return () => {
      clearInterval(slowInterval);
      clearTimeout(fastTimer);
      clearInterval(fastInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.is_voting_open, fetchEvent]);

  if (isLoading && !event) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FC5F67" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Événement introuvable"}</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#FC5F67", fontFamily: Fonts.bold }}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  // Artistes triés par votes_count décroissant → rang
  const sortedArtists = [...(event.artists || [])].sort(
    (a, b) => (b.votes_count || 0) - (a.votes_count || 0)
  );

  // Artistes pour lesquels l'user a déjà voté dans cet événement
  const votedArtistIds = new Set(
    (event.votes || [])
      .filter((v) => v.user_id === user?.id)
      .map((v) => v.artist_id)
  );

  const isArtist = user?.role === "ARTIST";
  const isVotingOpen = event.is_voting_open === true;
  const eventEndDate = event.end_time ? new Date(event.end_time) : new Date(event.event_date);
  const isEventPast = event.status === "DONE" || eventEndDate < new Date();

  return (
    <View style={{ flex: 1 }}>
      {/* Bouton Retour */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <BlurView intensity={15} style={styles.backButtonBlur}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </BlurView>
      </Pressable>

      <ParallaxScrollView
        headerBackgroundColor={{ light: "#111111", dark: "#111111" }}
        showsVerticalScrollIndicator={false}
        headerImage={
          <EventHeaderImage
            imageUrl={event.image_url || ""}
            eventDate={event.event_date}
            styles={event.styles?.map((s) => s.name) || []}
            onSharePress={() => guard(() => {})}
          />
        }
      >
        <ThemedView style={styles.contentContainer}>
          {/* Title + Countdown / Vote terminé */}
          <View style={styles.titleRow}>
            <ThemedText style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </ThemedText>
            {event.is_voting_open ? (
              <VoteCountdown secondsRemaining={getVotingSecondsRemaining(event.voting_time_remaining, event.voting_end_date)} />
            ) : isEventPast ? (
              <View style={styles.voteDoneBadge}>
                <Clock size={20} color="#000000" />
                <Text style={styles.voteDoneBadgeText}>Événement passé</Text>
              </View>
            ) : event.voting_end_date ? (
              <View style={styles.voteDoneBadge}>
                <Clock size={20} color="#000000" />
                <Text style={styles.voteDoneBadgeText}>Vote terminé</Text>
              </View>
            ) : null}
          </View>

          {/* Event Info */}
          <View style={styles.eventInfoContainer}>
            <View style={styles.infoRow}>
              <Calendar size={16} color="#FFFFFF" />
              <Text style={styles.infoText}>
                {formatEventDate(event.event_date)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={16} color="#FFFFFF" />
              <Text style={styles.infoText}>
                {formatTimeRange(event.event_date, event.end_time)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#FFFFFF" />
              <Text style={styles.infoText}>
                {event.location}
                {(() => {
                  if (!userCoords || event.latitude == null || event.longitude == null) return "";
                  const km = Math.round(haversineKm(userCoords.latitude, userCoords.longitude, event.latitude, event.longitude));
                  return km > 0 ? ` - ${km} km` : "";
                })()}
              </Text>
            </View>
          </View>

          {/* Bouton Participer — artistes uniquement */}
          {isArtist && (
            <Pressable
              onPress={() => guard(() => router.push(`/event/participate/${event.id}`))}
              style={styles.participateButton}
            >
              <Text style={styles.participateButtonText}>
                Participer à l'événement
              </Text>
            </Pressable>
          )}

          {/* Les participants */}
          {sortedArtists.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Les participants</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.participantsScroll}
                style={{ overflow: "visible" }}
              >
                {sortedArtists.map((artist, index) => (
                  <ArtistVoteCard
                    key={artist.id}
                    id={String(artist.id)}
                    name={artist.name}
                    rank={index + 1}
                    votes={artist.votes_count || 0}
                    imageUrl={getArtistImage(artist)}
                    styles={artist.styles?.map((s) => s.name) || []}
                    isVoted={votedArtistIds.has(artist.id)}
                    onPress={() => router.push(`/artist/${artist.id}`)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {isVotingOpen && (
              <Pressable
                onPress={() => guard(() => router.push(`/vote/${event.id}`))}
                style={styles.voteButton}
              >
                <Text style={styles.voteButtonText}>
                  Votez pour votre artiste préféré
                </Text>
              </Pressable>
            )}

            {!isVotingOpen && !isEventPast && (
              <Pressable
                onPress={() => guard(() => router.push(`/ticket/buy/${event.id}`))}
                style={styles.ticketButton}
              >
                <Text style={styles.ticketButtonText}>
                  Accéder à la billeterie
                </Text>
              </Pressable>
            )}
          </View>

          {/* À propos de l'événement */}
          {event.description ? (
            <EventAbout description={event.description} />
          ) : null}
        </ThemedView>
      </ParallaxScrollView>

      <GuestActionModal visible={showModal} onClose={() => setShowModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FFFFFF",
    fontFamily: Fonts.bold,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 50,
    overflow: "hidden",
    zIndex: 10,
  },
  backButtonBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 2,
  },
  contentContainer: {
    gap: 24,
    backgroundColor: "#111111",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  eventTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 24,
    lineHeight: 32,
    flex: 1,
    letterSpacing: -0.72,
  },
  eventInfoContainer: {
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
  sectionContainer: {
    gap: 12,
    overflow: "visible",
  },
  sectionTitle: {
    fontFamily: Fonts.regular,
    fontSize: 20,
    letterSpacing: -0.68,
    color: "#FFFFFF",
  },
  participantsScroll: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 4,
  },
  buttonsContainer: {
    gap: 12,
    alignItems: "center",
  },
  participateButton: {
    backgroundColor: "#F9F871",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 100,
    width: "100%",
  },
  participateButtonText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#006141",
    textAlign: "center",
    letterSpacing: -0.56,
  },
  voteButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 100,
    width: "100%",
  },
  voteButtonText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    letterSpacing: -0.56,
  },
  ticketButton: {
    backgroundColor: "#FC5F67",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    width: "100%",
  },
  ticketButtonText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    letterSpacing: -0.56,
  },
  voteDoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 30,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  voteDoneBadgeText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#000000",
    letterSpacing: -0.24,
  },
});
