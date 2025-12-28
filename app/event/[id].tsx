import React, { useState } from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import { ChevronLeft, MapPin, Users, Home } from "lucide-react-native";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { EventHeaderImage } from "@/components/Event/EventHeaderImage";
import { EventAbout } from "@/components/Event/EventAbout";
import { Fonts } from "@/constants/theme";

// Données d'exemple - à remplacer par les vraies données
const exampleEvents = [
  {
    id: 1,
    title: "Espace rencontre",
    location: "Annecy-le-vieux 74000",
    address: "33 Rue des Alpes - Annecy-le-Vieux",
    distance: "150km",
    eventDate: "2025-06-06T18:00:00.000Z",
    timeRange: "18h00 à 00h00",
    duration: "6h00",
    capacity: "400 places",
    price: 22.5,
    imageUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    styles: ["Jazz", "Expérimentale"],
    friendsGoing: 3,
    friendsAvatars: [
      "https://i.pravatar.cc/150?img=1",
      "https://i.pravatar.cc/150?img=2",
      "https://i.pravatar.cc/150?img=3",
    ],
    description:
      "Joe Biden, 46 ans, est un véritable alchimiste du son. Entre ses doigts, un saxophone ténor prend vie ; ses improvisations, nourries de deux décennies d'amour inconditionnel pour le jazz, convoquent aussi bien les bruissements feutrés des clubs new-yorkais que l'énergie éclatante de la scène parisienne.",
  },
];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);

  // Récupérer l'événement (utiliser l'id pour filtrer dans une vraie app)
  const event = exampleEvents[0];

  return (
    <View style={{ flex: 1 }}>
      {/* Bouton Retour */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <BlurView intensity={15} style={styles.backButtonBlur}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </BlurView>
      </Pressable>

      <ParallaxScrollView
        headerBackgroundColor={{ light: "#080808", dark: "#080808" }}
        showsVerticalScrollIndicator={false}
        headerImage={
          <EventHeaderImage
            imageUrl={event.imageUrl}
            eventDate={event.eventDate}
            styles={event.styles}
            isFavorite={isFavorite}
            onFavoritePress={() => setIsFavorite(!isFavorite)}
            onSharePress={() => console.log("Partager l'événement")}
          />
        }
      >
        <ThemedView style={styles.contentContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
          </ThemedView>

          {/* Bouton Billeterie */}
          <Pressable
            onPress={() => console.log("Accéder à la billeterie")}
            style={styles.ticketButton}
          >
            <Text style={styles.ticketButtonText}>Accéder à la billeterie</Text>
          </Pressable>

          {/* Informations de l'événement */}
          <View style={styles.eventInfoContainer}>
            {/* Adresse */}
            <View style={styles.infoRow}>
              <Home size={18} color="#D7D7D7" strokeWidth={2} />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>

            {/* Localisation avec distance */}
            <View style={styles.infoRow}>
              <MapPin size={18} color="#D7D7D7" strokeWidth={2} />
              <Text style={styles.infoText}>{event.address}</Text>
            </View>

            {/* Capacité */}
            <View style={styles.infoRow}>
              <Users size={18} color="#D7D7D7" strokeWidth={2} />
              <Text style={styles.infoText}>{event.capacity}</Text>
            </View>
          </View>

          {/* À propos de l'événement */}
          <EventAbout description={event.description} />
        </ThemedView>
      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: 16,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 25,
    lineHeight: 32,
  },
  ticketButton: {
    backgroundColor: "#FC5F67",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  ticketButtonText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    letterSpacing: -0.56,
  },
  eventInfoContainer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#D7D7D7",
    letterSpacing: -0.48,
  },
});
