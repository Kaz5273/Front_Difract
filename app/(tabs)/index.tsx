import { Header } from "@/components/Header/header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/use-auth";
import { locationService } from "@/services/location/location.service";
import { Fonts } from "@/constants/theme";
import { ArtistCard } from "@/components/Artist/ArtistCard";
import { useState, useEffect } from "react";
import { EventCard } from "@/components/Event/EventCard";
import { LocationBadge } from "@/components/Badges/LocationBadge";
import { LocationSearchModal } from "@/components/Modals/LocationSearchModal";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useGuestGuard } from "@/hooks/use-guest-guard";
import { GuestActionModal } from "@/components/GuestActionModal";
import { useArtists } from "@/hooks/use-artists";
import { useEvents } from "@/hooks/use-events";
import { Artist } from "@/services/api/types";
import { getMediaUrl } from "@/services/api/client";
import { artistsService } from "@/services/artists/artists.service";
import { useFavoritesStore } from "@/store/favorites-store";

function formatTimeRange(eventDate: string, endTime?: string | null): string {
  const start = new Date(eventDate);
  const startH = start.getHours().toString().padStart(2, "0");
  const startM = start.getMinutes().toString().padStart(2, "0");
  if (!endTime) return `${startH}h${startM}`;
  const end = new Date(endTime);
  const endH = end.getHours().toString().padStart(2, "0");
  const endM = end.getMinutes().toString().padStart(2, "0");
  return `${startH}h${startM} à ${endH}h${endM}`;
}

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const { currentTrack, isPlaying, play, pause } = useAudioPlayer();
  const [displayCity, setDisplayCity] = useState<string>("Ma localisation");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { showModal, setShowModal, guard } = useGuestGuard();
  const { artists, isLoading: artistsLoading, fetchArtists } = useArtists();
  const { events, isLoading: eventsLoading, fetchUpcoming } = useEvents();

  const { load: loadFavorites, add: addFavorite, remove: removeFavorite, isFavorite } = useFavoritesStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.city) {
      setDisplayCity(user.city);
      return;
    }
    (async () => {
      let coords = await locationService.getCachedLocation();
      if (!coords) {
        const active = await locationService.isLocationActive();
        if (active) {
          coords = await locationService.getCurrentPosition();
          if (coords) locationService.updateLocationInBackground();
        }
      }
      if (!coords) return;
      const city = await locationService.getCityFromCoords(coords.latitude, coords.longitude);
      if (city) setDisplayCity(city);
    })();
  }, [user?.city, isAuthenticated]);

  // Charger les données publiques (artistes + events) pour tous les utilisateurs
  useEffect(() => {
    fetchArtists();
    fetchUpcoming(5);
  }, []);

  // Charger les favoris uniquement si connecté
  useEffect(() => {
    if (!isAuthenticated) return;
    loadFavorites();
  }, [isAuthenticated]);

  const toggleFavorite = async (artistId: string) => {
    if (isFavorite(artistId)) {
      await removeFavorite(artistId);
    } else {
      await addFavorite(artistId);
    }
  };

  const getArtistTrack = (artist: Artist) => {
    return artist.media?.find((m) => m.role === 'TRACK' && m.is_primary) || artist.media?.find((m) => m.role === 'TRACK');
  };

  const getTrackName = (artist: Artist): string => {
    const track = getArtistTrack(artist);
    if (!track) return artist.city || '';
    if (track.title) return track.title;
    const raw = (track.path || track.url || '').split('/').pop() || '';
    return raw.replace(/\.[^.]+$/, '') || artist.city || '';
  };

  const handlePlayArtist = async (artist: Artist) => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    const trackId = `track-${artist.id}`;
    if (currentTrack?.id === trackId && isPlaying) {
      pause();
      return;
    }

    // Si le listing a déjà retourné les media avec l'URL, on joue directement
    const track = getArtistTrack(artist);
    if (track?.url) {
      play({
        id: trackId,
        title: getTrackName(artist),
        artistName: artist.name,
        artistImage: artist.media_url || '',
        duration: '',
        url: track.url,
      });
      return;
    }

    // Sinon on fetch le détail pour récupérer l'URL de la track
    try {
      const detail = await artistsService.getDetail(artist.id);
      const detailTrack = detail.media?.find((m) => m.role === 'TRACK' && m.is_primary)
        || detail.media?.find((m) => m.role === 'TRACK');
      const url = detailTrack ? getMediaUrl(detailTrack) || detailTrack.url : undefined;
      // Pas d'URL = visiteur non connecté (tracks masquées par l'API) → afficher le modal
      if (!url) {
        setShowModal(true);
        return;
      }
      play({
        id: trackId,
        title: detailTrack!.title || artist.name,
        artistName: artist.name,
        artistImage: artist.media_url || '',
        duration: '',
        url,
      });
    } catch {
      console.warn('Impossible de charger la track de', artist.name);
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <Header title="Accueil" showBackButton showMenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.locationContainer}>
          <LocationBadge
            location={displayCity}
            onPress={() => setShowLocationModal(true)}
          />
        </View>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="h1">Découvrez des artistes</ThemedText>
        </ThemedView>

        {/* Section Artistes */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.artistsSection}
        >
          {artistsLoading && (
            <ActivityIndicator size="small" color="#FC5F67" style={{ marginHorizontal: 20 }} />
          )}
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              id={String(artist.id)}
              name={artist.name}
              subtitle={getTrackName(artist)}
              location={artist.city || ''}
              imageUrl={(() => {
                const profileMedia = artist.media?.find((m) => m.role === 'PROFILE' && m.is_primary);
                return profileMedia ? getMediaUrl(profileMedia) || '' : artist.media_url || '';
              })()}
              styles={artist.styles?.map((s) => s.name) || []}
              trackId={`track-${artist.id}`}
              isFavorite={isFavorite(String(artist.id))}
              onPress={() => router.push(`/artist/${artist.id}`)}
              onFavoritePress={() => guard(() => toggleFavorite(String(artist.id)))}
              onPlayPress={() => handlePlayArtist(artist)}
            />
          ))}
        </ScrollView>

        <ThemedView style={styles.titleContainer}>
          <ThemedText type="h1">
            Les événements {"\n"}proche de chez vous
          </ThemedText>
        </ThemedView>

        {/* Section Événements */}
        {eventsLoading ? (
          <ActivityIndicator size="small" color="#FC5F67" style={{ marginHorizontal: 20 }} />
        ) : events.length === 0 ? (
          <View style={styles.eventEmptyContainer}>
            <Text style={styles.eventEmptyTitle}>Les événements arrivent bientôt !</Text>
            <Text style={styles.eventEmptySubtitle}>Revenez nous voir très vite.</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventSection}
          >
            {events.map((event) => (
              <View key={event.id} style={styles.eventCardWrapper}>
                <EventCard
                  id={event.id}
                  title={event.title}
                  location={event.location}
                  distance={event.distance_km ? `${Math.round(event.distance_km)} km` : undefined}
                  eventDate={event.event_date}
                  timeRange={formatTimeRange(event.event_date, event.end_time)}
                  price={event.price ? parseFloat(event.price) : 0}
                  imageUrl={event.image_url || ""}
                  styles={event.styles?.map((s) => s.name) || []}
                  earlyAccess={false}
                  onPress={() => router.push(`/event/${event.id}`)}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <GuestActionModal visible={showModal} onClose={() => setShowModal(false)} />
      <LocationSearchModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={(city) => setDisplayCity(city)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: "#111111",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 10,
    gap: 16,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  artistsSection: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  eventSection: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  eventCardWrapper: {
    width: 355,
  },
  locationContainer: {
    flexDirection: "row",
    alignSelf: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  eventEmptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: "center",
    gap: 8,
  },
  eventEmptyTitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
  eventEmptySubtitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#7B7B7B",
    letterSpacing: -0.26,
  },
});
