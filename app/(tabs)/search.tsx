import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  Dimensions,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRID_PADDING = 20;
const GRID_GAP = 12;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2);
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header/header";
import { SearchBar } from "@/components/Search/SearchBar";
import FilterBadge from "@/components/Badges/FilterBadge";
import { StyleFilterModal } from "@/components/Modals/StyleFilterModal";
import { ArtistCard } from "@/components/Artist/ArtistCard";
import { useStyles } from "@/hooks/useStyle";
import { router } from "expo-router";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useGuestGuard } from "@/hooks/use-guest-guard";
import { GuestActionModal } from "@/components/GuestActionModal";
import { Fonts } from "@/constants/theme";
import { useArtists } from "@/hooks/use-artists";
import { Artist } from "@/services/api/types";
import { getMediaUrl } from "@/services/api/client";
import { artistsService } from "@/services/artists/artists.service";
import { useFavoritesStore } from "@/store/favorites-store";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyleIds, setSelectedStyleIds] = useState<number[]>([]);
  const [styleFilterVisible, setStyleFilterVisible] = useState(false);
  const { load: loadFavorites, add: addFavorite, remove: removeFavorite, isFavorite } = useFavoritesStore();
  const { styles: musicStyles } = useStyles();
  const { currentTrack, isPlaying, play, pause } = useAudioPlayer();
  const { showModal, setShowModal, guard } = useGuestGuard();
  const { artists, isLoading, fetchArtists } = useArtists();

  useEffect(() => { fetchArtists(); }, []);
  useEffect(() => { loadFavorites(); }, []);

  const getArtistImageUrl = (artist: Artist): string => {
    const profileMedia = artist.media?.find((m) => m.role === "PROFILE" && m.is_primary)
      || artist.media?.find((m) => m.role === "PROFILE");
    if (profileMedia) return getMediaUrl(profileMedia) || artist.media_url || "";
    return artist.media_url || "";
  };

  const getArtistStyles = (artist: Artist): string[] => {
    return artist.styles?.map((s) => s.name) || [];
  };

  const getTrackName = (artist: Artist): string => {
    const track = artist.media?.find((m) => m.role === "TRACK" && m.is_primary)
      || artist.media?.find((m) => m.role === "TRACK");
    if (!track) return artist.bio || artist.city || "";
    if (track.title) return track.title;
    const raw = (track.path || track.url || "").split("/").pop() || "";
    return raw.replace(/\.[^.]+$/, "") || artist.city || "";
  };

  const toggleFavorite = async (artistId: string) => {
    if (isFavorite(artistId)) {
      await removeFavorite(artistId);
    } else {
      await addFavorite(artistId);
    }
  };

  const handlePlayArtist = async (artist: Artist) => {
    const trackId = `track-${artist.id}`;
    if (currentTrack?.id === trackId && isPlaying) { pause(); return; }
    const track = artist.media?.find((m) => m.role === "TRACK" && m.is_primary)
      || artist.media?.find((m) => m.role === "TRACK");
    if (track?.url) {
      play({ id: trackId, title: artist.name, artistName: artist.name, artistImage: getArtistImageUrl(artist), duration: "", url: track.url });
      return;
    }
    try {
      const detail = await artistsService.getDetail(artist.id);
      const detailTrack = detail.media?.find((m) => m.role === "TRACK" && m.is_primary)
        || detail.media?.find((m) => m.role === "TRACK");
      const url = detailTrack ? getMediaUrl(detailTrack) || detailTrack.url : undefined;
      if (!url) { setShowModal(true); return; }
      play({ id: trackId, title: artist.name, artistName: artist.name, artistImage: getArtistImageUrl(artist), duration: "", url });
    } catch {
      console.warn("Impossible de charger la track de", artist.name);
    }
  };

  // Artistes filtrés par recherche + styles
  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      const matchesSearch = !searchQuery
        || a.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStyle = selectedStyleIds.length === 0
        || a.styles?.some((s) => selectedStyleIds.includes(s.id));
      return matchesSearch && matchesStyle;
    });
  }, [artists, searchQuery, selectedStyleIds]);

  // Groupement par style sélectionné (quand filtres actifs)
  const groupedBySelectedStyles = useMemo(() => {
    if (selectedStyleIds.length === 0) return [];
    return selectedStyleIds
      .map((styleId) => {
        const styleName = musicStyles.find((s) => s.id === styleId)?.name || "";
        const styleArtists = filteredArtists.filter((a) =>
          a.styles?.some((s) => s.id === styleId)
        );
        return { styleId, styleName, artists: styleArtists };
      })
      .filter((g) => g.artists.length > 0);
  }, [selectedStyleIds, filteredArtists, musicStyles]);

  // Groupement par style primaire (vue par défaut, sans filtre)
  const groupedByStyle = useMemo(() => {
    if (selectedStyleIds.length > 0) return [];
    const groups: { styleId: number; styleName: string; artists: Artist[] }[] = [];
    const seen = new Set<number>();
    filteredArtists.forEach((artist) => {
      const primary = artist.styles?.find((s) => s.pivot?.is_primary) || artist.styles?.[0];
      if (!primary) return;
      if (!seen.has(primary.id)) {
        seen.add(primary.id);
        groups.push({ styleId: primary.id, styleName: primary.name, artists: [] });
      }
      groups.find((g) => g.styleId === primary.id)?.artists.push(artist);
    });
    return groups;
  }, [filteredArtists, selectedStyleIds]);

  const isSearching = !!searchQuery;
  const isStyleFiltering = selectedStyleIds.length > 0;

  const renderArtistCard = (artist: Artist, gridMode: boolean = false) => (
    <ArtistCard
      key={artist.id}
      id={String(artist.id)}
      name={artist.name}
      subtitle={getTrackName(artist)}
      location={artist.city || ""}
      imageUrl={getArtistImageUrl(artist)}
      styles={getArtistStyles(artist)}
      trackId={`track-${artist.id}`}
      isFavorite={isFavorite(String(artist.id))}
      width={gridMode ? CARD_WIDTH : 180}
      onPress={() => router.push(`/artist/${artist.id}`)}
      onFavoritePress={() => guard(() => toggleFavorite(String(artist.id)))}
      onPlayPress={() => guard(() => handlePlayArtist(artist))}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Header title="Recherche" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar + FilterBadge */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchRow}>
            <View style={styles.searchBarFlex}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher..."
              />
            </View>
            <FilterBadge
              count={selectedStyleIds.length}
              onPress={() => setStyleFilterVisible(true)}
            />
          </View>
        </View>

        <StyleFilterModal
          visible={styleFilterVisible}
          onClose={() => setStyleFilterVisible(false)}
          styles={musicStyles}
          selectedStyleIds={selectedStyleIds}
          onSelectStyles={setSelectedStyleIds}
        />

        {isLoading ? (
          <ActivityIndicator size="small" color="#FC5F67" style={styles.loader} />
        ) : isStyleFiltering ? (
          /* Résultats groupés par style sélectionné */
          <>
            {isSearching && filteredArtists.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun artiste trouvé</Text>
              </View>
            ) : groupedBySelectedStyles.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun artiste pour ces styles</Text>
              </View>
            ) : (
              groupedBySelectedStyles.map((group) => (
                <View key={group.styleId} style={styles.section}>
                  <Text style={styles.sectionTitle}>{group.styleName}</Text>
                  <View style={styles.flatGrid}>
                    {group.artists.map((a) => renderArtistCard(a, true))}
                  </View>
                </View>
              ))
            )}
          </>
        ) : isSearching ? (
          /* Résultats plats quand recherche textuelle uniquement */
          <>
            {filteredArtists.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun artiste trouvé</Text>
              </View>
            ) : (
              <View style={styles.flatGrid}>
                {filteredArtists.map((a) => renderArtistCard(a, true))}
              </View>
            )}
          </>
        ) : (
          /* Vue par défaut — groupée par style primaire */
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nouveaux sur la plateforme</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {filteredArtists.map((a) => renderArtistCard(a))}
              </ScrollView>
            </View>

            {groupedByStyle.map((group) => (
              <View key={group.styleId} style={styles.section}>
                <Text style={styles.sectionTitle}>{group.styleName}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {group.artists.map((a) => renderArtistCard(a))}
                </ScrollView>
              </View>
            ))}
          </>
        )}

        {/* FAQ */}
        <View style={styles.faqContainer}>
          <Text style={styles.faqText}>Vous ne trouvez pas votre bonheur ? Des questions ?</Text>
          <Text style={styles.faqLink}>Rendez-vous dans notre FAQ.</Text>
        </View>
      </ScrollView>

      <GuestActionModal visible={showModal} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 130,
    gap: 24,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBarFlex: {
    flex: 1,
  },
  searchBarWrapper: {
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 40,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: -0.4,
    paddingHorizontal: 20,
  },
  horizontalList: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  flatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#7B7B7B",
    letterSpacing: -0.32,
  },
  faqContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 4,
  },
  faqText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    letterSpacing: -0.26,
  },
  faqLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#FC5F67",
    textAlign: "center",
    letterSpacing: -0.26,
  },
});
