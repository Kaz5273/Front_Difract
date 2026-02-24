import type { OnboardingSlide as SlideData, UserRole } from '@/constants/onboarding-data';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { OnboardingChoiceSlide } from './onboarding-choice-slide';
import { VignetteGradient } from '../PictureGradient';

const welcomeVideo = require('@/assets/images/AccueilDifract.mp4');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlideProps {
  slide: SlideData;
  index?: number;
  selectedRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
}

export function OnboardingSlide({ slide, index = 0, selectedRole, onSelectRole }: OnboardingSlideProps) {
  const isWelcome = slide.type === 'welcome';
  const isChoice = slide.type === 'choice';
  const hasFullscreenBg = !!slide.backgroundImage && !isWelcome && !isChoice;

  const videoOpacity = useSharedValue(1);
  const fadingOut = useRef(false);

  const player = useVideoPlayer(isWelcome ? welcomeVideo : null, (p) => {
    p.loop = false;
    p.volume = 0;
    p.play();
  });

  const restartWithFade = useCallback(() => {
    if (!player || fadingOut.current) return;
    fadingOut.current = true;
    // Fade out
    videoOpacity.value = withTiming(0, { duration: 300 });
    // Après le fade out, revenir au début et fade in
    setTimeout(() => {
      player.currentTime = 0;
      player.play();
      videoOpacity.value = withTiming(1, { duration: 500 });
      fadingOut.current = false;
    }, 900);
  }, [player]);

  useEffect(() => {
    if (!isWelcome || !player) return;

    const subscription = player.addListener('playToEnd', () => {
      restartWithFade();
    });

    return () => subscription.remove();
  }, [player, isWelcome, restartWithFade]);

  const videoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));

  if (isChoice && slide.choices && selectedRole && onSelectRole) {
    return (
      <OnboardingChoiceSlide
        choices={slide.choices}
        selectedRole={selectedRole}
        onSelectRole={onSelectRole}
      />
    );
  }

  if (isWelcome) {
    return (
      <View style={styles.welcomeContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, videoAnimatedStyle]}>
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
          />
        </Animated.View>
        <VignetteGradient
          intensity={0.95}
          size={45}
          sides={['top', 'bottom']}
        />
        <View style={styles.logoContainer}>
          <Image
            source={slide.image}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  // Slide plein écran avec background image + titre en haut
  if (hasFullscreenBg) {
    return (
      <View style={styles.fullscreenContainer}>
        <ImageBackground
          source={slide.backgroundImage!}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <VignetteGradient
            intensity={0.95}
            size={45}
            sides={['top', 'bottom']}
          />
          <View style={styles.fullscreenTitleContainer}>
            <Text style={styles.fullscreenTitle}>
              {slide.title.map((part, i) => (
                <Text
                  key={i}
                  style={part.bold ? styles.fullscreenBoldText : styles.fullscreenRegularText}
                >
                  {part.text}
                </Text>
              ))}
            </Text>
          </View>
        </ImageBackground>
      </View>
    );
  }

  // Slide par défaut (image centrée + titre)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {slide.title.map((part, i) => (
          <Text
            key={i}
            style={part.bold ? styles.boldText : styles.regularText}
          >
            {part.text}
          </Text>
        ))}
      </Text>
      <View style={styles.imageContainer}>
        <Image source={slide.image} style={styles.image} resizeMode="contain" />
        <VignetteGradient
          intensity={0.95}
          size={40}
          sides={['top', 'bottom']}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Welcome
  welcomeContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 100,
  },
  logo: {
    width: SCREEN_WIDTH * 0.9,
    height: 60,
  },
  // Fullscreen avec titre
  fullscreenContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  fullscreenTitleContainer: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  fullscreenTitle: {
    fontSize: 25,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
    width: 337,
  },
  fullscreenRegularText: {
    fontFamily: 'Area-ExtraBold',
  },
  fullscreenBoldText: {
    fontFamily: 'Area-Bold',
  },
  // Default
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Area-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    padding: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    marginBottom: 20,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  regularText: {
    fontFamily: 'Area-Regular',
  },
  boldText: {
    fontFamily: 'Area-Bold',
  },
});
