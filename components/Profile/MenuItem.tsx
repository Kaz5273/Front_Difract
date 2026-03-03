import React from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  showChevron?: boolean;
  showBorder?: boolean;
  onPress?: () => void;
}

export function MenuItem({ icon: Icon, label, showChevron = true, showBorder = true, onPress }: MenuItemProps) {
  return (
    <Pressable style={[styles.container, !showBorder && styles.noBorder]} onPress={onPress}>
      <View style={styles.left}>
        <Icon size={24} color="#FFFFFF" />
        <Text style={styles.label}>{label}</Text>
      </View>
      {showChevron && <ChevronRight size={18} color="#FFFFFF" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.25)",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
});
