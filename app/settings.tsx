import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Pressable,
  Switch,
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  CircleHelp,
  ShieldCheck,
  BellDot,
  BookOpenText,
  LogOut,
  MapPin,
  Pencil,
} from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header/header";
import { getMediaUrl } from "@/services/api/client";
import { locationService } from "@/services/location/location.service";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    locationService.isLocationActive().then(setLocationEnabled);
  }, []);

  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      // Activer : demander la permission OS si pas encore accordée
      const granted = await locationService.requestPermission();
      if (granted) {
        setLocationEnabled(true);
        locationService.setTrackingEnabled(true).catch(() => {});
      } else {
        Alert.alert(
          "Localisation refusée",
          "Pour activer la géolocalisation, autorisez l'accès dans les réglages de votre téléphone.",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Ouvrir les réglages", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else {
      // Désactiver : sauvegarder la préférence et notifier le backend
      setLocationEnabled(false);
      locationService.setTrackingEnabled(false).catch(() => {});
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/Auth/Login");
  };

  const profileMedia = user?.media?.find((m) => m.role === "PROFILE" && m.is_primary);
  const userAvatar = profileMedia ? getMediaUrl(profileMedia) : user?.media_url ?? null;
  const userDisplayName = user?.name || "Utilisateur";
  const userUsername = user?.name?.toLowerCase().replace(/\s+/g, "_") || "utilisateur";
  const userEmail = user?.email || "";

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Header title="Paramètre du compte" variant="detail" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile completion */}
        <Text style={styles.completionText}>Compléter votre profil (Étapes 1/5)</Text>

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
            {user?.role !== "ARTIST" && (
              <Pressable style={styles.editButton} onPress={() => router.push("/profile-completion")}>
                <Pencil size={15} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.displayName}>{userDisplayName}</Text>
            <Text style={styles.usernameSmall}>@{userUsername}</Text>
          </View>
        </View>

        {/* Settings list */}
        <View style={styles.settingsList}>

          {/* Account row */}
          <Pressable style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <View>
                <Text style={styles.accountUsername}>@{userUsername}</Text>
                <Text style={styles.accountEmail}>{userEmail}</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.separator} />

          {/* FAQ */}
          <Pressable style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <CircleHelp size={24} color="#FFFFFF" />
              <Text style={styles.settingsItemLabel}>Foire aux questions</Text>
            </View>
            <ChevronRight size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.separator} />

          {/* Confidentialité */}
          <Pressable style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <ShieldCheck size={24} color="#FFFFFF" />
              <Text style={styles.settingsItemLabel}>Confidentialité et partage</Text>
            </View>
            <ChevronRight size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.separator} />

          {/* Notifications */}
          <Pressable style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <BellDot size={24} color="#FFFFFF" />
              <Text style={styles.settingsItemLabel}>Notifications</Text>
            </View>
            <ChevronRight size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.separator} />

          {/* Géolocalisation */}
          <Pressable style={styles.settingsItem} onPress={() => handleLocationToggle(!locationEnabled)}>
            <View style={styles.settingsItemLeft}>
              <MapPin size={24} color="#FFFFFF" />
              <Text style={styles.settingsItemLabel}>Géolocalisation</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: "#3A3A3A", true: "#FC5F67" }}
              thumbColor="#FFFFFF"
            />
          </Pressable>
          <View style={styles.separator} />

          {/* Conditions */}
          <Pressable style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <BookOpenText size={24} color="#FFFFFF" />
              <Text style={styles.settingsItemLabel}>Conditions d'utilisations</Text>
            </View>
            <ChevronRight size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.separator} />

          {/* Logout */}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={24} color="#FFFFFF" />
            <Text style={styles.settingsItemLabel}>Déconnexion</Text>
          </Pressable>
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
    paddingTop: 32,
    paddingBottom: 60,
    gap: 32,
  },
  completionText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.24,
  },
  // Avatar
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrapper: {
    position: "relative",
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    backgroundColor: "#333333",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    left: 53,
    width: 33,
    height: 33,
    borderRadius: 33,
    backgroundColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInfo: {
    gap: 8,
  },
  displayName: {
    fontFamily: Fonts.regular,
    fontSize: 24,
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
  usernameSmall: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#D7D7D7",
    letterSpacing: -0.2,
  },
  // Settings list
  settingsList: {
    gap: 0,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingsItemLabel: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  accountUsername: {
    fontFamily: Fonts.regular,
    fontSize: 24,
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
  accountEmail: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#B3B3B3",
    letterSpacing: -0.2,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 20,
    marginTop: 8,
  },
});
