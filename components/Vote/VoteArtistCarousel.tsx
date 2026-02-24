import React, { useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
} from "react-native";
import { VoteArtistCard } from "./VoteArtistCard";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = 280;
const CARD_GAP = 16;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

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
}

interface VoteArtistCarouselProps {
  artists: CarouselArtist[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  playingArtistId: string | null;
  onPlayPress: (artistId: string) => void;
}

export const VoteArtistCarousel: React.FC<VoteArtistCarouselProps> = ({
  artists,
  currentIndex,
  onIndexChange,
  playingArtistId,
  onPlayPress,
}) => {
  const flatListRef = useRef<FlatList>(null);

  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;

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
      length: CARD_WIDTH + CARD_GAP,
      offset: (CARD_WIDTH + CARD_GAP) * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: CarouselArtist; index: number }) => {
      const isActive = index === currentIndex;
      return (
        <View
          style={[
            carouselStyles.cardWrapper,
            !isActive && carouselStyles.cardInactive,
          ]}
        >
          <VoteArtistCard
            name={item.name}
            votes={item.votes}
            rank={item.rank}
            imageUrl={item.imageUrl}
            styles={item.styles}
            isPlaying={playingArtistId === item.id}
            onPlayPress={() => onPlayPress(item.id)}
          />
        </View>
      );
    },
    [currentIndex, playingArtistId, onPlayPress]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={artists}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + CARD_GAP}
      decelerationRate="fast"
      contentContainerStyle={carouselStyles.contentContainer}
      getItemLayout={getItemLayout}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig.current}
      initialScrollIndex={currentIndex}
    />
  );
};

const carouselStyles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: SIDE_PADDING,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
  },
  cardInactive: {
    opacity: 0.5,
  },
});

export default VoteArtistCarousel;
