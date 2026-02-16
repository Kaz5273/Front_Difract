import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header/header";
import { EventCard } from "@/components/Event/EventCard";
import { LocationBadge } from "@/components/Badges/LocationBadge";
import { CalendarBadge } from "@/components/Badges/CalendarBadge";
import { CalendarModal } from "@/components/Calendar/CalendarModal";
import { TabSelector } from "@/components/Button/TabSelector";
import FilterBadge from "@/components/Badges/FilterBadge";
import { router } from "expo-router";

export default function EvenementsScreen() {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"first" | "second">("first");

  // Données d'exemple pour les événements
  const events = [
    {
      id: 1,
      title: "Espace rencontre",
      location: "Annecy-le-vieux",
      distance: "150km",
      eventDate: "2025-06-06T18:00:00.000Z",
      timeRange: "18h00 à 00h00",
      price: 22.5,
      imageUrl:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop",
      styles: ["Jazz", "Expérimentale"],
      friendsGoing: 3,
      friendsAvatars: [
        "https://i.pravatar.cc/150?img=1",
        "https://i.pravatar.cc/150?img=2",
        "https://i.pravatar.cc/150?img=3",
      ],
    },
    {
      id: 2,
      title: "Festival Rock en Seine",
      location: "Paris",
      distance: "500km",
      eventDate: "2025-07-15T20:00:00.000Z",
      timeRange: "20h00 à 02h00",
      price: 45.0,
      imageUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop",
      styles: ["Rock", "Indie"],
      friendsGoing: 5,
      friendsAvatars: [
        "https://i.pravatar.cc/150?img=4",
        "https://i.pravatar.cc/150?img=5",
        "https://i.pravatar.cc/150?img=6",
      ],
    },
    {
      id: 3,
      title: "Nuit Électro",
      location: "Lyon",
      distance: "120km",
      eventDate: "2025-08-20T22:00:00.000Z",
      timeRange: "22h00 à 06h00",
      price: 35.0,
      imageUrl:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
      styles: ["Électro", "House"],
      friendsGoing: 2,
      friendsAvatars: [
        "https://i.pravatar.cc/150?img=7",
        "https://i.pravatar.cc/150?img=8",
      ],
    },
    {
      id: 4,
      title: "Jazz au Lac",
      location: "Annecy",
      distance: "5km",
      eventDate: "2025-09-10T19:00:00.000Z",
      timeRange: "19h00 à 23h00",
      price: 15.0,
      imageUrl:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop",
      styles: ["Jazz", "Soul"],
      friendsGoing: 8,
      friendsAvatars: [
        "https://i.pravatar.cc/150?img=9",
        "https://i.pravatar.cc/150?img=10",
        "https://i.pravatar.cc/150?img=11",
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Événements" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Badges */}
        <View style={styles.badgesContainer}>
          <LocationBadge
            location="Annecy"
            onPress={() => console.log("Change location")}
          />
          <CalendarBadge onPress={() => setCalendarVisible(true)} />
          <FilterBadge onPress={() => console.log("Open filters")} />
        </View>
        <View>
          <TabSelector
            activeTab={activeTab}
            onTabChange={setActiveTab}
            firstLabel="Evenement à venir"
            secondLabel="Événements passés"
          />
        </View>

        {/* Calendar Modal */}
        <CalendarModal
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setCalendarVisible(false);
          }}
        />

        {/* Liste des événements */}
        <View style={styles.eventsContainer}>
          {events.map((event) => (
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
    paddingTop: 10,
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
  titleContainer: {
    paddingHorizontal: 20,
  },
  eventsContainer: {
    gap: 16,
    paddingHorizontal: 20,
  },
});
