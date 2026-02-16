import React from "react";
import { StyleSheet, Pressable, View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UserPlus } from "lucide-react-native";
import { Fonts } from "@/constants/theme";

interface FriendsCardProps {
  onAddFriends?: () => void;
}

export function FriendsCard({ onAddFriends }: FriendsCardProps) {
  return (
    <LinearGradient
      colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.04)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.title}>Suivez tous vos ami.e.s</Text>
      <Text style={styles.description}>
        Ajouter vos ami.e.s pour voir pour qui ils votent, leurs dernière
        photos, et à quelle événement ils veulent se rendre !
      </Text>

      {/* Grille d'avatars */}
      <View style={styles.avatarGrid}>
        <View style={styles.avatarRow}>
          {[1, 2, 3].map((i) => (
            <Image
              key={`row1-${i}`}
              source={{ uri: `https://i.pravatar.cc/150?img=${i + 10}` }}
              style={styles.avatar}
            />
          ))}
        </View>
        <View style={styles.avatarRow}>
          {[4, 5, 6, 7].map((i) => (
            <Image
              key={`row2-${i}`}
              source={{ uri: `https://i.pravatar.cc/150?img=${i + 10}` }}
              style={styles.avatar}
            />
          ))}
        </View>
      </View>

      <Text style={styles.usersCount}>
        +4000 utilisateurs sur la plateforme !
      </Text>

      <Pressable style={styles.addButton} onPress={onAddFriends}>
        <UserPlus size={19} color="#000000" strokeWidth={2} />
        <Text style={styles.addButtonText}>Ajouter des ami.e.s</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 35,
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.6,
  },
  description: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    letterSpacing: -0.24,
    marginBottom: 10,
  },
  avatarGrid: {
    gap: 5,
    paddingVertical: 7,
    alignItems: "center",
  },
  avatarRow: {
    flexDirection: "row",
    gap: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  usersCount: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.48,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  addButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#000000",
    letterSpacing: -0.56,
  },
});
