import React, { useRef, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { Fonts } from "@/constants/theme";

interface VoteTrackPlayerProps {
  artistName: string;
  trackTitle: string;
  progress: number; // 0 à 1
  onSeek: (position: number) => void; // 0 à 1
}

export const VoteTrackPlayer: React.FC<VoteTrackPlayerProps> = ({
  artistName,
  trackTitle,
  progress,
  onSeek,
}) => {
  const trackWidthShared = useSharedValue(273);
  const progressShared = useSharedValue(Math.min(1, Math.max(0, progress)));
  const isDragging = useSharedValue(false);

  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  // Sync external progress → shared value (seulement quand on ne drag pas)
  useEffect(() => {
    if (!isDragging.value) {
      progressShared.value = Math.min(1, Math.max(0, progress));
    }
  }, [progress]);

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidthShared.value = e.nativeEvent.layout.width;
  }, []);

  const commitSeek = useCallback((ratio: number) => {
    onSeekRef.current(ratio);
  }, []);

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      "worklet";
      isDragging.value = true;
      const ratio = Math.min(1, Math.max(0, e.x / trackWidthShared.value));
      progressShared.value = ratio;
      runOnJS(commitSeek)(ratio);
    })
    .onUpdate((e) => {
      "worklet";
      const ratio = Math.min(1, Math.max(0, e.x / trackWidthShared.value));
      progressShared.value = ratio;
    })
    .onEnd((e) => {
      "worklet";
      const ratio = Math.min(1, Math.max(0, e.x / trackWidthShared.value));
      progressShared.value = ratio;
      isDragging.value = false;
      runOnJS(commitSeek)(ratio);
    })
    .onFinalize(() => {
      "worklet";
      isDragging.value = false;
    })
    .minDistance(0)
    .activeOffsetX([-5, 5])
    .failOffsetY([-20, 20]);

  const tapGesture = Gesture.Tap().onEnd((e) => {
    "worklet";
    const ratio = Math.min(1, Math.max(0, e.x / trackWidthShared.value));
    progressShared.value = ratio;
    runOnJS(commitSeek)(ratio);
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  // Animated styles pour la barre et le thumb (thread UI natif, 0 lag)
  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressShared.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: `${progressShared.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {/* Artist & Track info */}
      <View style={styles.infoContainer}>
        <Text style={styles.artistName} numberOfLines={1}>
          {artistName}
        </Text>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {trackTitle}
        </Text>
      </View>

      {/* Progress Bar - Interactive */}
      <GestureDetector gesture={composedGesture}>
        <View style={styles.progressBarContainer} onLayout={onTrackLayout}>
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, fillStyle]} />
          </View>
          {/* Thumb */}
          <Animated.View style={[styles.progressThumb, thumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 5,
    width: "100%",
  },
  infoContainer: {
    alignItems: "center",
    gap: 2,
  },
  artistName: {
    fontFamily: Fonts.extraBold,
    fontSize: 17,
    color: "#FFFFFF",
    letterSpacing: -0.68,
  },
  trackTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: -0.28,
  },
  progressBarContainer: {
    width: 273,
    height: 30,
    justifyContent: "center",
    position: "relative",
  },
  progressBarTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 42,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 42,
  },
  progressThumb: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginLeft: -8,
    top: 7,
  },
});

export default VoteTrackPlayer;
