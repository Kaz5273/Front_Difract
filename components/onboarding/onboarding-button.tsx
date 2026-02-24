import { Fonts } from '@/constants/theme';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export function OnboardingButton({ title, onPress, variant = 'primary', fullWidth }: OnboardingButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        fullWidth && styles.fullWidth,
      ]}
      onPress={onPress}>
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.buttonTextSecondary,
      ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 200,
    minWidth: 120,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buttonText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: Fonts.regular,
    letterSpacing: -0.6,
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
  fullWidth: {
    width: '100%',
  },
});
