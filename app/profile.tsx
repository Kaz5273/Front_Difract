import React, { useState } from "react";
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
import { Plus, Tickets, Users, Calendar, X } from "lucide-react-native";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { MenuItem, FriendsCard, ProfileHeader } from "@/components/Profile";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [showUserTypeCard, setShowUserTypeCard] = useState(true);

  // Données utilisateur avec valeurs par défaut
  const userName = user?.name || "Victorien Mouton";
  const userUsername =
    user?.name?.toLowerCase().replace(/\s+/g, "_") || "victorien_mouton";
  const userAvatar = user?.media_url || "https://i.pravatar.cc/150?img=8";
  // Ces champs seront à ajouter dans l'API plus tard
  const friendsCount = 0;
  const eventsCount = 0;

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      {/* Header */}
      <ProfileHeader onSettings={() => router.push("/settings")} />

      {/* Contenu de la page */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Carte Compte utilisateur */}
        {showUserTypeCard && (
          <View style={styles.userTypeCard}>
            <Pressable
              style={styles.closeCardButton}
              onPress={() => setShowUserTypeCard(false)}
            >
              <X size={14} color="#000000" />
            </Pressable>
            <Text style={styles.userTypeTitle}>Compte utilisateur</Text>
            <Text style={styles.userTypePromo}>
              Vous faites de la musique ? Passez à un compte artiste !
            </Text>
            <Text style={styles.userTypeSubtext}>
              Retrouvez cette fonctionnalité dans les paramètres
            </Text>
          </View>
        )}

        {/* Section Profil Utilisateur */}
        <View style={styles.profileSection}>
          {/* Avatar + Infos */}
          <View style={styles.profileUserInfo}>
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: userAvatar }} style={styles.profileImage} />
              {/* Badge "+" pour ajouter photo */}
              <View style={styles.addPhotoButton}>
                <Plus size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileUsername}>@{userUsername}</Text>
            </View>
          </View>

          {/* Stats : Amis | Soirées */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{friendsCount}</Text>
              <Text style={styles.statLabel}> Amis</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{eventsCount}</Text>
              <Text style={styles.statLabel}> Soirées</Text>
            </View>
          </View>

          {/* Compléter le profil */}
          <Text style={styles.profileCompleteText}>
            Compléter votre profil (Étapes 1/5)
          </Text>
        </View>

        {/* Menu Items */}
        <MenuItem icon={Tickets} label="Voir vos billets" />
        <MenuItem icon={Users} label="Parrainez un.e ami.e.s" />

        {/* Carte Suivez vos amis */}
        <FriendsCard />

        {/* Bouton Voir vos événements passés */}
        <MenuItem icon={Calendar} label="Voir vos événements passés" />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 20,
  },
  // Carte Compte utilisateur
  userTypeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: "center",
    position: "relative",
  },
  closeCardButton: {
    position: "absolute",
    top: 13,
    right: 12,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  userTypeTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: "#000000",
    textAlign: "center",
    letterSpacing: -0.6,
  },
  userTypePromo: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#FC5F67",
    textAlign: "center",
    letterSpacing: -0.52,
    marginTop: 5,
  },
  userTypeSubtext: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: "#9F9F9F",
    textAlign: "center",
    letterSpacing: -0.4,
    marginTop: 2,
  },
  profileSection: {
    gap: 15,
  },
  profileUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  profileImageContainer: {
    position: "relative",
    width: 50,
    height: 50,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 44,
  },
  addPhotoButton: {
    position: "absolute",
    bottom: -3,
    left: 34,
    width: 21,
    height: 21,
    borderRadius: 15,
    backgroundColor: "#6F6F6F",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    gap: 5,
  },
  profileName: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.64,
  },
  profileUsername: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: "#D7D7D7",
    letterSpacing: -0.4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
  },
  statValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.52,
    lineHeight: 18,
  },
  statLabel: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#A3A3A3",
    letterSpacing: -0.52,
    lineHeight: 18,
  },
  profileCompleteText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#FC5F67",
    textAlign: "center",
    letterSpacing: -0.24,
  },
});
