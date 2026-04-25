import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof SPACING;
}

export function AppCard({
  children,
  style,
  padding = 'lg',
}: AppCardProps) {
  return (
    <View style={[styles.card, { padding: SPACING[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
