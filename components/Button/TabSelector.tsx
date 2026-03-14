import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Fonts } from "@/constants/theme";

interface TabSelectorProps {
  activeTab: "first" | "second";
  onTabChange: (tab: "first" | "second") => void;
  firstLabel: string;
  secondLabel: string;
}

export const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
  firstLabel,
  secondLabel,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, activeTab === "first" && styles.activeTab]}
        onPress={() => onTabChange("first")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "first" && styles.activeTabText,
          ]}
        >
          {firstLabel}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === "second" && styles.activeTab]}
        onPress={() => onTabChange("second")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "second" && styles.activeTabText,
          ]}
        >
          {secondLabel}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    letterSpacing: -0.48,
  },
  activeTabText: {
    color: "#000000",
  },
});

export default TabSelector;
