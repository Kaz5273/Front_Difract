import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Header } from "@/components/Header/header";

export default function VoteScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Événements" showBackButton showMenuButton />
      <View style={styles.content}>
        <ThemedText type="body"></ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
