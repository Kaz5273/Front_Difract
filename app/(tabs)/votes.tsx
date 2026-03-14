import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Header } from "@/components/Header/header";
import { LocationBadge } from "@/components/Badges/LocationBadge";
import { TabSelector } from "@/components/Button/TabSelector";
import { CalendarBadge } from "@/components/Badges/CalendarBadge";
import { CalendarModal, QuickFilter } from "@/components/Calendar/CalendarModal";
import FilterBadge from "@/components/Badges/FilterBadge";
import { VoteSection } from "@/components/Vote/VoteSection";
import { ArrowDownUp } from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import { useGuestGuard } from "@/hooks/use-guest-guard";
import { GuestActionModal } from "@/components/GuestActionModal";
import { useVotes } from "@/hooks/use-votes";
import { useAuthStore } from "@/store/auth-store";
import { useLocationStore } from "@/store/location-store";
import { LocationSearchModal } from "@/components/Modals/LocationSearchModal";
import { locationService } from "@/services/location/location.service";
import { FaqSection } from "@/components/FaqSection";
import { haversineKm } from "@/utils/distance";
import { getMediaUrl } from "@/services/api/client";

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function VoteScreen() {
  const [activeTab, setActiveTab] = useState<"first" | "second">("first");
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter | null>(null);
  const [quickFilterLabel, setQuickFilterLabel] = useState<string | undefined>(undefined);
  const [dateFilterRange, setDateFilterRange] = useState<{ start: Date; end: Date } | null>(null);
  const { showModal, setShowModal, guard } = useGuestGuard();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { city: displayCity, isManualCity, manualCoords, setCity, setManualCity, clearCity } = useLocationStore();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const filter = activeTab === "first" ? "active" : "done";
  const { groupedByEvent, isLoading, error, fetchMyVotes } = useVotes(filter);
  const [locallyExpiredIds, setLocallyExpiredIds] = useState<Set<number>>(new Set());
  const [sortAsc, setSortAsc] = useState(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (isManualCity && manualCoords) {
      setUserCoords(manualCoords);
      return;
    }
    locationService.getCachedLocation().then((coords) => {
      if (coords) setUserCoords(coords);
    });
  }, [isManualCity, manualCoords]);

  const getDistance = (lat?: number | null, lon?: number | null): string | undefined => {
    if (!userCoords || lat == null || lon == null) return undefined;
    const km = haversineKm(userCoords.latitude, userCoords.longitude, lat, lon);
    return Math.round(km) > 0 ? `${Math.round(km)} km` : undefined;
  };

  const handleClearLocation = async () => {
    const coords = await locationService.getCachedLocation() ?? await locationService.getCurrentPosition();
    if (coords) {
      const gpsCity = await locationService.getCityFromCoords(coords.latitude, coords.longitude);
      setCity(gpsCity ?? "");
      setUserCoords(coords);
    } else {
      clearCity();
      setUserCoords(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchMyVotes();
  }, [isAuthenticated, filter]);

  // Filtrer par onglet
  // "Vote en cours" : event PUBLISHED avec timer actif
  // "Vote terminé"  : event DONE, timer expiré (voting_end_date passée), ou expiré localement
  const filteredEvents = groupedByEvent.filter((group) => {
    const { status, voting_end_date, voting_time_remaining } = group.event;
    const secondsLeft = voting_time_remaining != null && voting_time_remaining > 0
      ? voting_time_remaining
      : voting_end_date
      ? Math.max(0, Math.floor((new Date(voting_end_date).getTime() - Date.now()) / 1000))
      : 0;
    const isEnded = status === "DONE" || secondsLeft <= 0 || locallyExpiredIds.has(group.event.id);
    if (activeTab === "first" ? isEnded : !isEnded) return false;

    // Date filter
    const eventDate = new Date(group.event.event_date);
    if (selectedDate) {
      const d = selectedDate;
      if (
        eventDate.getFullYear() !== d.getFullYear() ||
        eventDate.getMonth() !== d.getMonth() ||
        eventDate.getDate() !== d.getDate()
      ) return false;
    } else if (dateFilterRange) {
      if (eventDate < dateFilterRange.start || eventDate > dateFilterRange.end) return false;
    }

    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.event.event_date).getTime();
    const dateB = new Date(b.event.event_date).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Header title="Vos votes" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter badges row */}
        <View style={styles.badgesContainer}>
          <LocationBadge
            location={displayCity}
            onPress={() => guard(() => setShowLocationModal(true))}
            onClear={isManualCity ? handleClearLocation : undefined}
          />
          <CalendarBadge
            onPress={() => guard(() => setCalendarVisible(true))}
            selectedDate={selectedDate}
            filterLabel={quickFilterLabel}
            onClear={() => {
              setSelectedDate(undefined);
              setActiveQuickFilter(null);
              setQuickFilterLabel(undefined);
              setDateFilterRange(null);
            }}
          />
          <FilterBadge onPress={() => guard(() => console.log("Open filters"))} />
          <Pressable
            style={styles.sortButton}
            onPress={() => guard(() => setSortAsc((prev) => !prev))}
          >
            <ArrowDownUp size={20} color="#FFFFFF" />
            <Text style={styles.sortText}>Trier</Text>
          </Pressable>
        </View>

        <CalendarModal
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          selectedDate={selectedDate}
          activeQuickFilter={activeQuickFilter}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setActiveQuickFilter(null);
            setQuickFilterLabel(undefined);
            setDateFilterRange(null);
          }}
          onSelectQuickFilter={(type, label, start, end) => {
            setActiveQuickFilter(type);
            setQuickFilterLabel(label);
            setSelectedDate(undefined);
            setDateFilterRange({ start, end });
          }}
        />

        {/* Tab Selector */}
        <View>
          <TabSelector
            activeTab={activeTab}
            onTabChange={setActiveTab}
            firstLabel="Vote en cours"
            secondLabel="Vote terminé"
          />
        </View>

        {/* Guest state */}
        {!isAuthenticated && (
          <View style={styles.centerContainer}>
            <Text style={styles.guestTitle}>Suivez vos votes</Text>
            <Text style={styles.emptyText}>
              Créez un compte pour voter pour vos artistes préférés et retrouver tous vos votes ici.
            </Text>
            <Pressable
              style={styles.ctaButton}
              onPress={() => router.push("/OnBoarding/onboarding")}
            >
              <Text style={styles.ctaText}>Créer un compte</Text>
            </Pressable>
          </View>
        )}

        {/* Loading */}
        {isAuthenticated && isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FC5F67" />
          </View>
        )}

        {/* Error */}
        {isAuthenticated && error && !isLoading && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>{error}</Text>
            <Pressable onPress={fetchMyVotes} style={styles.retryButton}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </View>
        )}

        {/* Empty state */}
        {isAuthenticated && !isLoading && !error && filteredEvents.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>
              {activeTab === "first"
                ? "Vous n'avez aucun vote en cours\npour le moment"
                : "Vous n'avez aucun vote terminé\npour le moment"}
            </Text>
            <Text style={styles.emptySubtitle}>
              Découvrez les événements et votez\npour vos artistes préférés !
            </Text>
            <Pressable
              style={styles.ctaButton}
              onPress={() => router.push("/(tabs)/events")}
            >
              <Text style={styles.ctaText}>Voir les événements</Text>
            </Pressable>
          </View>
        )}

        {/* Vote Sections */}
        {isAuthenticated && !isLoading && !error && filteredEvents.length > 0 && (
          <View style={styles.votesContainer}>
            {filteredEvents.map((group) => (
              <VoteSection
                key={group.event.id}
                eventName={group.event.title}
                eventDate={formatEventDate(group.event.event_date)}
                location={group.event.location}
                distance={getDistance(group.event.latitude, group.event.longitude)}
                secondsRemaining={
                  group.event.voting_time_remaining != null && group.event.voting_time_remaining > 0
                    ? group.event.voting_time_remaining
                    : group.event.voting_end_date
                    ? Math.max(0, Math.floor((new Date(group.event.voting_end_date).getTime() - Date.now()) / 1000))
                    : 0
                }
                artists={(() => {
                    const ranked = [...group.artists]
                      .sort((a, b) => (b.votes_count ?? 0) - (a.votes_count ?? 0))
                      .map((artist, index) => {
                        const profileMedia = artist.media?.find((m) => m.role === "PROFILE" && m.is_primary)
                          || artist.media?.find((m) => m.role === "PROFILE");
                        const imageUrl = profileMedia ? getMediaUrl(profileMedia) || "" : artist.media_url || "";
                        return {
                          id: String(artist.id),
                          name: artist.name,
                          rank: index + 1,
                          votes: artist.votes_count,
                          imageUrl,
                          styles: artist.styles?.map((s) => s.name) || [],
                          isVoted: artist.isVoted,
                        };
                      });
                    const votedIndex = ranked.findIndex((a) => a.isVoted);
                    if (votedIndex > 0) {
                      const [voted] = ranked.splice(votedIndex, 1);
                      ranked.unshift(voted);
                    }
                    return ranked;
                  })()}
                onInfoPress={() => router.push(`/event/${group.event.id}`)}
                onArtistPress={() => router.push(`/vote/${group.event.id}`)}
                onExpire={() =>
                  setLocallyExpiredIds((prev) => new Set([...prev, group.event.id]))
                }
              />
            ))}
          </View>
        )}

        <FaqSection />
      </ScrollView>

      <LocationSearchModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={(city, coords) => { setManualCity(city, coords); setUserCoords(coords); setShowLocationModal(false); }}
      />
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
    flexGrow: 1,
    paddingVertical: 10,
    gap: 16,
    paddingBottom: 130,
  },
  badgesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 8,
  },
  sortButton: {
   flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 8,
    backgroundColor: "#212121",
    borderRadius: 25,
  },
  sortText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
  votesContainer: {
    marginTop: 32,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
    marginTop: 32,
  },
  emptyText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#7B7B7B",
    textAlign: "center",
    letterSpacing: -0.28,
  },
  emptyTitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.32,
  },
  emptySubtitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#7B7B7B",
    textAlign: "center",
    letterSpacing: -0.26,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: "#FC5F67",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.28,
  },
  guestTitle: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.36,
  },
  ctaButton: {
    backgroundColor: "#FC5F67",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.28,
  },
  faqSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 8,
    alignItems: "center",
  },
  faqText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#7B7B7B",
    textAlign: "center",
    letterSpacing: -0.24,
  },
  faqLink: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.24,
    textDecorationLine: "underline",
  },
});
