import React, { useEffect } from "react";
import { StyleSheet, Pressable, View, ActivityIndicator, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import { ChevronLeft } from "lucide-react-native";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ImageCarousel } from "@/components/Artist/ImageCarousel";
import { ArtistAbout } from "@/components/Artist/ArtistAbout";
import { MusicPlayer } from "@/components/Artist/MusicPlayer";
import { VideoClip } from "@/components/Artist/VideoClip";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import { StyleBadges } from "@/components/Badges/StyleBadges";
import { Fonts } from "@/constants/theme";
import { useGuestGuard } from "@/hooks/use-guest-guard";
import { GuestActionModal } from "@/components/GuestActionModal";
import { useArtistDetail } from "@/hooks/use-artists";
import { useAuthStore } from "@/store/auth-store";
import { apiClient, getMediaUrl } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { Artist } from "@/services/api/types";

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const artistId = Number(id);
  const { artist, isLoading, error, fetchDetail } = useArtistDetail(artistId);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const { showModal, setShowModal, guard } = useGuestGuard();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!artistId) return;
    fetchDetail();
  }, [artistId]);

  useEffect(() => {
    if (!isAuthenticated || !artistId) return;
    apiClient.get<Artist[]>(ENDPOINTS.MY_FAVORITE_ARTISTS)
      .then((res) => setIsFavorite(res.data.some((a) => a.id === artistId)))
      .catch(() => {});
  }, [isAuthenticated, artistId]);

  const handleFavoriteToggle = async () => {
    if (isFavorite) {
      setIsFavorite(false);
      try {
        await apiClient.delete(ENDPOINTS.FAVORITE_ARTIST(artistId));
      } catch {
        setIsFavorite(true);
      }
    } else {
      setIsFavorite(true);
      try {
        await apiClient.post(ENDPOINTS.FAVORITE_ARTIST(artistId));
      } catch {
        setIsFavorite(false);
      }
    }
  };

  const profileMedia = artist?.media?.find((m) => m.role === 'PROFILE' && m.is_primary);
  const artistImageUrl = profileMedia ? getMediaUrl(profileMedia) || '' : '';

  const galleryImages = artist?.media
    ?.filter((m) => m.role === 'GALLERY' || m.role === 'PROFILE')
    .map((m) => getMediaUrl(m) || '')
    .filter(Boolean) ?? [];

  const tracks = artist?.media
    ?.filter((m) => m.role === 'TRACK')
    .map((m, i) => ({
      id: String(m.id),
      title: m.title || `Track ${i + 1}`,
      duration: '',
      url: getMediaUrl(m) || undefined,
    })) ?? [];

  const introVideo = artist?.media?.find((m) => m.role === 'INTRO_VIDEO');
  const introVideoUrl = introVideo ? getMediaUrl(introVideo) : undefined;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FC5F67" />
      </View>
    );
  }

  if (error || !artist) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Artiste introuvable'}</Text>
        <Pressable onPress={() => router.back()} style={styles.backButtonFallback}>
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Bouton Retour */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <BlurView intensity={15} style={styles.backButtonBlur}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </BlurView>
      </Pressable>

      <ParallaxScrollView
        headerBackgroundColor={{ light: "#111111", dark: "#111111" }}
        showsVerticalScrollIndicator={false}
        headerImage={
          <ImageCarousel
            images={galleryImages}
            isFavorite={isFavorite}
            onFavoritePress={() => guard(handleFavoriteToggle)}
          />
        }
      >
        <ThemedView style={styles.contentContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.styleTitle}>{artist.name}</ThemedText>
          </ThemedView>

          {artist.styles && artist.styles.length > 0 && (
            <StyleBadges styles={artist.styles.map((s) => s.name)} maxVisible={5} />
          )}

          {tracks.length > 0 && (
            <MusicPlayer
              tracks={tracks}
              artistName={artist.name}
              artistImage={artistImageUrl || galleryImages[0] || ''}
              onBeforePlay={guard}
            />
          )}

          {artist.bio ? (
            <ArtistAbout description={artist.bio} />
          ) : null}

          {introVideoUrl && (
            <VideoClip
              videoUrl={introVideoUrl}
              thumbnailUrl=""
              videoType="local"
              onBeforePlay={guard}
            />
          )}
        </ThemedView>
      </ParallaxScrollView>

      <GlobalAudioPlayer forceShow={true} bottomPosition={25} />
      <GuestActionModal visible={showModal} onClose={() => setShowModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#7B7B7B",
    textAlign: "center",
  },
  backButtonFallback: {
    backgroundColor: "#FC5F67",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#000000",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 50,
    overflow: "hidden",
    zIndex: 10,
  },
  backButtonBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 2,
  },
  contentContainer: {
    gap: 16,
    backgroundColor: "#111111",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  styleTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 25,
    lineHeight: 32,
  },
});
