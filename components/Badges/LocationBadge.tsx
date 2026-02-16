import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MapPin } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface LocationBadgeProps {
  location: string;
  onPress?: () => void;
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
  location,
  onPress,
}) => {
  const content = (
    <View style={styles.container}>
      <MapPin size={18} color="#FFFFFF" strokeWidth={2} />
      <Text style={styles.locationText}>{location}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  pressable: {
    alignSelf: "flex-start",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 11,
    backgroundColor: "#343434",
    borderRadius: 30,
  },
  locationText: {
    fontFamily: Fonts.extraBold,
    fontSize: 11,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.44,
  },
});

export default LocationBadge;
