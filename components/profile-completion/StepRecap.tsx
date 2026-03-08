import { Fonts } from "@/constants/theme";
import { ImageIcon, Pencil, Play } from "lucide-react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import type { TrackItem } from "./StepAdditionalTracks";
import type { SocialLinks } from "./StepSocialLinks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAROUSEL_WIDTH = SCREEN_WIDTH - 30;
const CAROUSEL_HEIGHT = 250;
const MAX_PHOTOS = 5;

interface StepRecapProps {
  photos: ImagePickerAsset[];
  tracks: TrackItem[];
  socialLinks: SocialLinks;
  onEditPhotos: () => void;
  onEditTracks: () => void;
  onEditSocialLinks: () => void;
}

export function StepRecap({
  photos,
  tracks,
  socialLinks,
  onEditPhotos,
  onEditTracks,
  onEditSocialLinks,
}: StepRecapProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const filledLinks = Object.entries(socialLinks).filter(
    ([, url]) => url.length > 0
  );

  return (
    <View style={styles.container}>
      {/* Photo carousel */}
      {photos.length > 0 ? (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={photos}
            renderItem={({ item }) => (
              <View style={styles.carouselItem}>
                <Image source={{ uri: item.uri }} style={styles.carouselImage} />
              </View>
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(_, index) => index.toString()}
            snapToInterval={CAROUSEL_WIDTH}
            decelerationRate="fast"
          />
          {/* Pagination + edit button */}
          <View style={styles.paginationRow}>
            <View style={styles.pagination}>
              {Array.from({ length: MAX_PHOTOS }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === activeIndex && index < photos.length
                      ? styles.dotActive
                      : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
            <Pressable onPress={onEditPhotos} style={styles.pencilButton}>
              <Pencil size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCarousel}>
          <ImageIcon size={48} color="#666" />
          <Text style={styles.emptyText}>Aucune photo</Text>
        </View>
      )}

      {/* Tracks list */}
      {tracks.length > 0 && (
        <View style={styles.trackList}>
          {tracks.map((track, index) => (
            <View key={index} style={styles.trackRow}>
              {/* Edit button */}
              <Pressable onPress={onEditTracks} style={styles.trackEditButton}>
                <Pencil size={20} color="#161616" />
              </Pressable>

              {/* Track bar */}
              <View style={styles.trackBar}>
                <Text style={styles.trackName} numberOfLines={1}>
                  {track.name}
                </Text>
                {/* Play button */}
                <View style={styles.playButton}>
                  <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Social links summary */}
      {filledLinks.length > 0 && (
        <View style={styles.socialSection}>
          <View style={styles.socialHeader}>
            <Text style={styles.socialTitle}>
              {filledLinks.length} réseaux ajoutés
            </Text>
            <Pressable onPress={onEditSocialLinks}>
              <Pencil size={20} color="#161616" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
  },

  // Carousel
  carouselContainer: {
    width: CAROUSEL_WIDTH,
    gap: 10,
  },
  carouselItem: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    backgroundColor: "#555555",
  },
  pencilButton: {
    position: "absolute",
    bottom: 0,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: "#F9F871",
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty
  emptyCarousel: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 10,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#666",
  },

  // Tracks
  trackList: {
    width: 341,
    gap: 16,
    marginTop: 8,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    height: 44,
  },
  trackEditButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  trackBar: {
    flex: 1,
    backgroundColor: "#161616",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 15,
    paddingRight: 5,
    paddingVertical: 10,
    gap: 8,
  },
  trackName: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.4,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Social links
  socialSection: {
    width: 341,
    marginTop: 8,
  },
  socialHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  socialTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
