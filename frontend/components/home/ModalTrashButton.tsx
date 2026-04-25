import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

interface ModalTrashButtonProps {
  onPress?: () => void;
}

export function ModalTrashButton({ onPress }: ModalTrashButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Delete item"
    >
      <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
