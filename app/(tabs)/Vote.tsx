import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header/header";
import { ArtistVoteCard } from "@/components/Artist/ArtistVoteCard";
import { LocationBadge } from "@/components/Badges/LocationBadge";
import { VoteCountdown } from "@/components/Vote/VoteCountdown";
import { VoteEventCard } from "@/components/Vote/VoteEventCard";
import { TabSelector } from "@/components/Button/TabSelector";
import { CalendarBadge } from "@/components/Badges/CalendarBadge";
import { CalendarModal } from "@/components/Calendar/CalendarModal";
import { Filter } from "lucide-react-native";
import FilterBadge from "@/components/Badges/FilterBadge";

export default function VoteScreen() {
  const [activeTab, setActiveTab] = useState<"first" | "second">("first");
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Date de fin des votes (exemple: dans 1 jour, 3 heures, 39 minutes)
  const voteEndDate = new Date();
  voteEndDate.setDate(voteEndDate.getDate() + 1);
  voteEndDate.setHours(voteEndDate.getHours() + 3);
  voteEndDate.setMinutes(voteEndDate.getMinutes() + 39);

  // Données d'exemple pour les artistes en vote
  const votingArtists = [
    {
      id: "1",
      name: "Choi",
      rank: 1,
      votes: 132,
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      styles: ["Folk", "Indie", "Rock", "Pop"],
    },
    {
      id: "2",
      name: "Luna",
      rank: 2,
      votes: 98,
      imageUrl:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
      styles: ["Jazz", "Soul", "R&B"],
    },
    {
      id: "3",
      name: "Nova",
      rank: 3,
      votes: 76,
      imageUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
      styles: ["Electronic", "House"],
    },
    {
      id: "4",
      name: "Echo",
      rank: 4,
      votes: 54,
      imageUrl:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
      styles: ["Rock", "Alternative"],
    },
    {
      id: "5",
      name: "Pulse",
      rank: 5,
      votes: 32,
      imageUrl:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
      styles: ["Hip-Hop", "Rap", "Trap"],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Les votes" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.badgesContainer}>
          <LocationBadge
            location="Annecy"
            onPress={() => console.log("Change location")}
          />
          <CalendarBadge onPress={() => setCalendarVisible(true)} />
          <FilterBadge onPress={() => console.log("Open filters")} />
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

        {/* Tab Selector */}
        <View>
          <TabSelector
            activeTab={activeTab}
            onTabChange={setActiveTab}
            firstLabel="Vote en cours"
            secondLabel="Vote terminé"
          />
        </View>

        {/* Section Vote Info */}
        <View style={styles.voteInfoSection}>
          {/* Countdown Timer */}
          <VoteCountdown endDate={voteEndDate} />

          {/* Event Card */}
          <VoteEventCard
            eventName="Espace rencontre"
            location="Annecy-le-vieux"
            distance="150km"
            dayOfWeek="ven."
            dayNumber="06"
            month="juin"
            onPress={() => console.log("Voir plus")}
          />
        </View>

        {/* Section Artistes en vote */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.artistsSection}
        >
          {votingArtists.map((artist) => (
            <ArtistVoteCard
              key={artist.id}
              id={artist.id}
              name={artist.name}
              rank={artist.rank}
              votes={artist.votes}
              imageUrl={artist.imageUrl}
              styles={artist.styles}
              onPress={() => console.log("Vote pour:", artist.name)}
            />
          ))}
        </ScrollView>
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
  },
  badgesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 8,
  },
  titleContainer: {
    paddingHorizontal: 20,
  },
  voteInfoSection: {
    paddingHorizontal: 20,
    gap: 5,
  },
  artistsSection: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
});
