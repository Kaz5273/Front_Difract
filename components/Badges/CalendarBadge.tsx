import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Calendar, X } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface CalendarBadgeProps {
  onPress?: () => void;
  size?: number;
  selectedDate?: Date;
  filterLabel?: string;
  onClear?: () => void;
}

function formatShortDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
}

export const CalendarBadge: React.FC<CalendarBadgeProps> = ({
  onPress,
  size = 20,
  selectedDate,
  filterLabel,
  onClear,
}) => {
  const label = filterLabel ?? (selectedDate ? formatShortDate(selectedDate) : null);

  if (label) {
    return (
      <View style={styles.activeContainer}>
        <Pressable onPress={onPress} style={styles.activeLabel}>
          <Calendar size={14} color="#FC5F67" strokeWidth={2} />
          <Text style={styles.dateText}>{label}</Text>
        </Pressable>
        {onClear && (
          <Pressable onPress={onClear} style={styles.clearButton}>
            <X size={12} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        )}
      </View>
    );
  }

  const content = (
    <View style={styles.container}>
      <Calendar size={size} color="#FFFFFF" strokeWidth={2} />
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
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#212121",
    borderRadius: 25,
  },
  activeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#212121",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#FC5F67",
    overflow: "hidden",
  },
  activeLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
  },
  dateText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FC5F67",
    letterSpacing: -0.24,
  },
  clearButton: {
    paddingVertical: 8,
    paddingRight: 10,
    paddingLeft: 2,
  },
});

export default CalendarBadge;
