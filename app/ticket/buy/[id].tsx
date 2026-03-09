import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Fonts } from "@/constants/theme";
import { Header } from "@/components/Header/header";
import { EventCard } from "@/components/Event/EventCard";
import { eventService, TicketPrice } from "@/services/events/events.service";
import { ticketsService } from "@/services/tickets/tickets.service";
import type { Event } from "@/services/api/types";

export default function BuyTicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketPrice, setTicketPrice] = useState<TicketPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const INSURANCE_FEE = 2.99;

  useEffect(() => {
    if (!eventId) return;
    Promise.all([
      eventService.getById(eventId),
      eventService.getTicketPrice(eventId),
    ])
      .then(([evt, price]) => {
        setEvent(evt);
        setTicketPrice(price);
      })
      .catch(() => setError("Impossible de charger les informations."))
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const price = ticketPrice?.price ?? 0;
  const insuranceFee = hasInsurance ? INSURANCE_FEE : 0;
  const total = Math.round((price + insuranceFee) * 100) / 100;

  const formatPrice = (val: number) =>
    val.toLocaleString("fr-FR", { minimumFractionDigits: 2 });

  const handlePurchase = async () => {
    if (isPurchasing || !ticketPrice?.sale_available) return;
    setIsPurchasing(true);
    setError(null);
    try {
      const { checkout_url } = await eventService.checkoutTicket(eventId, hasInsurance);

      // Polling en arrière-plan pendant que le browser est ouvert.
      // Dès que le webhook confirme le ticket → on ferme le browser automatiquement.
      let pollingInterval: ReturnType<typeof setInterval> | null = null;
      let paymentConfirmed = false;

      pollingInterval = setInterval(async () => {
        try {
          const tickets = await ticketsService.getMyTickets();
          const ticket = tickets.find(
            (t) => t.event_id === eventId && t.status === "confirmed"
          );
          if (ticket) {
            paymentConfirmed = true;
            if (pollingInterval) clearInterval(pollingInterval);
            WebBrowser.dismissBrowser();
          }
        } catch {}
      }, 3000);

      await WebBrowser.openBrowserAsync(checkout_url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        dismissButtonStyle: "close",
        toolbarColor: "#080808",
        controlsColor: "#FFFFFF",
      });

      if (pollingInterval) clearInterval(pollingInterval);

      // Browser fermé (par le webhook ou manuellement) — vérification finale
      if (paymentConfirmed) {
        router.replace(`/ticket/confirm/${eventId}`);
        return;
      }

      // Fermeture manuelle sans confirmation → on poll encore 10 × 3s = 30s
      // (le webhook peut arriver quelques secondes après la fermeture du browser)
      setIsVerifying(true);
      try {
        let found = false;
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          const tickets = await ticketsService.getMyTickets();
          const ticket = tickets.find(
            (t) => t.event_id === eventId && t.status === "confirmed"
          );
          if (ticket) {
            found = true;
            break;
          }
        }
        if (found) {
          router.replace(`/ticket/confirm/${eventId}`);
        } else {
          setError("Paiement non finalisé. Réessayez si vous souhaitez acheter un billet.");
        }
      } catch {
        setError("Paiement non finalisé. Réessayez si vous souhaitez acheter un billet.");
      } finally {
        setIsVerifying(false);
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        "Une erreur est survenue lors de l'achat.";
      setError(msg);
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatTimeRange = (event: Event) => {
    if (event.end_time) {
      const start = new Date(event.event_date);
      const end = new Date(event.end_time);
      const fmt = (d: Date) =>
        d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      return `${fmt(start)} à ${fmt(end)}`;
    }
    return "";
  };

  const formatDistance = (km?: number) =>
    km ? `${Math.round(km)} km` : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Header title="Acheter des billets" variant="detail" showBackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FC5F67" />
          </View>
        ) : error && !event ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Intro text */}
            <Text style={styles.introText}>
              {`Vous allez acheter un billet pour\nl'événement suivant :`}
            </Text>

            {/* Event card */}
            {event && (
              <View style={styles.cardWrapper}>
                <EventCard
                  id={event.id}
                  title={event.title}
                  location={event.location}
                  distance={formatDistance(event.distance_km)}
                  eventDate={event.event_date}
                  timeRange={formatTimeRange(event)}
                  imageUrl={event.image_url ?? ""}
                  styles={event.styles?.map((s) => s.name) ?? []}
                  isVotingOpen={event.is_voting_open ?? false}
                  votingEndDate={event.voting_end_date}
                  friendsAvatars={[]}
                  onPress={() => {}}
                />
              </View>
            )}

            {/* Assurance remboursement */}
            <View style={styles.insuranceSection}>
              <View style={styles.insuranceRow}>
                <View style={styles.insuranceTextGroup}>
                  <Text style={styles.insuranceTitle}>Assurance remboursement</Text>
                  <Text style={styles.insuranceSubtitle}>
                    {`Remboursement garanti si vous ne pouvez pas venir (+${INSURANCE_FEE.toFixed(2).replace(".", ",")}€)`}
                  </Text>
                </View>
                <Switch
                  value={hasInsurance}
                  onValueChange={setHasInsurance}
                  trackColor={{ false: "#2A2A2A", true: "#FC5F67" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Price breakdown */}
            <View style={styles.priceSection}>
              {/* 1x line */}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabelBold}>1x</Text>
                <Text style={styles.priceValue}>
                  {`place pour "${event?.title ?? ""}"`}
                </Text>
              </View>

              {/* Assurance line (conditionnelle) */}
              {hasInsurance && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabelSm}>Assurance remboursement</Text>
                    <Text style={styles.priceValueSm}>{formatPrice(INSURANCE_FEE)}€</Text>
                  </View>
                </>
              )}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Total */}
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(total)}€</Text>
              </View>
            </View>

            {/* Error */}
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Buy button */}
            <View style={styles.buttonsContainer}>
              {ticketPrice?.sale_available === false ? (
                <View style={styles.unavailableButton}>
                  <Text style={styles.unavailableButtonText}>
                    {ticketPrice.reason === "voting_open" && ticketPrice.sale_opens_at
                      ? `Vente dès le ${new Date(ticketPrice.sale_opens_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`
                      : "Vente fermée pour le moment"}
                  </Text>
                </View>
              ) : (
                <Pressable
                  style={[styles.buyButton, (isPurchasing || isVerifying) && styles.buyButtonDisabled]}
                  onPress={handlePurchase}
                  disabled={isPurchasing || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <ActivityIndicator size="small" color="#000000" />
                      <Text style={styles.buyButtonText}>Vérification…</Text>
                    </>
                  ) : isPurchasing ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Text style={styles.buyButtonText}>
                      {`Acheter mon billet à ${formatPrice(price)}€`}
                    </Text>
                  )}
                </Pressable>
              )}

              {/* Remaining places */}
              {ticketPrice?.tier_available != null && ticketPrice.tier_available > 0 && (
                <Text style={styles.remainingText}>
                  {`Plus que `}
                  <Text style={styles.remainingBold}>
                    {ticketPrice.tier_available} places
                  </Text>
                  {` à ce prix là`}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111111",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 35,
    gap: 32,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  introText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: "#959595",
    letterSpacing: -0.32,
    lineHeight: 22,
  },
  cardWrapper: {
    width: "100%",
  },
  priceSection: {
    gap: 0,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  priceLabelBold: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#959595",
    letterSpacing: -0.42,
    lineHeight: 18,
  },
  priceValue: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#959595",
    letterSpacing: -0.42,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 2,
  },
  priceLabelSm: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#959595",
    letterSpacing: -0.24,
    lineHeight: 15,
  },
  priceValueSm: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#959595",
    letterSpacing: -0.24,
    lineHeight: 14,
  },
  totalLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    lineHeight: 15,
  },
  totalValue: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    lineHeight: 14,
  },
  buttonsContainer: {
    alignItems: "center",
    gap: 12,
  },
  buyButton: {
    backgroundColor: "#FFFFFF",
    height: 44,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.28,
  },
  unavailableButton: {
    height: 44,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
    backgroundColor: "#2A2A2A",
  },
  unavailableButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#959595",
    letterSpacing: -0.28,
  },
  remainingText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#959595",
    letterSpacing: -0.24,
    lineHeight: 14,
    textAlign: "center",
  },
  remainingBold: {
    fontFamily: Fonts.semiBold,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#FC5F67",
    textAlign: "center",
    letterSpacing: -0.26,
  },
  insuranceSection: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
  },
  insuranceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  insuranceTextGroup: {
    flex: 1,
    gap: 4,
  },
  insuranceTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  insuranceSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#959595",
    letterSpacing: -0.24,
    lineHeight: 16,
  },
});
