import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { MapPin } from "lucide-react-native";
import { Fonts, Typography } from "@/constants/theme";

interface VoteEventCardProps {
  eventName: string;
  location: string;
  distance: string;
  dayOfWeek: string;
  dayNumber: string;
  month: string;
  onPress?: () => void;
}

export const VoteEventCard: React.FC<VoteEventCardProps> = ({
  eventName,
  location,
  distance,
  dayOfWeek,
  dayNumber,
  month,
  onPress,
}) => {
  return (
    <BlurView intensity={2} style={styles.container}>
      {/* Date Badge */}
      <View style={styles.dateBadge}>
        <BlurView intensity={15} style={styles.dateBlur}>
          <Text style={styles.dayOfWeek}>{dayOfWeek}</Text>
          <Text style={styles.dayNumber}>{dayNumber}</Text>
          <Text style={styles.month}>{month}</Text>
        </BlurView>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <View style={styles.eventDetails}>
          <Text style={styles.eventName} numberOfLines={1}>
            {eventName}
          </Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color="#D7D7D7" />
            <Text style={styles.locationText} numberOfLines={1}>
              {location} - {distance}
            </Text>
          </View>
        </View>

        {/* Voir plus Button */}
        <Pressable onPress={onPress}>
          <BlurView intensity={15} style={styles.seeMoreButton}>
            <Text style={styles.seeMoreText}>Voir plus</Text>
          </BlurView>
        </Pressable>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
    height: 64,
    padding: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  dateBadge: {
    width: 54,
    height: 54,
    borderRadius: 15,
    overflow: "hidden",
  },
  dateBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  dayOfWeek: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.4,
    lineHeight: 12,
    marginTop: -2, // Ajuste selon le besoin
    marginBottom: -2,
  },
  dayNumber: {
    ...Typography.body,
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  month: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.4,
    lineHeight: 12,
    marginTop: -2, // Ajuste selon le besoin
    marginBottom: -2,
  },
  eventInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    height: "100%",
  },
  eventDetails: {
    flex: 1,
    gap: 5,
  },
  eventName: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.56,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.4,
  },
  seeMoreButton: {
    padding: 8,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  seeMoreText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
});

export default VoteEventCard;
