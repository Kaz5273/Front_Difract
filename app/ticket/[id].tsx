import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { Fonts } from "@/constants/theme";
import { ticketsService } from "@/services/tickets/tickets.service";
import type { Ticket } from "@/services/api/types";

const TIER_LABELS: Record<string, string> = {
  early_access: "Early Access",
  standard: "Standard",
  last_minute: "Last Minute",
};

export default function TicketDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    ticketsService
      .getMyTickets()
      .then((tickets) => {
        const found = tickets.find((t) => t.id === Number(id));
        if (found) setTicket(found);
        else setError("Billet introuvable.");
      })
      .catch(() => setError("Impossible de charger le billet."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString("fr-FR", { weekday: "long" });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString("fr-FR", { month: "long" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${dayNum} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year} à ${time}`;
  };

  const formatPrice = (price: string) =>
    parseFloat(price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      {/* Handle */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      {/* Close button */}
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeText}>Fermer</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FC5F67" />
        </View>
      ) : error || !ticket ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? "Billet introuvable."}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Event title */}
          <Text style={styles.eventTitle} numberOfLines={2}>
            {ticket.event?.title ?? "Événement"}
          </Text>
          {ticket.event?.event_date && (
            <Text style={styles.eventMeta}>{formatDate(ticket.event.event_date)}</Text>
          )}
          {ticket.event?.location && (
            <Text style={styles.eventMeta}>{ticket.event.location}</Text>
          )}

          {/* QR Code */}
          <View style={styles.qrContainer}>
            {ticket.status === "confirmed" ? (
              <>
                <QRCode
                  value={ticket.qr_code}
                  size={220}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
                <Text style={styles.qrHint}>Présente ce QR code à l'entrée</Text>
              </>
            ) : (
              <View style={styles.pendingBox}>
                <Text style={styles.pendingText}>
                  {ticket.status === "pending"
                    ? "Paiement en cours de confirmation…"
                    : "Billet non valide"}
                </Text>
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Palier</Text>
              <Text style={styles.detailValue}>{TIER_LABELS[ticket.tier] ?? ticket.tier}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Prix</Text>
              <Text style={styles.detailValue}>{formatPrice(ticket.price)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assurance</Text>
              <Text style={styles.detailValue}>{ticket.has_insurance ? "Oui" : "Non"}</Text>
            </View>
            {ticket.scanned_at && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Scanné le</Text>
                  <Text style={styles.detailValue}>{formatDate(ticket.scanned_at)}</Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111111",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3A3A3A",
  },
  closeButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  closeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#959595",
    letterSpacing: -0.28,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FC5F67",
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
    alignItems: "center",
  },
  eventTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 22,
    color: "#FFFFFF",
    letterSpacing: -0.66,
    textAlign: "center",
  },
  eventMeta: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#959595",
    letterSpacing: -0.26,
    textAlign: "center",
    marginTop: -16,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
  },
  qrHint: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#555555",
    letterSpacing: -0.24,
    textAlign: "center",
  },
  pendingBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  pendingText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#959595",
    textAlign: "center",
  },
  detailsSection: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    paddingHorizontal: 16,
    width: "100%",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  detailLabel: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#959595",
    letterSpacing: -0.28,
  },
  detailValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
  },
});
