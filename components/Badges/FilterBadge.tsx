import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ListFilter } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface FilterBadgeProps {
  onPress?: () => void;
  size?: number;
  count?: number;
}

export const FilterBadge: React.FC<FilterBadgeProps> = ({
  onPress,
  size = 20,
  count = 0,
}) => {
  const active = count > 0;

  const content = (
    <View style={[styles.container, active && styles.containerActive]}>
      <ListFilter size={size} color={active ? "#FC5F67" : "#FFFFFF"} strokeWidth={2} />
      {active && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
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
  containerActive: {
    borderWidth: 1,
    borderColor: "#FC5F67",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FC5F67",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#FFFFFF",
    lineHeight: 12,
  },
});

export default FilterBadge;
