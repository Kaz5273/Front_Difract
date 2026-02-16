import React from "react";
import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Header } from "@/components/Header/header";
import { Link, router } from "expo-router";
import { useAuth } from "@/hooks/use-auth";

export default function TicketsScreen() {
  const { logout, isLoading } = useAuth();

  // 🚪 Fonction de déconnexion
  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("🚪 User clicked logout");
            await logout();
            console.log("✅ Logout successful, redirecting...");
            router.replace("/Auth/Index");
          } catch (error) {
            console.error("❌ Logout error:", error);
            Alert.alert("Erreur", "Impossible de se déconnecter");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Mes Billets" showBackButton showMenuButton />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <ThemedText type="body">Mes Billets</ThemedText>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Test onboarding</ThemedText>
          <ThemedText type="link">
            <Link href="/OnBoarding/onboarding">Ouvrir le modal</Link>
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Test Page connexion</ThemedText>
          <Pressable
            onPress={() => {
              router.push("/Auth/Index");
            }}
          >
            <ThemedText type="link">Go to Auth Index</ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Test déco</ThemedText>
          <Pressable
            onPress={handleLogout}
            disabled={isLoading}
            style={({ pressed }) => [styles.logoutButton]}
          >
            <ThemedText type="body">
              {isLoading ? "Déconnexion en cours..." : "Se déconnecter"}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  stepContainer: {
    gap: 12,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
});
