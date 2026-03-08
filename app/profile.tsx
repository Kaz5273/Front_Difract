import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CircleUserRound,
  CircleHelp,
  KeyboardMusic,
  Ellipsis,
  LogOut,
  Settings,
} from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { getMediaUrl } from "@/services/api/client";
import { MenuItem } from "@/components/Profile";
import { Header } from "@/components/Header/header";

// Données brutes badge - à remplacer par les vraies données API
const MOCK_BADGE = {
  emoji: "⚡️",
  title: "Machine à votes",
  progress: 0.38, // 38%
  progressLabel: "03/25",
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const isArtist = user?.role === "ARTIST";

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
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <Header
        title="Mon compte"
        subtitle={isArtist ? "Compte artiste" : "Compte utilisateur"}
        subtitleColor={isArtist ? "#F9F871" : "#FC5F67"}
        variant="detail"
        rightComponent={
          <Pressable onPress={() => router.push("/settings")} style={{ padding: 8, borderRadius: 8 }}>
            <Settings size={24} color="#FFFFFF" />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Compléter votre profil */}
        <Text style={styles.profileCompleteText}>
          Compléter votre profil (Étapes 1/5)
        </Text>

        {/* Avatar + Badge (public only) */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
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

            {/* Badge overlay - public only */}
            {!isArtist && (
              <View style={styles.badgeOverlay}>
                <LinearGradient
                  colors={["#FF8C42", "#F9F871"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.badgeGradient}
                >
                  <Text style={styles.badgeEmoji}>{MOCK_BADGE.emoji}</Text>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Badge info - public only */}
          {!isArtist && (
            <View style={styles.badgeInfoSection}>
              <Text style={styles.badgeTitle}>{MOCK_BADGE.title}</Text>

              <View style={styles.progressRow}>
                <View style={styles.progressBarOuter}>
                  <LinearGradient
                    colors={["#F9F871", "#FF8C42"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[
                      styles.progressBarInner,
                      { width: `${MOCK_BADGE.progress * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {MOCK_BADGE.progressLabel}
                </Text>
                <CircleHelp size={16} color="#FF8C42" />
              </View>
            </View>
          )}
        </View>

        {/* Artist-specific buttons */}
        {isArtist && (
          <View style={styles.artistButtonsSection}>
            <Pressable
              onPress={() => router.push("/artist/profile_artist/1")}
              style={styles.artistMainButton}
            >
              <Text style={styles.artistMainButtonText}>
                Gérer votre compte artiste
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {/* TODO: gérer abonnement */}}
              style={styles.artistSecondaryButton}
            >
              <Text style={styles.artistSecondaryButtonText}>
                Gérer mon abonnement
              </Text>
            </Pressable>
          </View>
        )}

        {/* Menu items */}
        <View style={styles.menuSection}>
          <View style={styles.menuTopBorder} />

          {isArtist ? (
            <>
              <MenuItem
                icon={CircleHelp}
                label="Comment participer à un event ?"
              />
              <MenuItem
                icon={CircleHelp}
                label="Foire aux questions"
              />
            </>
          ) : (
            <>
              <MenuItem
                icon={CircleHelp}
                label="Foire aux questions"
              />
              <MenuItem
                icon={KeyboardMusic}
                label="Passer à un compte professionnelle"
              />
              <MenuItem
                icon={CircleHelp}
                label="Foire aux questions"
              />
            </>
          )}

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
    backgroundColor: "#111111",
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
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.24,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    marginTop: 40,
    gap: 16,
  },
  avatarWrapper: {
    position: "relative",
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

  // Badge overlay
  badgeOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  badgeGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeEmoji: {
    fontSize: 28,
  },

  // Badge info
  badgeInfoSection: {
    alignItems: "center",
    gap: 8,
  },
  badgeTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FF8C42",
    letterSpacing: -0.24,
    lineHeight: 14,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBarOuter: {
    width: 69,
    height: 15,
    borderRadius: 30,
    backgroundColor: "rgba(255, 140, 66, 0.26)",
    borderWidth: 1,
    borderColor: "#FF8C42",
    padding: 2,
    overflow: "hidden",
  },
  progressBarInner: {
    height: 11,
    borderRadius: 5.5,
  },
  progressLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: "#FF8C42",
    letterSpacing: -0.2,
  },

  // Artist buttons
  artistButtonsSection: {
    marginTop: 40,
    alignItems: "center",
    gap: 8,
  },
  artistMainButton: {
    backgroundColor: "#F9F871",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    borderRadius: 30,
    width: "100%",
  },
  artistMainButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#5F5F2B",
    letterSpacing: -0.28,
  },
  artistSecondaryButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    borderRadius: 30,
    width: "100%",
  },
  artistSecondaryButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#F9F871",
    letterSpacing: -0.28,
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
