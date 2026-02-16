import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';

type Side = 'top' | 'bottom' | 'left' | 'right';

interface VignetteGradientProps {
  intensity?: number; // 0 à 1
  size?: number; // Pourcentage de chaque côté (ex: 30 = 30%)
  sides?: Side[]; // Côtés où appliquer le gradient
}

export function VignetteGradient({ intensity = 0.7, size = 30, sides = ['top', 'bottom', 'left', 'right'] }: VignetteGradientProps) { 
  const gradientColor = `rgba(0,0,0,${intensity})`;
  
return (
    <>
      {/* Gradient du haut */}
      {sides.includes('top') && (
        <LinearGradient
          colors={[gradientColor, 'rgba(0,0,0,0)']}
          style={[styles.gradient, styles.gradientTop, { height: `${size}%` }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
      )}
      
      {/* Gradient du bas */}
      {sides.includes('bottom') && (
        <LinearGradient
          colors={['rgba(0,0,0,0)', gradientColor]}
          style={[styles.gradient, styles.gradientBottom, { height: `${size}%` }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
      )}
      
      {/* Gradient de gauche */}
      {sides.includes('left') && (
        <LinearGradient
          colors={[gradientColor, 'rgba(0,0,0,0)']}
          style={[styles.gradient, styles.gradientLeft, { width: `${size}%` }]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          pointerEvents="none"
        />
      )}
      
      {/* Gradient de droite */}
      {sides.includes('right') && (
        <LinearGradient
          colors={['rgba(0,0,0,0)', gradientColor]}
          style={[styles.gradient, styles.gradientRight, { width: `${size}%` }]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          pointerEvents="none"
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
  },
  gradientTop: {
    top: 0,
    left: 0,
    right: 0,
  },
  gradientBottom: {
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradientLeft: {
    left: 0,
    top: 0,
    bottom: 0,
  },
  gradientRight: {
    right: 0,
    top: 0,
    bottom: 0,
  },
});