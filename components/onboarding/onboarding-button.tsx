import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function OnboardingButton({ title, onPress, variant = 'primary' }: OnboardingButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
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
    backgroundColor: '#FC5F67',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FC5F67',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
});