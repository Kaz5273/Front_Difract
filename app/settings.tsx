import React from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  Piano,
  CircleHelp,
  ShieldCheck,
  BellDot,
  BookOpenText,
  MoreHorizontal,
  LogOut,
} from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { ProfileHeader } from "@/components/Profile";

interface SettingsItemProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  showChevron?: boolean;
  onPress?: () => void;
}

function SettingsItem({
  icon: Icon,
  label,
  showChevron = true,
  onPress,
}: SettingsItemProps) {
  return (
    <>
      <Pressable style={styles.settingsItem} onPress={onPress}>
        <View style={styles.settingsItemLeft}>
          <Icon size={24} color="#FFFFFF" />
          <Text style={styles.settingsItemLabel}>{label}</Text>
        </View>
        {showChevron && <ChevronRight size={18} color="#FFFFFF" />}
      </Pressable>
      <View style={styles.separator} />
    </>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const userUsername =
    user?.name?.toLowerCase().replace(/\s+/g, "_") || "victorien_mouton";
  const userEmail = user?.email || "victorien.mouton.etud@gmail.com";
  const userAvatar = user?.media_url || "https://i.pravatar.cc/150?img=8";

  const handleLogout = async () => {
    await logout();
    router.replace("/Auth/Login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      {/* Header avec seulement le bouton retour */}
      <ProfileHeader title="Paramètre du compte" showActions={false} />

      {/* Contenu de la page */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Section utilisateur */}
        <Pressable style={styles.userSection}>
          <View style={styles.userInfo}>
            <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
            <View style={styles.userTextInfo}>
              <Text style={styles.userUsername}>@{userUsername}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#FFFFFF" />
        </Pressable>

        {/* Liste des paramètres */}
        <View style={styles.settingsList}>
          <View style={styles.separator} />

          <SettingsItem
            icon={Piano}
            label="Passer à un compte professionnelle"
          />

          <SettingsItem icon={CircleHelp} label="Foire aux questions" />

          <SettingsItem icon={ShieldCheck} label="Confidentialité et partage" />

          <SettingsItem icon={BellDot} label="Notifications" />

          <SettingsItem icon={BookOpenText} label="Conditions d'utilisations" />

          <SettingsItem icon={MoreHorizontal} label="À propos" />

          {/* Bouton Déconnexion centré */}
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
    backgroundColor: "#080808",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 15,
    paddingVertical: 14,
    gap: 20,
  },
  // Section utilisateur
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 44,
  },
  userTextInfo: {
    gap: 2,
  },
  userUsername: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: "#FFFFFF",
    letterSpacing: -0.68,
  },
  userEmail: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#B3B3B3",
    letterSpacing: -0.4,
  },
  // Liste des paramètres
  settingsList: {
    paddingVertical: 10,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingsItemLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.56,
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
    paddingVertical: 14,
    marginTop: 10,
  },
});
