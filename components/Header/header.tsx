import { useRouter } from "expo-router";
import {
  Bell,
  ChevronLeft,
  CircleUserRound,
  Heart,
  Search,
  Star,
} from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

type HeaderVariant = "default" | "detail";

interface HeaderProps {
  title?: string;
  variant?: HeaderVariant;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showSearchButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  rightComponent?: React.ReactNode;
}

export function Header({
  title,
  variant = "default",
  showBackButton = false,
  showMenuButton = false,
  showSearchButton = false,
  onBackPress,
  onMenuPress,
  onSearchPress,
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

  // Mode détail (avec bouton retour + titre + recherche)
  if (variant === "detail") {
    return (
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Pressable onPress={handleBackPress} style={styles.iconButton}>
            <ChevronLeft size={32} color="#FFFFFF" />
          </Pressable>
          {title && <ThemedText type="header">{title}</ThemedText>}
        </View>

        <View style={styles.rightSection}>
          {showSearchButton && (
            <Pressable onPress={onSearchPress} style={styles.iconButton}>
              <Search size={24} color="#FFFFFF" />
            </Pressable>
          )}
          {rightComponent}
        </View>
      </View>
    );
  }

  // Mode par défaut
  return (
    <View style={styles.container}>
      {/* Bouton profile */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <Pressable
            onPress={() => router.push("/profile")}
            style={styles.iconButton}
          >
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
        <Pressable
          onPress={() => router.push("/favorite-events")}
          style={styles.iconButton}
        >
          <Heart size={24} color="#FFFFFF" />
        </Pressable>
        {showMenuButton && (
          <Pressable
            onPress={() => router.push("/favorites")}
            style={styles.iconButton}
          >
            <Star size={24} color="#FFFFFF" />
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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
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
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
});
