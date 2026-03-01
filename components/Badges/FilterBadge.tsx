import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ListFilter } from "lucide-react-native";

interface FilterBadgeProps {
  onPress?: () => void;
  size?: number;
}

export const FilterBadge: React.FC<FilterBadgeProps> = ({
  onPress,
  size = 20,
}) => {
  const content = (
    <View style={styles.container}>
      <ListFilter size={size} color="#FFFFFF" strokeWidth={2} />
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
});

export default FilterBadge;
