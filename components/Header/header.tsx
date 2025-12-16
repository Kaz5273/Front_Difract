import { useRouter } from "expo-router";
import { CircleUserRound, Sparkle, Bell, Heart } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThemedText } from "../themed-text";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightComponent?: React.ReactNode;
}

export function Header({
  title,
  showBackButton = false,
  showMenuButton = false,
  onBackPress,
  onMenuPress,
  rightComponent,
}: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Bouton retour */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <Pressable onPress={handleBackPress} style={styles.iconButton}>
            <CircleUserRound size={30} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* Titre */}
      <View style={styles.centerSection}>
        {title && <ThemedText type="header">{title}</ThemedText>}
      </View>

      {/* Section droite */}
      <View style={styles.rightSection}>
        <Pressable onPress={onMenuPress} style={styles.iconButton}>
          <Heart size={24} color="#FFFFFF" />
        </Pressable>
        {showMenuButton && (
          <Pressable onPress={onMenuPress} style={styles.iconButton}>
            <Sparkle size={24} color="#FFFFFF" />
          </Pressable>
        )}
        <Pressable onPress={onMenuPress} style={styles.iconButton}>
          <Bell size={24} color="#FFFFFF" />
        </Pressable>
        {rightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 50,
    paddingHorizontal: 10,
    backgroundColor: "#000000",
  },
  leftSection: {
    flex: 0.5,
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 20,
  },
  centerSection: {
    flex: 3,
    alignItems: "flex-start",
  },
  rightSection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    paddingRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
});
