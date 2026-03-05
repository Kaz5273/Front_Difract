import React from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import { ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "@/constants/theme";
import { EventCard } from "@/components/Event/EventCard";

// Données brutes - à remplacer par les vraies données API
const MOCK_EVENT = {
  id: 1,
  title: "Espace rencontre",
  location: "Annecy-le-vieux - 150km",
  distance: "150km",
  eventDate: "2026-06-17T18:00:00.000Z",
  timeRange: "18h à 00h",
  price: 20,
  imageUrl:
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
  styles: ["Techno", "Drum&Bass", "Rock", "Expérimentale", "Rap", "Jazz", "Reggae"],
  friendsAvatars: [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=300&h=300&fit=crop",
  ],
};

export default function ParticipateScreen() {
  const { id } = useLocalSearchParams();

  const handleConfirm = () => {
    router.push(`/event/participate/confirm/${id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <BlurView intensity={15} style={styles.backButtonBlur}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </BlurView>
          </Pressable>
        </View>

        {/* Event Card */}
        <EventCard
          id={MOCK_EVENT.id}
          title={MOCK_EVENT.title}
          eventDate={MOCK_EVENT.eventDate}
          timeRange={MOCK_EVENT.timeRange}
          location={MOCK_EVENT.location}
          distance={MOCK_EVENT.distance}
          price={MOCK_EVENT.price}
          imageUrl={MOCK_EVENT.imageUrl}
          styles={MOCK_EVENT.styles}
          friendsAvatars={MOCK_EVENT.friendsAvatars}
          onPress={() => {}}
        />

        {/* Question */}
        <Text style={styles.questionText}>
          Êtes-vous sur de vouloir participer à cet événement ?
        </Text>

        {/* Warning text */}
        <Text style={styles.warningText}>
          <Text style={styles.warningGray}>
            Attention, vous ne pourrez pas changer{" "}
          </Text>
          <Text style={styles.warningWhite}>
            votre vote avant une semaine{" "}
          </Text>
          <Text style={styles.warningGray}>
            et si vous avez déjà voté alors le{" "}
          </Text>
          <Text style={styles.warningWhite}>vote sera annulé</Text>
          <Text style={styles.warningGray}> !</Text>
        </Text>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>
              Je confirme ma participation
            </Text>
          </Pressable>

          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>
              Je préfère prendre mon temps
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111111",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 32,
    overflow: "hidden",
  },
  backButtonBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "#373737",
    justifyContent: "center",
    alignItems: "center",
  },
  questionText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.32,
    alignSelf: "center",
    width: 239,
  },
  warningText: {
    textAlign: "center",
    alignSelf: "center",
    width: 281,
  },
  warningGray: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#8F8F8F",
    letterSpacing: -0.42,
    lineHeight: 18,
  },
  warningWhite: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.42,
    lineHeight: 18,
  },
  buttonsContainer: {
    alignItems: "center",
    gap: 8,
  },
  confirmButton: {
    backgroundColor: "#F9F871",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 27,
    width: 323,
  },
  confirmButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#5F5F2B",
    letterSpacing: -0.28,
  },
  cancelButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 27,
    width: 323,
  },
  cancelButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
});
