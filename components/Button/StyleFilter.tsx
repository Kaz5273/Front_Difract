import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Fonts } from "@/constants/theme";
import type { MusicStyle } from "@/services/api/types";
import { useGuestGuard } from "@/hooks/use-guest-guard";

interface StyleFilterProps {
  styles: MusicStyle[];
  selectedStyleId: number | null; // null = "Tout" sélectionné
  onSelectStyle: (styleId: number | null) => void;
  showAllOption?: boolean;
}

export const StyleFilter: React.FC<StyleFilterProps> = ({
  styles,
  selectedStyleId,
  onSelectStyle,
  showAllOption = true,
}) => {
  const isAllSelected = selectedStyleId === null;
   

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={filterStyles.container}
    >
      {/* Option "Tout" */}
      {showAllOption && (
        <Pressable
          style={[
            filterStyles.badge,
            isAllSelected && filterStyles.badgeActive,
          ]}
          onPress={() => onSelectStyle(null)}
        >
          <Text
            style={[
              filterStyles.badgeText,
              isAllSelected && filterStyles.badgeTextActive,
            ]}
          >
            Tout
          </Text>
        </Pressable>
      )}

      {/* Styles musicaux */}
      {styles.map((style) => {
        const isSelected = selectedStyleId === style.id;
        return (
          <Pressable
            key={style.id}
            style={[filterStyles.badge, isSelected && filterStyles.badgeActive]}
            onPress={() => onSelectStyle(style.id)}
          >
            <Text
              style={[
                filterStyles.badgeText,
                isSelected && filterStyles.badgeTextActive,
              ]}
            >
              {style.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const filterStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
  },
  badge: {
    padding: 10,
    backgroundColor: "#2c2c2c",
    borderRadius: 20,
    marginRight: 8,
  },
  badgeActive: {
    backgroundColor: "#FC5F67",
  },
  badgeText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: "#818181",
    textAlign: "center",
    letterSpacing: -0.44,
  },
  badgeTextActive: {
    color: "#FFFFFF",
  },
});

export default StyleFilter;
