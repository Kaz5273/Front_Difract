import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
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

export default function VoteScreen() {
  const [activeTab, setActiveTab] = useState<"first" | "second">("first");
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const voteEndDate = new Date();
  voteEndDate.setDate(voteEndDate.getDate() + 1);
  voteEndDate.setHours(voteEndDate.getHours() + 3);
  voteEndDate.setMinutes(voteEndDate.getMinutes() + 39);

  const votingArtists = [
    {
      id: "1",
      name: "Milly Bobby Bro...",
      rank: 1,
      votes: 124,
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      styles: ["Techno", "House", "Minimal", "Ambient"],
    },
    {
      id: "2",
      name: "Billy Joe",
      rank: 2,
      votes: 120,
      imageUrl:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
      styles: ["Rock", "Indie", "Pop", "Alternative"],
    },
    {
      id: "3",
      name: "Why so serious",
      rank: 3,
      votes: 95,
      imageUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
      styles: ["Reggae", "Dub"],
    },
  ];

  const voteEvents = [
    {
      id: "1",
      eventName: "Espace rencontre - Soirée électro",
      eventDate: "Samedi 17 Juin 2026",
      location: "Annecy-le-vieux",
      distance: "150km",
      endDate: voteEndDate,
      artists: votingArtists,
    },
    {
      id: "2",
      eventName: "Espace rencontre ",
      eventDate: "Samedi 17 Juin 2026",
      location: "Annecy-le-vieux",
      distance: "150km",
      endDate: voteEndDate,
      artists: votingArtists,
    },
    {
      id: "3",
      eventName: "Espace rencontre - Soiré...",
      eventDate: "Samedi 17 Juin 2026",
      location: "Annecy-le-vieux",
      distance: "150km",
      endDate: voteEndDate,
      artists: votingArtists,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Les votes" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter badges row */}
        <View style={styles.badgesContainer}>
          <LocationBadge
            location="Annecy"
            onPress={() => console.log("Change location")}
          />
          <CalendarBadge onPress={() => setCalendarVisible(true)} />
          <FilterBadge onPress={() => console.log("Open filters")} />
          <Pressable
            style={styles.sortButton}
            onPress={() => console.log("Sort")}
          >
            <ArrowDownUp size={14} color="#FFFFFF" />
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

        {/* Vote Sections */}
        {voteEvents.map((event) => (
          <VoteSection
            key={event.id}
            eventName={event.eventName}
            eventDate={event.eventDate}
            location={event.location}
            distance={event.distance}
            endDate={event.endDate}
            artists={event.artists}
            onArtistPress={() => router.push(`/vote/${event.id}`)}
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
    gap: 4,
    backgroundColor: "#343434",
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 30,
  },
  sortText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
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
