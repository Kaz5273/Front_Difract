import { HapticTab } from '@/components/haptic-tab';
import IconVote from '@/components/icons/iconVote';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import { Calendar, Home, Search } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#000000',
        },
        tabBarInactiveTintColor: '#FFFFFF',
      }}>
     
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
       <Tabs.Screen
        name="Vote"
        options={{
          title: 'Vote',
          tabBarIcon: ({ color }) => <IconVote color={color} />,

        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Événements',
          tabBarIcon: ({ color }) => <Calendar size={24}  color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore2"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color }) => <Search size={24}  color={color} />,
        }}
      />
    </Tabs>
  );
}
