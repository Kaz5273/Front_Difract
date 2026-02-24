import { Fonts } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const videoSource = require("@/assets/images/Difract01.mp4");

interface CompletionScreenProps {
  onFinish: () => void;
}

export function CompletionScreen({ onFinish }: CompletionScreenProps) {
  const videoOpacity = useSharedValue(0);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.play();
  });

  useEffect(() => {
    const subscription = player.addListener("statusChange", ({ status }) => {
      if (status === "readyToPlay") {
        videoOpacity.value = withTiming(1, { duration: 800 });
      }
    });
    return () => subscription.remove();
  }, [player]);

  const videoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Video background with fade-in on ready */}
      <Animated.View style={[StyleSheet.absoluteFill, videoAnimatedStyle]}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      </Animated.View>

      {/* Gradient overlay */}
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0.5)",
          "rgba(0, 0, 0, 0.2)",
          "rgba(0, 0, 0, 0.2)",
          "rgba(0, 0, 0, 0.5)",
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Content overlay with staggered fade-in */}
      <View style={styles.overlay}>
        {/* Top section */}
        <Animated.View
          entering={FadeIn.duration(600).delay(300)}
          style={styles.topSection}
        >
          <Text style={styles.title}>Félicitations !</Text>
          <Text style={styles.subtitle}>
            Vous faites maintenant parti de l'expérience Difract
          </Text>
        </Animated.View>

        {/* Bottom section */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(700)}
          style={styles.bottomSection}
        >
          <Text style={styles.bottomText}>
            Lancez-vous, et{"\n"}réalisez vos rêves
          </Text>
          <Pressable style={styles.button} onPress={onFinish}>
            <Text style={styles.buttonText}>Me lancer</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
    paddingTop: 160,
    gap: 16,
  },
  title: {
    fontSize: 35,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.3,
    width: 245,
  },
  bottomSection: {
    alignItems: "center",
    paddingBottom: 80,
    gap: 30,
  },
  bottomText: {
    fontSize: 15,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.3,
    width: 157,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 36,
    paddingVertical: 13,
    borderRadius: 49,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: Fonts.extraBold,
    color: "#000000",
  },
});
