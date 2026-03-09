import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  Dimensions,
  Pressable,
  Image,
  Keyboard,
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
import { StyleBadges } from "@/components/Badges/StyleBadges";
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
import { X } from "lucide-react-native";
import { StyleFilter } from "@/components/Button/StyleFilter";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
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

  const closeSearch = useCallback(() => {
    setIsSearchActive(false);
    setSearchQuery("");
    Keyboard.dismiss();
  }, []);

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

  // Artistes filtrés pour l'overlay (recherche seulement, sans filtre style)
  const searchOverlayArtists = useMemo(() => {
    if (!searchQuery) return [];
    return artists.filter((a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artists, searchQuery]);

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

  const renderSearchResultRow = (artist: Artist) => {
    const imageUrl = getArtistImageUrl(artist);
    const artistStyles = getArtistStyles(artist);
    return (
      <Pressable
        key={artist.id}
        style={overlayStyles.resultRow}
        onPress={() => {
          closeSearch();
          router.push(`/artist/${artist.id}`);
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={overlayStyles.resultImage}
          />
        ) : (
          <View style={overlayStyles.resultImagePlaceholder} />
        )}
        <Text style={overlayStyles.resultName} numberOfLines={1}>
          {artist.name}
        </Text>
        <View style={overlayStyles.resultSpacer} />
        {artistStyles.length > 0 && (
          <StyleBadges styles={artistStyles} maxVisible={1} />
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Header title="Recherche" showBackButton showMenuButton />

      <View style={styles.contentArea}>
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
                onFocus={() => setIsSearchActive(true)}
              />
            </View>
            <FilterBadge
              count={selectedStyleIds.length}
              onPress={() => setStyleFilterVisible(true)}
            />
          </View>
        </View>

        {/* Slider horizontal des styles */}
        <StyleFilter
          styles={musicStyles}
          selectedStyleId={selectedStyleIds.length === 1 ? selectedStyleIds[0] : null}
          onSelectStyle={(id) => setSelectedStyleIds(id !== null ? [id] : [])}
        />

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
          <>
            {filteredArtists.length === 0 ? (
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
        ) : (
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

      {/* Search overlay */}
      {isSearchActive && (
        <View style={overlayStyles.overlay}>
          {/* Search bar row with close button */}
          <View style={overlayStyles.searchRow}>
            <Pressable style={overlayStyles.closeButton} onPress={closeSearch}>
              <X size={18} color="#FFFFFF" strokeWidth={2} />
            </Pressable>
            <View style={overlayStyles.searchBarFlex}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher..."
                autoFocus
              />
            </View>
          </View>

          {/* Results */}
          <ScrollView
            style={overlayStyles.resultsList}
            contentContainerStyle={overlayStyles.resultsContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {searchQuery.length === 0 ? null : searchOverlayArtists.length === 0 ? (
              <View style={overlayStyles.emptyContainer}>
                <Text style={overlayStyles.emptyText}>Aucun artiste trouvé</Text>
              </View>
            ) : (
              searchOverlayArtists.map((a) => renderSearchResultRow(a))
            )}
          </ScrollView>
        </View>
      )}
      </View>

      <GuestActionModal visible={showModal} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  contentArea: {
    flex: 1,
    position: "relative",
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
    fontFamily: Fonts.regular,
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

const overlayStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#111111",
    paddingTop: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 4,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBarFlex: {
    flex: 1,
  },
  resultsList: {
    flex: 1,
    marginTop: 10,
  },
  resultsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 130,
    gap: 14,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    gap: 16,
  },
  resultImage: {
    width: 52,
    height: 52,
    borderRadius: 15,
  },
  resultImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#212121",
  },
  resultName: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.42,
    flexShrink: 1,
  },
  resultSpacer: {
    flex: 1,
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
});
