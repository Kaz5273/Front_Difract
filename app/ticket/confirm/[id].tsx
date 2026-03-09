import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Fonts } from "@/constants/theme";
import { ticketsService } from "@/services/tickets/tickets.service";

const bgImage = require("@/assets/images/billetConfirm.jpg");

export default function TicketConfirmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);

  const [confirmed, setConfirmed] = useState(false);
  const [polling, setPolling] = useState(true);
  const [checking, setChecking] = useState(false);
  const attemptsRef = useRef(0);
  const MAX_ATTEMPTS = 20;

  useEffect(() => {
    if (!eventId) { setPolling(false); return; }

    const interval = setInterval(async () => {
      attemptsRef.current += 1;
      try {
        const tickets = await ticketsService.getMyTickets();
        const ticket = tickets.find(
          (t) => t.event_id === eventId && t.status === "confirmed"
        );
        if (ticket) {
          setConfirmed(true);
          setPolling(false);
          clearInterval(interval);
          return;
        }
      } catch {}
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setPolling(false);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [eventId]);

  const checkNow = async () => {
    if (!eventId) return;
    setChecking(true);
    try {
      const tickets = await ticketsService.getMyTickets();
      const ticket = tickets.find(
        (t) => t.event_id === eventId && t.status === "confirmed"
      );
      if (ticket) setConfirmed(true);
    } catch {}
    setChecking(false);
  };

  return (
    <ImageBackground source={bgImage} style={styles.bg} resizeMode="cover">
      {/* Dark overlay */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={["bottom", "top"]}>
        <View style={styles.container}>
          {polling ? (
            /* Attente de confirmation webhook */
            <View style={styles.pollingContent}>
              <ActivityIndicator size="large" color="#FC5F67" />
              <Text style={styles.pollingText}>
                Confirmation de votre paiement en cours…
              </Text>
            </View>
          ) : (
            <>
              {/* Top content */}
              <View style={styles.topContent}>
                <Text style={styles.title}>
                  {confirmed
                    ? "Félicitation pour votre achat !"
                    : "Paiement en cours de traitement"}
                </Text>
                <Text style={styles.subtitle}>
                  {confirmed
                    ? "Continuez à suivre l'avancement des votes pour savoir quelles artistes seront choisis !"
                    : "Votre billet apparaîtra dans \"Mes billets\" dès que le paiement sera confirmé."}
                </Text>
              </View>

              {/* Bottom content */}
              <View style={styles.bottomContent}>
                {confirmed && (
                  <Text style={styles.redirectHint}>
                    {`Retrouve ton billet dans la navigation :\nMes billets → Acheté`}
                  </Text>
                )}

                <View style={styles.buttonsContainer}>
                  {!confirmed && (
                    <Pressable
                      style={styles.primaryButton}
                      onPress={checkNow}
                      disabled={checking}
                    >
                      {checking ? (
                        <ActivityIndicator size="small" color="#000000" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Vérifier à nouveau</Text>
                      )}
                    </Pressable>
                  )}

                  <Pressable
                    style={confirmed ? styles.primaryButton : styles.secondaryButton}
                    onPress={() => router.replace("/(tabs)/tickets")}
                  >
                    <Text style={confirmed ? styles.primaryButtonText : styles.secondaryButtonText}>
                      Voir mes billets
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => router.replace("/(tabs)")}
                  >
                    <Text style={styles.secondaryButtonText}>
                      Retourner sur l'application
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#080808",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.54)",
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 60,
    justifyContent: "space-between",
    alignItems: "center",
  },
  pollingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  pollingText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#959595",
    letterSpacing: -0.28,
    textAlign: "center",
  },
  topContent: {
    alignItems: "center",
    gap: 40,
    width: "100%",
  },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: -0.6,
    lineHeight: 25,
    textAlign: "center",
    width: "100%",
  },
  subtitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#959595",
    letterSpacing: -0.28,
    lineHeight: 18,
    textAlign: "center",
    width: 255,
  },
  bottomContent: {
    alignItems: "center",
    gap: 60,
    width: "100%",
  },
  redirectHint: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#959595",
    letterSpacing: -0.28,
    lineHeight: 18,
    textAlign: "center",
    width: 275,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    height: 44,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  primaryButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.28,
  },
  secondaryButton: {
    height: 44,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  secondaryButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
});
