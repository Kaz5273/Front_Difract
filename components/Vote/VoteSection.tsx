import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { Calendar, MapPin } from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import { VoteCountdown } from "./VoteCountdown";
import { ArtistVoteCard } from "@/components/Artist/ArtistVoteCard";

interface VotingArtist {
  id: string;
  name: string;
  rank: number;
  votes: number;
  imageUrl: string;
  styles: string[];
  isVoted?: boolean;
}

interface VoteSectionProps {
  eventName: string;
  eventDate: string;
  location: string;
  distance?: string;
  endDate: Date;
  artists: VotingArtist[];
  onArtistPress?: (artist: VotingArtist) => void;
}

export const VoteSection: React.FC<VoteSectionProps> = ({
  eventName,
  eventDate,
  location,
  distance,
  endDate,
  artists,
  onArtistPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Title + Countdown */}
      <View style={styles.headerRow}>
        <Text style={styles.eventName} numberOfLines={1}>
          {eventName}
        </Text>
        <VoteCountdown endDate={endDate} />
      </View>

      {/* Info Card - date + location in single blur card */}
      <View style={styles.infoCardWrapper}>
        <BlurView intensity={15} tint="dark" style={styles.infoCard}>
          <View style={styles.infoContent}>
            <View style={styles.infoRow}>
              <Calendar size={16} color="#FFFFFF" />
              <Text style={styles.infoText}>{eventDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#FFFFFF" />
              <Text style={styles.infoText}>
                {location}
                {distance ? ` - ${distance}` : ""}
              </Text>
            </View>
          </View>
        </BlurView>
      </View>

      {/* Artists horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.artistsScroll}
      >
        {artists.map((artist) => (
          <ArtistVoteCard
            key={artist.id}
            id={artist.id}
            name={artist.name}
            rank={artist.rank}
            votes={artist.votes}
            imageUrl={artist.imageUrl}
            styles={artist.styles}
            isVoted={artist.isVoted}
            onPress={() => onArtistPress?.(artist)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 8,
  },
  eventName: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.32,
    flex: 1,
  },
  // Single blur card for date + location
  infoCardWrapper: {
    paddingHorizontal: 20,
  },
  infoCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(26, 26, 26, 0.8)",
  },
  infoContent: {
    padding: 16,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
  },
  artistsScroll: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
});
