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
  currentTime: string;
  duration: string;
  progress: number; // 0 à 1
  onSeek: (position: number) => void; // 0 à 1
}

export const VoteTrackPlayer: React.FC<VoteTrackPlayerProps> = ({
  currentTime,
  duration,
  progress,
  onSeek,
}) => {
  const trackWidthShared = useSharedValue(201);
  const progressShared = useSharedValue(Math.min(1, Math.max(0, progress)));
  const isDragging = useSharedValue(false);
  const isDraggingJS = useRef(false);

  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  // Sync external progress → shared value (seulement quand on ne drag pas)
  useEffect(() => {
    if (!isDraggingJS.current) {
      progressShared.value = Math.min(1, Math.max(0, progress));
    }
  }, [progress]);

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidthShared.value = e.nativeEvent.layout.width;
  }, []);

  const setDraggingJS = useCallback((value: boolean) => {
    isDraggingJS.current = value;
  }, []);

  const commitSeek = useCallback((ratio: number) => {
    onSeekRef.current(ratio);
  }, []);

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      "worklet";
      isDragging.value = true;
      runOnJS(setDraggingJS)(true);
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
      runOnJS(setDraggingJS)(false);
      runOnJS(commitSeek)(ratio);
    })
    .onFinalize(() => {
      "worklet";
      isDragging.value = false;
      runOnJS(setDraggingJS)(false);
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

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressShared.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: `${progressShared.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{currentTime}</Text>

      <GestureDetector gesture={composedGesture}>
        <View style={styles.progressBarContainer} onLayout={onTrackLayout}>
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, fillStyle]} />
          </View>
          <Animated.View style={[styles.progressThumb, thumbStyle]} />
        </View>
      </GestureDetector>

      <Text style={styles.timeText}>{duration}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    width: 32,
    textAlign: "center",
  },
  progressBarContainer: {
    flex: 1,
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
