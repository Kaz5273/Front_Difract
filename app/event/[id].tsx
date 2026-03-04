import React from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  MoreHorizontal,
} from "lucide-react-native";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { EventHeaderImage } from "@/components/Event/EventHeaderImage";
import { EventAbout } from "@/components/Event/EventAbout";
import { ArtistVoteCard } from "@/components/Artist/ArtistVoteCard";
import { VoteCountdown } from "@/components/Vote/VoteCountdown";
import { Fonts } from "@/constants/theme";
import { useGuestGuard } from "@/hooks/use-guest-guard";
import { GuestActionModal } from "@/components/GuestActionModal";

// Données d'exemple - à remplacer par les vraies données
const exampleEvents = [
  {
    id: 1,
    title: "Espace rencontre",
    location: "Annecy-le-vieux - 150km",
    address: "33 Rue des Alpes - Annecy-le-Vieux",
    distance: "150km",
    eventDate: "2026-06-17T18:00:00.000Z",
    timeRange: "19h à 00h",
    duration: "6h00",
    capacity: "400 places",
    price: 22.5,
    imageUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    styles: ["Techno", "Rock", "Expérimentale", "Rap"],
    description:
      "Joe Biden, 46 ans, est un véritable alchimiste du son. Entre ses doigts, un saxophone ténor prend vie ; ses improvisations, nourries de deux décennies d'amour inconditionnel pour le jazz, convoquent aussi bien les bruissements feutrés des clubs new-yorkais que l'énergie éclatante de la scène parisienne.",
  },
];

const exampleParticipants = [
  {
    id: "1",
    name: "Milly Bobby Brown",
    rank: 1,
    votes: 124,
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    styles: ["Techno"],
    isVoted: true,
  },
  {
    id: "2",
    name: "Billy Joe",
    rank: 2,
    votes: 120,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    styles: ["Rock"],
    isVoted: false,
  },
  {
    id: "3",
    name: "Why so serious ?",
    rank: 3,
    votes: 95,
    imageUrl: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=300&h=300&fit=crop",
    styles: ["Reggae"],
    isVoted: false,
  },
  {
    id: "4",
    name: "No way bobby no way",
    rank: 4,
    votes: 34,
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    styles: ["Psychédélique"],
    isVoted: false,
  },
];

const exampleComments = [
  {
    id: "1",
    username: "@Kazeeee",
    avatar: "https://i.pravatar.cc/150?img=1",
    text: "Artiste incroyable ! C'était le feu sur scène, qualité scénique irréprochable, vous avez tout mon soutien !",
  },
  {
    id: "2",
    username: "@Kazeeee",
    avatar: "https://i.pravatar.cc/150?img=1",
    text: "Artiste incroyable ! C'était le feu sur scène, qualité scénique irréprochable, vous avez tout mon soutien !",
  },
];

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { showModal, setShowModal, guard } = useGuestGuard();
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
        headerBackgroundColor={{ light: "#111111", dark: "#111111" }}
        showsVerticalScrollIndicator={false}
        headerImage={
          <EventHeaderImage
            imageUrl={event.imageUrl}
            eventDate={event.eventDate}
            styles={event.styles}
            onSharePress={() => guard(() => console.log("Partager l'événement"))}
          />
        }
      >
        <ThemedView style={styles.contentContainer}>
          {/* Title + Countdown */}
          <View style={styles.titleRow}>
            <ThemedText style={styles.eventTitle} numberOfLines={1}>
              {event.title}
            </ThemedText>
            <VoteCountdown endDate={new Date(event.eventDate)} />
          </View>

          {/* Event Info */}
          <View style={styles.eventInfoContainer}>
            <View style={styles.infoRow}>
              <Calendar size={16} color="#FFFFFF" />
              <Text style={styles.infoText}>
                {formatEventDate(event.eventDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={16} color="#FFFFFF" />
              <Text style={styles.infoText}>{event.timeRange}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#FFFFFF" />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
          </View>
          <Pressable
              onPress={() => guard(() => console.log("Participer"))}
              style={styles.participateButton}
            >
              <Text style={styles.participateButtonText}>
                Participer à l'événement
              </Text>
            </Pressable>
          {/* Les participants */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Les participants</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.participantsScroll}
              style={{ overflow: "visible" }}
            >
              {exampleParticipants.map((artist) => (
                <ArtistVoteCard
                  key={artist.id}
                  id={artist.id}
                  name={artist.name}
                  rank={artist.rank}
                  votes={artist.votes}
                  imageUrl={artist.imageUrl}
                  styles={artist.styles}
                  isVoted={artist.isVoted}
                  onPress={() => guard(() => router.push(`/artist/${artist.id}`))}
                />
              ))}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <Pressable
              onPress={() => guard(() => router.push(`/vote/${event.id}`))}
              style={styles.voteButton}
            >
              <Text style={styles.voteButtonText}>
                Votez pour votre artiste préféré
              </Text>
            </Pressable>

            <Pressable
              onPress={() => guard(() => console.log("Billeterie"))}
              style={styles.ticketButton}
            >
              <Text style={styles.ticketButtonText}>
                Accéder à la billeterie
              </Text>
            </Pressable>
          </View>

          {/* À propos de l'événement */}
          <EventAbout description={event.description} />

        </ThemedView>
      </ParallaxScrollView>

      <GuestActionModal visible={showModal} onClose={() => setShowModal(false)} />
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
    gap: 24,
    backgroundColor: "#111111",
  },
  // Title + Countdown
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  eventTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 24,
    lineHeight: 32,
    flex: 1,
    letterSpacing: -0.72,
  },
  // Event Info
  eventInfoContainer: {
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
  // Sections
  sectionContainer: {
    gap: 12,
    overflow: "visible",
  },
  sectionTitle: {
    fontFamily: Fonts.regular,
    fontSize: 20,
    letterSpacing: -0.68,
    color: "#FFFFFF",
  },
  // Participants
  participantsScroll: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 4,
  },
  // Buttons
  buttonsContainer: {
    gap: 12,
    alignItems: "center",
  },
  participateButton: {
    backgroundColor: "#00F4A3",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 100,
    width: "100%",
  },
  participateButtonText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#006141",
    textAlign: "center",
    letterSpacing: -0.56,
  },
  voteButton: {
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 100,
    width: "100%",
  },
  voteButtonText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    letterSpacing: -0.56,
  },
  ticketButton: {
    backgroundColor: "#FC5F67",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    alignSelf: "center",
      width: "100%",
  },
  ticketButtonText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#000000",
    textAlign: "center",

    letterSpacing: -0.56,
  }
});
