import type { ChoiceOption, UserRole } from '@/constants/onboarding-data';
import { Fonts } from '@/constants/theme';
import React from 'react';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_WIDTH = 200;
const CARD_HEIGHT = 260;

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 0.8,
};

interface OnboardingChoiceSlideProps {
  choices: ChoiceOption[];
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
}

function ChoiceCard({
  choice,
  isSelected,
  hasSelection,
  rotation,
  offsetX,
  onPress,
}: {
  choice: ChoiceOption;
  isSelected: boolean;
  hasSelection: boolean;
  rotation: number;
  offsetX: number;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: withSpring(`${rotation}deg`, SPRING_CONFIG) },
      { scale: withSpring(isSelected ? 1.05 : 0.95, SPRING_CONFIG) },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    backgroundColor: isSelected
      ? 'rgba(0,0,0,0.25)'
      : 'rgba(0,0,0,0.6)',
    opacity: withSpring(1, SPRING_CONFIG),
  }));

  const textOpacity = useAnimatedStyle(() => ({
    opacity: withSpring(isSelected || !hasSelection ? 1 : 0.5, SPRING_CONFIG),
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderWidth: withTiming(isSelected ? 2 : 0, { duration: 200 }),
    borderColor: '#FFFFFF',
  }));

  return (
    <Pressable onPress={onPress} style={{ marginHorizontal: offsetX, zIndex: isSelected ? 2 : 1 }}>
      <Animated.View style={[styles.card, animatedStyle, borderStyle]}>
        <ImageBackground
          source={choice.image}
          style={styles.cardImage}
          imageStyle={styles.cardImageRadius}
          resizeMode="cover"
        >
          <Animated.View style={[styles.cardOverlay, overlayStyle]} />
          <View style={styles.cardContent}>
            <Animated.Text style={[styles.cardLabel, textOpacity]}>
              {choice.label}
            </Animated.Text>
            <Animated.Text style={[styles.cardSubtitle, textOpacity]}>
              {choice.subtitle}
            </Animated.Text>
          </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

export function OnboardingChoiceSlide({
  choices,
  selectedRole,
  onSelectRole,
}: OnboardingChoiceSlideProps) {
  const hasSelection = selectedRole !== null;

  const firstBgOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(selectedRole === choices[0].role ? 0.15 : 0, { duration: 250 }),
  }));

  const secondBgOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(selectedRole === choices[1].role ? 0.15 : 0, { duration: 250 }),
  }));

  return (
    <View style={styles.container}>
      <Animated.Image
        source={choices[0].image}
        style={[styles.absoluteBg, firstBgOpacity]}
        resizeMode="cover"
      />
      <Animated.Image
        source={choices[1].image}
        style={[styles.absoluteBg, secondBgOpacity]}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            <Text style={styles.regularText}>Choisissez </Text>
            <Text style={styles.boldText}>qui vous êtes</Text>
          </Text>
          <Text style={styles.subtitle}>
            Cliquez sur la carte qui vous correspond !
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <ChoiceCard
            choice={choices[0]}
            isSelected={selectedRole === choices[0].role}
            hasSelection={hasSelection}
            rotation={-10}
            offsetX={-10}
            onPress={() => onSelectRole(choices[0].role)}
          />
          <ChoiceCard
            choice={choices[1]}
            isSelected={selectedRole === choices[1].role}
            hasSelection={hasSelection}
            rotation={7.5}
            offsetX={-10}
            onPress={() => onSelectRole(choices[1].role)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  absoluteBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 100,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 25,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
    width: 305,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#b8b8b8',
    letterSpacing: -0.42,
    lineHeight: 18,
  },
  regularText: {
    fontFamily: Fonts.bold,
  },
  boldText: {
    fontFamily: Fonts.regular,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageRadius: {
    borderRadius: 10,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  cardContent: {
    alignItems: 'center',
    gap: 5,
    zIndex: 1,
  },
  cardLabel: {
    fontSize: 20,
    fontFamily: 'Area-ExtraBold',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Area-Regular',
    color: '#FFFFFF',
  },
});
