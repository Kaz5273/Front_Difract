import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Calendar } from "lucide-react-native";

interface CalendarBadgeProps {
  onPress?: () => void;
  size?: number;
}

export const CalendarBadge: React.FC<CalendarBadgeProps> = ({
  onPress,
  size = 18,
}) => {
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
    backgroundColor: "#343434",
    borderRadius: 25,
    width: 40,
    height: 30,
  },
});

export default CalendarBadge;
