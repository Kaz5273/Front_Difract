import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header } from "@/components/Header/header";
import { EventCard } from "@/components/Event/EventCard";
import { Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";

export default function FavoriteEventsScreen() {
  const router = useRouter();

  // Données d'exemple pour les événements avec fin de votes proche
  const endingSoonEvents = [
    {
      id: 1,
      title: "Espace rencontre",
      location: "Annecy-le-vieux",
      distance: "150km",
      eventDate: "2025-06-06T18:00:00.000Z",
      timeRange: "18h00 à 00h00",
      price: 22.5,
      imageUrl:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop",
      styles: ["Jazz", "Expérimentale"],
      friendsGoing: 3,
      friendsAvatars: [
        "https://i.pravatar.cc/150?img=1",
        "https://i.pravatar.cc/150?img=2",
        "https://i.pravatar.cc/150?img=3",
      ],
    },
  ];

  // Données d'exemple pour les événements avec votes en cours
  const votingEvents = [
    {
      id: 2,
      title: "Salle des Caristes",
      location: "Annecy-le-vieux",
      distance: "150km",
      eventDate: "2025-06-06T18:00:00.000Z",
      timeRange: "18h00 à 00h00",
      price: 22.5,
      imageUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
      styles: ["Rock", "Indie"],
      friendsGoing: 3,
      friendsAvatars: [
        "https://i.pravatar.cc/150?img=4",
        "https://i.pravatar.cc/150?img=5",
        "https://i.pravatar.cc/150?img=6",
      ],
    },
  ];

  const handleSearchPress = () => {
    console.log("Search pressed");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="Events intéressé.e.s"
        variant="detail"
        showSearchButton
        onSearchPress={handleSearchPress}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Fins des votes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h1">Fins des votes</ThemedText>
          </View>

          <View style={styles.eventsList}>
            {endingSoonEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                location={event.location}
                distance={event.distance}
                eventDate={event.eventDate}
                timeRange={event.timeRange}
                price={event.price}
                imageUrl={event.imageUrl}
                styles={event.styles}
                friendsGoing={event.friendsGoing}
                friendsAvatars={event.friendsAvatars}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
          </View>
        </View>

        {/* Section Les votes en cours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h1">Les votes en cours</ThemedText>
          </View>

          <View style={styles.eventsList}>
            {votingEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                location={event.location}
                distance={event.distance}
                eventDate={event.eventDate}
                timeRange={event.timeRange}
                price={event.price}
                imageUrl={event.imageUrl}
                styles={event.styles}
                friendsGoing={event.friendsGoing}
                friendsAvatars={event.friendsAvatars}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
          </View>
        </View>

        {/* Footer FAQ */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Vous ne trouvez pas votre bonheur ? Des questions ?
          </Text>
          <Pressable onPress={() => console.log("FAQ pressed")}>
            <Text style={styles.footerLink}>Rendez-vous dans notre FAQ.</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 200,
  },
  section: {
    gap: 15,
    marginBottom: 35,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventsList: {
    gap: 15,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#606060",
    letterSpacing: -0.24,
    textAlign: "center",
  },
  footerLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    textDecorationLine: "underline",
    marginTop: 4,
  },
});
