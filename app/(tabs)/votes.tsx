import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Header } from "@/components/Header/header";
import { LocationBadge } from "@/components/Badges/LocationBadge";
import { TabSelector } from "@/components/Button/TabSelector";
import { CalendarBadge } from "@/components/Badges/CalendarBadge";
import { CalendarModal } from "@/components/Calendar/CalendarModal";
import FilterBadge from "@/components/Badges/FilterBadge";
import { VoteSection } from "@/components/Vote/VoteSection";
import { ArrowDownUp } from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import { useGuestGuard } from "@/hooks/use-guest-guard";
import { GuestActionModal } from "@/components/GuestActionModal";
import { useVotes } from "@/hooks/use-votes";
import { useAuthStore } from "@/store/auth-store";

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
  const { showModal, setShowModal, guard } = useGuestGuard();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { groupedByEvent, isLoading, error, fetchMyVotes } = useVotes();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyVotes();
    }
  }, [isAuthenticated]);

  // Filtrer par onglet : "en cours" = événements PUBLISHED, "terminé" = DONE
  const filteredEvents = groupedByEvent.filter((group) => {
    if (activeTab === "first") {
      return group.event.status !== "DONE";
    }
    return group.event.status === "DONE";
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Vos votes" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter badges row */}
        <View style={styles.badgesContainer}>
          <LocationBadge
            location="Annecy"
            onPress={() => guard(() => console.log("Change location"))}
          />
          <CalendarBadge onPress={() => guard(() => setCalendarVisible(true))} />
          <FilterBadge onPress={() => guard(() => console.log("Open filters"))} />
          <Pressable
            style={styles.sortButton}
            onPress={() => guard(() => console.log("Sort"))}
          >
            <ArrowDownUp size={20} color="#FFFFFF" />
            <Text style={styles.sortText}>Trier</Text>
          </Pressable>
        </View>

        <CalendarModal
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setCalendarVisible(false);
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
            <Text style={styles.emptyText}>
              {activeTab === "first"
                ? "Vous n'avez pas encore voté pour un événement en cours."
                : "Aucun vote terminé."}
            </Text>
          </View>
        )}

        {/* Vote Sections */}
        {isAuthenticated &&
          !isLoading &&
          !error &&
          filteredEvents.map((group) => (
            <VoteSection
              key={group.event.id}
              eventName={group.event.title}
              eventDate={formatEventDate(group.event.event_date)}
              location={group.event.location}
              endDate={new Date(group.event.event_date)}
              artists={group.artists.map((artist, index) => ({
                id: String(artist.id),
                name: artist.name,
                rank: index + 1,
                votes: 0,
                imageUrl: artist.media_url || "",
                styles: [],
                isVoted: true,
              }))}
              onArtistPress={() => router.push(`/vote/${group.event.id}`)}
            />
          ))}

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
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#7B7B7B",
    textAlign: "center",
    letterSpacing: -0.28,
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
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#7B7B7B",
    textAlign: "center",
    letterSpacing: -0.24,
  },
  faqLink: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.24,
    textDecorationLine: "underline",
  },
});
