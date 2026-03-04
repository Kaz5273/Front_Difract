import React from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, UserPlus, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {/* Bouton retour */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={32} color="#FFFFFF" />
      </Pressable>

      {/* Titre centré */}
      <Text style={styles.headerTitle}>{title}</Text>

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
    backgroundColor: "#181818",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 10,
    position: "relative",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
    lineHeight: 40,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 8,
    zIndex: 1,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 8,
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
