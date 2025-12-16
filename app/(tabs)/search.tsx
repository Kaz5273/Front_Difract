import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Header } from "@/components/Header/header";
import { SearchBar } from "@/components/Search/SearchBar";
import { StyleFilter } from "@/components/Button/StyleFilter";
import { useStyles } from "@/hooks/useStyle";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const { styles: musicStyles, isLoading } = useStyles();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Recherche" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.tabContainer}>
          <View style={styles.searchBarWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Artistes, morceaux, lieux, ect."
            />
          </View>
          <StyleFilter
            styles={musicStyles}
            selectedStyleId={selectedStyle}
            onSelectStyle={setSelectedStyle}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 130,
    gap: 16,
  },
  tabContainer: {
    gap: 16,
  },
  searchBarWrapper: {
    paddingHorizontal: 20,
  },
});
