import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Fonts } from "@/constants/theme";

interface VoteTabSelectorProps {
  activeTab: "en-cours" | "termine";
  onTabChange: (tab: "en-cours" | "termine") => void;
}

export const VoteTabSelector: React.FC<VoteTabSelectorProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, activeTab === "en-cours" && styles.activeTab]}
        onPress={() => onTabChange("en-cours")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "en-cours" && styles.activeTabText,
          ]}
        >
          Vote en cours
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === "termine" && styles.activeTab]}
        onPress={() => onTabChange("termine")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "termine" && styles.activeTabText,
          ]}
        >
          Vote terminé
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingHorizontal: 5,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    letterSpacing: -0.48,
  },
  activeTabText: {
    color: "#000000",
  },
});

export default VoteTabSelector;
