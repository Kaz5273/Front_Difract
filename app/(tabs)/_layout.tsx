import { HapticTab } from "@/components/haptic-tab";
import IconVote from "@/components/icons/iconVote";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import { Calendar, Home, Search, Tickets } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "dark"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#121212", // ✅ Couleur de fond sombre
          borderColor: "#121212",
          borderRadius: 50, // ✅ Arrondi complet
          height: 70,
          position: "absolute",
          // ✅ Positionnement et centrage
          // Position flottante
          bottom: 30, // Distance du bas
          left: 10, // Marge gauche
          right: 10, // Marge droite
          marginHorizontal: 10, // Centrage horizontal

          // Padding interne
          paddingBottom: 5,
          paddingTop: 5,
          paddingHorizontal: 12,
        },
        tabBarInactiveTintColor: "#FFFFFF",

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: 60,
          paddingVertical: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vote"
        options={{
          title: "Vote",
          tabBarIcon: ({ color }) => <IconVote color={color} />,
        }}
      />
      <Tabs.Screen
        name="evenements"
        options={{
          title: "Événements",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Recherche",
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: "Mes Billets",
          tabBarIcon: ({ color }) => <Tickets size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
