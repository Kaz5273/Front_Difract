import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Fonts } from "@/constants/theme";
import { EventCard } from "@/components/Event/EventCard";
import type { Ticket } from "@/services/api/types";

const TIER_LABELS: Record<string, string> = {
  early_access: "Early Access",
  standard: "Standard",
  last_minute: "Last Minute",
};

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const event = ticket.event;
  if (!event) return null;

  const formatPrice = (price: string) =>
    parseFloat(price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const statusLabel =
    ticket.status === "confirmed" ? "Valide"
    : ticket.status === "pending" ? "En attente"
    : ticket.status === "refunded" ? "Remboursé"
    : "Annulé";

  const dotStyle =
    ticket.status === "confirmed" ? styles.dotActive
    : ticket.status === "pending" ? styles.dotPending
    : styles.dotUsed;

  return (
    <View style={styles.container}>
      <EventCard
        id={event.id}
        title={event.title}
        location={event.location}
        eventDate={event.event_date}
        timeRange={formatTime(event.event_date)}
        imageUrl={event.image_url ?? ""}
        styles={[TIER_LABELS[ticket.tier] ?? ticket.tier]}
        isVotingOpen={true}
        onPress={() => router.push(`/ticket/${ticket.id}`)}
      />

      {/* Ticket-specific row: status + price */}
      <View style={styles.ticketRow}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, dotStyle]} />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{formatPrice(ticket.price)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 0,
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    marginTop: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#4CAF50",
  },
  dotPending: {
    backgroundColor: "#FFA500",
  },
  dotUsed: {
    backgroundColor: "#959595",
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#959595",
    letterSpacing: -0.24,
  },
  priceBadge: {
    backgroundColor: "#FC5F67",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
});
