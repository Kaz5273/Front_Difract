import React from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
}

export function MenuItem({ icon: Icon, label, onPress }: MenuItemProps) {
  return (
    <LinearGradient
      colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.04)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Pressable style={styles.pressable} onPress={onPress}>
        <View style={styles.left}>
          <Icon size={24} color="#FFFFFF" />
          <Text style={styles.label}>{label}</Text>
        </View>
        <ChevronRight size={18} color="#FFFFFF" />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingVertical: 10,
  },
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },
});
