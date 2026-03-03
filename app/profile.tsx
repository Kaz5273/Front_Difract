import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CircleUserRound,
  CircleQuestionMark,
  KeyboardMusic,
  Ellipsis,
  LogOut,
} from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { getMediaUrl } from "@/services/api/client";
import { MenuItem, ProfileHeader } from "@/components/Profile";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const profileMedia = user?.media?.find(
    (m) => m.role === "PROFILE" && m.is_primary
  );
  const userAvatar = profileMedia
    ? getMediaUrl(profileMedia)
    : user?.media_url ?? null;

  const handleLogout = async () => {
    await logout();
    router.replace("/OnBoarding/onboarding");
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      {/* Header */}
      <ProfileHeader onSettings={() => router.push("/settings")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Compléter votre profil */}
        <Text style={styles.profileCompleteText}>
          Compléter votre profil (Étapes 1/5)
        </Text>

        {/* Grande photo de profil centrée */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                <CircleUserRound size={72} color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          <View style={styles.menuTopBorder} />
          <MenuItem
            icon={CircleQuestionMark}
            label="Foire aux questions"
          />
          <MenuItem
            icon={KeyboardMusic}
            label="Passer à un compte professionnelle"
          />
          <MenuItem
            icon={CircleQuestionMark}
            label="Foire aux questions"
          />
          <MenuItem
            icon={Ellipsis}
            label="À propos"
          />
        </View>

        {/* Déconnexion */}
        <View style={styles.logoutSection}>
          <MenuItem
            icon={LogOut}
            label="Déconnexion"
            showChevron={false}
            showBorder={false}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },

  // Compléter profil
  profileCompleteText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.24,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    marginTop: 40,
  },
  avatarContainer: {
    width: 144,
    height: 144,
    borderRadius: 72,
    overflow: "hidden",
  },
  avatarImage: {
    width: 144,
    height: 144,
    borderRadius: 72,
  },
  avatarPlaceholder: {
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },

  // Menu
  menuSection: {
    marginTop: 40,
  },
  menuTopBorder: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },

  // Déconnexion
  logoutSection: {
    marginTop: 60,
    alignItems: "center",
  },
});
