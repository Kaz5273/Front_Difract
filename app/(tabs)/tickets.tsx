import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Header } from "@/components/Header/header";
import { TicketCard } from "@/components/Ticket/TicketCard";
import { FaqSection } from "@/components/FaqSection";
import { ticketsService } from "@/services/tickets/tickets.service";
import { eventService } from "@/services/events/events.service";
import { Fonts } from "@/constants/theme";
import type { Ticket } from "@/services/api/types";

type Tab = "achete" | "passe";

export default function TicketsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("achete");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ticketsService.getMyTickets()
      .then(async (rawTickets) => {
        // Enrichir chaque ticket avec les styles de l'event (non retournés par /me/tickets)
        const eventIds = [...new Set(rawTickets.map((t) => t.event_id).filter(Boolean))];
        const eventDetails = await Promise.all(
          eventIds.map((id) => eventService.getById(id).catch(() => null))
        );
        const stylesMap = new Map(
          eventDetails.filter(Boolean).map((e) => [e!.id, e!.styles ?? []])
        );
        const enriched = rawTickets.map((t) =>
          t.event ? { ...t, event: { ...t.event, styles: stylesMap.get(t.event_id) ?? t.event.styles } } : t
        );
        setTickets(enriched);
      })
      .catch(() => setTickets([]))
      .finally(() => setIsLoading(false));
  }, []);

  const now = new Date();

  const isEventPast = (t: (typeof tickets)[0]) => {
    if (!t.event) return false;
    if (t.event.status === "DONE") return true;
    const end = t.event.end_time ? new Date(t.event.end_time) : new Date(t.event.event_date);
    return end < now;
  };

  // "Acheté" = billets valides ou en attente pour des événements à venir
  const achetedTickets = tickets.filter(
    (t) =>
      (t.status === "confirmed" || t.status === "pending") &&
      t.event &&
      !isEventPast(t)
  );
  // "Passé" = événement terminé, ou billet remboursé/annulé
  const passeTickets = tickets.filter(
    (t) =>
      t.status === "refunded" ||
      t.status === "cancelled" ||
      isEventPast(t)
  );

  const displayed = activeTab === "achete" ? achetedTickets : passeTickets;
  const isEmpty = !isLoading && displayed.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Header title="Mes billets" showBackButton showMenuButton />

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsRow}>
          <Pressable
            style={styles.tabItem}
            onPress={() => setActiveTab("achete")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "achete" ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Acheté
            </Text>
          </Pressable>
          <Pressable
            style={styles.tabItem}
            onPress={() => setActiveTab("passe")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "passe" ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Passé
            </Text>
          </Pressable>
        </View>
        {/* Indicator */}
        <View style={styles.indicatorRow}>
          <View style={styles.indicatorBg} />
          <View
            style={[
              styles.indicator,
              activeTab === "passe" && styles.indicatorRight,
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#FC5F67" />
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Pas de billet pour le moment</Text>
            <Text style={styles.emptySubtitle}>
              Retrouve toutes les places que tu as acheté ici !
            </Text>
            <Pressable
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)/events")}
            >
              <Text style={styles.exploreButtonText}>Explorer</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.ticketsList}>
            {displayed.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
              />
            ))}
          </View>
        )}

        <FaqSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111111",
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  tabsRow: {
    flexDirection: "row",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
  },
  tabText: {
    fontSize: 14,
    letterSpacing: -0.28,
  },
  tabTextActive: {
    fontFamily: Fonts.bold,
    color: "#FFFFFF",
  },
  tabTextInactive: {
    fontFamily: Fonts.semiBold,
    color: "rgba(255,255,255,0.5)",
  },
  indicatorRow: {
    height: 2,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 2,
    width: "50%",
    backgroundColor: "#FFFFFF",
    borderRadius: 46,
  },
  indicatorRight: {
    left: "50%",
  },
  indicatorBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 46,
    zIndex: -1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: "space-between",
    paddingBottom: 130,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.32,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#959595",
    letterSpacing: -0.28,
    textAlign: "center",
    lineHeight: 18,
    marginTop: -20,
  },
  exploreButton: {
    backgroundColor: "#FFFFFF",
    height: 44,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  exploreButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.28,
  },
  ticketsList: {
    gap: 24,
  },
  faqSection: {
    paddingVertical: 15,
    alignItems: "flex-start",
    gap: 8,
    marginTop: 24,
  },
  faqGray: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#959595",
    letterSpacing: -0.24,
    lineHeight: 14,
    textAlign: "center",
    width: "100%",
  },
  faqWhite: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    lineHeight: 14,
    textAlign: "center",
    width: "100%",
  },
});
