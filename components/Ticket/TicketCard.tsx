import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { EventCard } from "@/components/Event/EventCard";
import type { Ticket } from "@/services/api/types";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const event = ticket.event;
  if (!event) return null;

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <View style={styles.container}>
      <EventCard
        id={event.id}
        title={event.title}
        location={event.location}
        eventDate={event.event_date}
        timeRange={formatTime(event.event_date)}
        imageUrl={event.image_url ?? ""}
        styles={event.styles?.map((s) => s.name) ?? []}
        isVotingOpen={event.is_voting_open ?? false}
        votingEndDate={event.voting_end_date}
        purchasedTier={ticket.tier as "early_access" | "standard" | "last_minute"}
        purchasedPrice={parseFloat(ticket.price)}
        onPress={() => router.push(`/ticket/${ticket.id}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
