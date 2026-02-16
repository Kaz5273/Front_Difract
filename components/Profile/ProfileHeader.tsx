import React from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, UserPlus, Settings } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface ProfileHeaderProps {
  title?: string;
  showNotificationBadge?: boolean;
  showActions?: boolean;
  onAddFriend?: () => void;
  onSettings?: () => void;
}

export function ProfileHeader({
  title = "Mon compte",
  showNotificationBadge = true,
  showActions = true,
  onAddFriend,
  onSettings,
}: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Titre centré (position absolue pour centrage parfait) */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Bouton retour */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={32} color="#FFFFFF" />
      </Pressable>

      {/* Actions droite - conditionnellement affichées */}
      {showActions ? (
        <View style={styles.headerActions}>
          <Pressable onPress={onAddFriend} style={styles.headerIconButton}>
            <UserPlus size={24} color="#FFFFFF" strokeWidth={2} />
            {/* Badge notification rouge */}
            {showNotificationBadge && <View style={styles.notificationBadge} />}
          </Pressable>
          <Pressable onPress={onSettings} style={styles.headerIconButton}>
            <Settings size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <View style={styles.headerPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#080808",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 8,
    height: 50,
    position: "relative",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    zIndex: 1,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FC5F67",
  },
  headerPlaceholder: {
    width: 32,
    height: 32,
  },
});
