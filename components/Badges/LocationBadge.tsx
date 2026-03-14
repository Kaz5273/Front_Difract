import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MapPin, X } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface LocationBadgeProps {
  location: string;
  onPress?: () => void;
  onClear?: () => void;
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
  location,
  onPress,
  onClear,
}) => {
  const showClear = !!location && !!onClear;

  const inner = (
    <View style={styles.container}>
      <MapPin size={20} color="#FFFFFF" strokeWidth={2} />
      <Text style={styles.locationText}>{location || "Ma position"}</Text>
      {showClear && (
        <Pressable onPress={onClear} hitSlop={8} style={styles.clearButton}>
          <X size={12} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {inner}
      </Pressable>
    );
  }

  return inner;
};

const styles = StyleSheet.create({
  pressable: {},
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 8,
    backgroundColor: "#212121",
    borderRadius: 25,
  },
  locationText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.24,
  },
  clearButton: {
    marginLeft: -4,
  },
});

export default LocationBadge;
