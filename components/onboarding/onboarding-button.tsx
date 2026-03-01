import { Fonts } from '@/constants/theme';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  disabled?: boolean;
}

export function OnboardingButton({ title, onPress, variant = 'primary', fullWidth, disabled }: OnboardingButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        fullWidth && styles.fullWidth,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.buttonTextSecondary,
        disabled && styles.buttonTextDisabled,
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
  buttonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: Fonts.regular,
    letterSpacing: -0.28,
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#6c6c6c',
  },
  fullWidth: {
    width: '100%',
  },
});
