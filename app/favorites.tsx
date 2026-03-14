import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { ArtistCard } from "@/components/Artist/ArtistCard";
import { Header } from "@/components/Header/header";
import { FaqSection } from "@/components/FaqSection";
import { Fonts } from "@/constants/theme";
import { apiClient, getMediaUrl } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { Artist } from "@/services/api/types";
import { useFavoritesStore } from "@/store/favorites-store";

export default function FavoritesScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.floor((screenWidth - 32 - 16) / 2); // 16px padding × 2 + 16px gap

  const [favorites, setFavorites] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<Artist[]>(ENDPOINTS.MY_FAVORITE_ARTISTS);
      setFavorites(res.data);
    } catch {
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const { remove: removeFavorite } = useFavoritesStore();

  const handleUnfavorite = async (artistId: number) => {
    setFavorites((prev) => prev.filter((a) => a.id !== artistId));
    await removeFavorite(String(artistId));
  };

  const renderItem = ({ item }: { item: Artist }) => (
    <ArtistCard
      id={String(item.id)}
      name={item.name}
      subtitle={item.city || ""}
      location={item.city || ""}
      imageUrl={(() => {
          const profileMedia = item.media?.find(m => m.role === 'PROFILE' && m.is_primary) ?? item.media?.find(m => m.role === 'PROFILE');
          return (profileMedia ? getMediaUrl(profileMedia) : null) || item.media_url || '';
        })()}
      styles={item.styles?.map((s) => s.name) ?? []}
      isFavorite
      showPlayButton={false}
      width={cardWidth}
      onPress={() => router.push(`/artist/${item.id}`)}
      onFavoritePress={() => handleUnfavorite(item.id)}
    />
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Aucun artiste en favoris pour l'instant.</Text>
    </View>
  );

  const ListFooter = () => <FaqSection />;

  return (
    <View style={styles.container}>
      <Header
        title="Vos stars"
        variant="detail"
        showSearchButton
        onSearchPress={() => router.push("/(tabs)/search")}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FC5F67" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  row: {
    gap: 16,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 8,
  },
  footerGrey: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#959595",
    letterSpacing: -0.24,
    textAlign: "center",
  },
  footerWhite: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    textAlign: "center",
  },
});
