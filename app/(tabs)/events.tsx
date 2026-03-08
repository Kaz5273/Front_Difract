import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header/header";
import { EventCard } from "@/components/Event/EventCard";
import { LocationBadge } from "@/components/Badges/LocationBadge";
import { CalendarBadge } from "@/components/Badges/CalendarBadge";
import { CalendarModal, QuickFilter } from "@/components/Calendar/CalendarModal";
import { StyleFilterModal } from "@/components/Modals/StyleFilterModal";
import { TabSelector } from "@/components/Button/TabSelector";
import FilterBadge from "@/components/Badges/FilterBadge";
import { router } from "expo-router";
import { useGuestGuard } from "@/hooks/use-guest-guard";
import { GuestActionModal } from "@/components/GuestActionModal";
import { useEvents } from "@/hooks/use-events";
import { useStyles } from "@/hooks/useStyle";
import { locationService } from "@/services/location/location.service";
import { Event } from "@/services/api/types";
import { Fonts } from "@/constants/theme";

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

export default function EvenementsScreen() {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [styleFilterVisible, setStyleFilterVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter | null>(null);
  const [quickFilterLabel, setQuickFilterLabel] = useState<string | undefined>(undefined);
  const [selectedStyleIds, setSelectedStyleIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"first" | "second">("first");
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userCity, setUserCity] = useState<string>("Ma position");
  const { showModal, setShowModal, guard } = useGuestGuard();
  const { events, isLoading, error, fetchUpcoming } = useEvents();
  const { styles: musicStyles } = useStyles();

  useEffect(() => {
    const loadLocation = async () => {
      const cached = await locationService.getCachedLocation();
      const coords = cached ?? await locationService.getCurrentPosition();
      if (!coords) return;
      setUserCoords(coords);
      const city = await locationService.getCityFromCoords(coords.latitude, coords.longitude);
      if (city) setUserCity(city);
    };
    loadLocation();
  }, []);

  useEffect(() => {
    if (activeTab === "second") return;
    fetchUpcoming();
  }, [activeTab, userCoords]);

  // Filtrage côté client par style(s) (GET /api/events n'existe pas → filtrage local)
  const filteredEvents = useMemo(() => {
    if (selectedStyleIds.length === 0) return events;
    return events.filter((e) => e.styles?.some((s) => selectedStyleIds.includes(s.id)));
  }, [events, selectedStyleIds]);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Header title="Événements" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Badges */}
        <View style={styles.badgesContainer}>
          <LocationBadge
            location={userCity}
            onPress={() => guard(() => console.log("Change location"))}
          />
          <CalendarBadge
            onPress={() => guard(() => setCalendarVisible(true))}
            selectedDate={selectedDate}
            filterLabel={quickFilterLabel}
            onClear={() => {
              setSelectedDate(undefined);
              setActiveQuickFilter(null);
              setQuickFilterLabel(undefined);
            }}
          />
          <FilterBadge
            count={selectedStyleIds.length}
            onPress={() => setStyleFilterVisible(true)}
          />
        </View>

        <View>
          <TabSelector
            activeTab={activeTab}
            onTabChange={setActiveTab}
            firstLabel="Evenement à venir"
            secondLabel="Événements passés"
          />
        </View>

        {/* Modals */}
        <CalendarModal
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          selectedDate={selectedDate}
          activeQuickFilter={activeQuickFilter}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setActiveQuickFilter(null);
            setQuickFilterLabel(undefined);
          }}
          onSelectQuickFilter={(type, label) => {
            setActiveQuickFilter(type);
            setQuickFilterLabel(label);
            setSelectedDate(undefined);
          }}
        />
        <StyleFilterModal
          visible={styleFilterVisible}
          onClose={() => setStyleFilterVisible(false)}
          styles={musicStyles}
          selectedStyleIds={selectedStyleIds}
          onSelectStyles={setSelectedStyleIds}
        />

        {/* Onglet "Événements passés" */}
        {activeTab === "second" && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>Aucun événement passé{"\n"}pour le moment</Text>
            <Text style={styles.emptySubtitle}>Les événements passés{"\n"}apparaîtront ici.</Text>
          </View>
        )}

        {/* Loading */}
        {activeTab === "first" && isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FC5F67" />
          </View>
        )}

        {/* Error */}
        {activeTab === "first" && !isLoading && error && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>Une erreur est survenue</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <Pressable onPress={() => fetchUpcoming()} style={styles.retryButton}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </View>
        )}

        {/* Empty state */}
        {activeTab === "first" && !isLoading && !error && filteredEvents.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>
              {selectedStyleIds.length > 0
                ? "Aucun événement pour ces styles"
                : "Aucun événement à venir\npour le moment"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedStyleIds.length > 0
                ? "Essayez d'autres styles musicaux"
                : "Revenez bientôt, de nouveaux\névénements arrivent !"}
            </Text>
          </View>
        )}

        {/* Liste des événements */}
        {activeTab === "first" && !isLoading && !error && filteredEvents.length > 0 && (
          <View style={styles.eventsContainer}>
            {filteredEvents.map((event: Event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                location={event.location}
                distance={event.distance_km ? `${Math.round(event.distance_km)} km` : undefined}
                eventDate={event.event_date}
                timeRange={formatTimeRange(event.event_date, event.end_time)}
                price={event.price ? parseFloat(event.price) : 0}
                imageUrl={event.image_url || ""}
                styles={event.styles?.map((s) => s.name) || []}
                earlyAccess={false}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
          </View>
        )}

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqText}>
            Vous ne trouvez pas votre bonheur ? Des questions ?
          </Text>
          <Text style={styles.faqLink}>Rendez-vous dans notre FAQ.</Text>
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
    flexGrow: 1,
    paddingVertical: 10,
    paddingBottom: 130,
    gap: 16,
  },
  badgesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventsContainer: {
    gap: 16,
    paddingHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
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
