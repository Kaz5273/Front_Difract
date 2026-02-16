import type { OnboardingSlide as SlideData } from '@/constants/onboarding-data';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { VignetteGradient } from '../PictureGradient';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlideProps {
  slide: SlideData;
  index?: number;
}

export function OnboardingSlide({ slide, index = 0 }: OnboardingSlideProps) {
 const isFirstSlide = index === 0;
 const isFourthSlide = index === 3;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isFirstSlide && styles.firstSlideTitle]}>
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
            <Image source={slide.image} style={styles.image}  resizeMode="contain"/>
               {!isFirstSlide && (
              <VignetteGradient 
                intensity={0.95} 
                size={40} 
                sides={isFourthSlide ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']}
              />
            )}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
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
    firstSlideTitle: {
    marginBottom: -100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    marginBottom: 20,
    width: SCREEN_WIDTH * 0.8, // 70% de la largeur de l'écran
    height: SCREEN_WIDTH * 0.8, // Même hauteur pour un carré
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    fontFamily: 'Area-Bold',
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 30,
    padding: 10,
  },
  regularText: {
    fontFamily: 'Area-Regular',
  },
  boldText: {
    fontFamily: 'Area-Bold',
  },

});