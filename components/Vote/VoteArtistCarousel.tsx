import React, { useRef, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Animated,
  Dimensions,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { VoteArtistCard } from "./VoteArtistCard";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = 280;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const ITEM_SIZE = CARD_WIDTH;
const ACTIVE_SCALE = 1;
const INACTIVE_SCALE = 0.85;
const ACTIVE_OPACITY = 1;
const INACTIVE_OPACITY = 0.5;

export interface CarouselArtist {
  id: string;
  name: string;
  votes: number;
  rank: number;
  imageUrl: string;
  styles: string[];
  track: {
    title: string;
    duration: string;
  };
  trackUrl?: string | null;
}

interface VoteArtistCarouselProps {
  artists: CarouselArtist[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onScrollEnd?: (index: number) => void;
  playingArtistId: string | null;
  onPlayPress: (artistId: string) => void;
}

const AnimatedCard = React.memo(
  ({
    item,
    index,
    scrollX,
    playingArtistId,
    onPlayPress,
    onPrevPress,
    onNextPress,
  }: {
    item: CarouselArtist;
    index: number;
    scrollX: Animated.Value;
    playingArtistId: string | null;
    onPlayPress: (id: string) => void;
    onPrevPress: () => void;
    onNextPress: () => void;
  }) => {
    const inputRange = [
      (index - 1) * ITEM_SIZE,
      index * ITEM_SIZE,
      (index + 1) * ITEM_SIZE,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [INACTIVE_SCALE, ACTIVE_SCALE, INACTIVE_SCALE],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [INACTIVE_OPACITY, ACTIVE_OPACITY, INACTIVE_OPACITY],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          carouselStyles.cardWrapper,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <VoteArtistCard
          name={item.name}
          trackTitle={item.track.title}
          imageUrl={item.imageUrl}
          styles={item.styles}
          isPlaying={playingArtistId === item.id}
          onPlayPress={() => onPlayPress(item.id)}
          onPrevPress={onPrevPress}
          onNextPress={onNextPress}
        />
      </Animated.View>
    );
  }
);

export const VoteArtistCarousel: React.FC<VoteArtistCarouselProps> = ({
  artists,
  currentIndex,
  onIndexChange,
  onScrollEnd,
  playingArtistId,
  onPlayPress,
}) => {
  const flatListRef = useRef<Animated.FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;

  const onScrollEndRef = useRef(onScrollEnd);
  onScrollEndRef.current = onScrollEnd;

  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastReportedIndex = useRef<number>(currentIndex);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= artists.length) return;
      (flatListRef.current as any)?.scrollToOffset({
        offset: index * ITEM_SIZE,
        animated: true,
      });
    },
    [artists.length]
  );

  // Scroll to currentIndex when it changes from parent (e.g. sort toggle)
  useEffect(() => {
    // Small delay to let FlatList re-render with new data before scrolling
    const t = setTimeout(() => scrollToIndex(currentIndex), 50);
    return () => clearTimeout(t);
  }, [currentIndex, scrollToIndex]);

  const handlePrevPress = useCallback(() => {
    const newIndex = currentIndexRef.current - 1;
    if (newIndex >= 0) {
      scrollToIndex(newIndex);
    }
  }, [scrollToIndex]);

  const handleNextPress = useCallback(() => {
    const newIndex = currentIndexRef.current + 1;
    if (newIndex < artists.length) {
      scrollToIndex(newIndex);
    }
  }, [scrollToIndex, artists.length]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        onIndexChangeRef.current(viewableItems[0].index);
      }
    }
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_SIZE,
      offset: ITEM_SIZE * index,
      index,
    }),
    []
  );

  const onScroll = useCallback(
    Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      {
        useNativeDriver: true,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          // Debounce: reset timer on every scroll event, fire when scroll settles
          if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
          const offsetX = e.nativeEvent.contentOffset.x;
          scrollEndTimer.current = setTimeout(() => {
            const index = Math.round(offsetX / ITEM_SIZE);
            if (lastReportedIndex.current !== index) {
              lastReportedIndex.current = index;
            }
            onScrollEndRef.current?.(index);
          }, 150);
        },
      }
    ),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: CarouselArtist; index: number }) => (
      <AnimatedCard
        item={item}
        index={index}
        scrollX={scrollX}
        playingArtistId={playingArtistId}
        onPlayPress={onPlayPress}
        onPrevPress={handlePrevPress}
        onNextPress={handleNextPress}
      />
    ),
    [scrollX, playingArtistId, onPlayPress, handlePrevPress, handleNextPress]
  );

  return (
    <Animated.FlatList
      ref={flatListRef}
      data={artists}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_SIZE}
      decelerationRate="fast"
      contentContainerStyle={carouselStyles.contentContainer}
      getItemLayout={getItemLayout}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig.current}
      initialScrollIndex={currentIndex}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
};

const carouselStyles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: SIDE_PADDING,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
});

export default VoteArtistCarousel;
