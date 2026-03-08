import React, { useState, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  type DimensionValue,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Sparkle, Star } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ImageCarouselProps {
  images: string[];
  height?: DimensionValue;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  height = "100%",
  onFavoritePress,
  isFavorite = false,
  showFavoriteButton = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setActiveIndex(currentIndex);
  };

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {images.map((imageUrl, index) => (
          <View
            key={index}
            style={[styles.imageContainer, { width: SCREEN_WIDTH }]}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
            />
            {/* Gradient overlay en bas */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              locations={[0.5, 1]}
              style={styles.gradient}
            />
          </View>
        ))}
      </ScrollView>

      {/* Bouton Favoris */}
      {showFavoriteButton && (
        <Pressable onPress={onFavoritePress} style={styles.favoriteButton}>
          <BlurView intensity={10} style={styles.favoriteBlur}>
            <Sparkle
              size={20}
              color="#FFFFFF"
              fill={isFavorite ? "#FFFFFF" : "transparent"}
            />
          </BlurView>
        </Pressable>
      )}

      {/* Indicateurs de pagination */}
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  imageContainer: {
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  favoriteButton: {
    position: "absolute",
    bottom: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 32,
    overflow: "hidden",
  },
  favoriteBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  pagination: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
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
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
});
