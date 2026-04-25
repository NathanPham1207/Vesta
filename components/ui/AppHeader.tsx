import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  CHROME_BAR_MIN_HEIGHT,
  CHROME_BAR_PADDING_BOTTOM,
  CHROME_BAR_PADDING_TOP,
  chromeBarBottomHairline,
  chromeBarShadow,
} from '@/constants/chromeBar';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  rightAction?: {
    onPress: () => void;
    icon?: React.ReactNode;
    label?: string;
  };
}

export function AppHeader({
  title = 'Vesta',
  showLogo = true,
  rightAction,
}: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showLogo && (
          <Text style={styles.logo}>{title}</Text>
        )}
      </View>
      {rightAction && (
        <Pressable
          onPress={rightAction.onPress}
          style={({ pressed }) => [styles.rightButton, pressed && styles.pressed]}
          hitSlop={12}
        >
          {rightAction.icon ?? (
            <View style={styles.profileCircle}>
              <Text style={styles.profileText}>👤</Text>
            </View>
          )}
          {rightAction.label ? (
            <Text style={styles.rightLabel}>{rightAction.label}</Text>
          ) : null}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: CHROME_BAR_PADDING_TOP,
    paddingBottom: CHROME_BAR_PADDING_BOTTOM,
    minHeight: CHROME_BAR_MIN_HEIGHT,
    ...chromeBarBottomHairline,
    ...chromeBarShadow,
  },
  left: {
    flex: 1,
  },
  logo: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  rightButton: {
    padding: SPACING.xs,
  },
  rightLabel: {
    fontSize: FONT_SIZE.small,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: 18,
  },
  pressed: {
    opacity: 0.7,
  },
});
