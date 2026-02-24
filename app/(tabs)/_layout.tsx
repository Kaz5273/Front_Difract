import { HapticTab } from "@/components/haptic-tab";
import IconVote from "@/components/icons/iconVote";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Home, Search, Tickets } from "lucide-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      {/* Gradient juste derrière la navbar */}
      <LinearGradient
        colors={["transparent", "#000000"]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "dark"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: "#121212",
            borderColor: "#121212",
            borderRadius: 50,
            height: 70,
            position: "absolute",
            bottom: 30,
            left: 10,
            right: 10,
            marginHorizontal: 10,
            paddingBottom: 5,
            paddingTop: 5,
            paddingHorizontal: 12,
            zIndex: 10,
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
          name="votes"
          options={{
            title: "Vote",
            tabBarIcon: ({ color }) => <IconVote color={color} />,
          }}
        />
        <Tabs.Screen
          name="events"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
    pointerEvents: "none",
  },
});
