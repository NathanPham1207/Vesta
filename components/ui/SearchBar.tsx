import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE } from '@/constants/typography';

/** Modal / flat row style: pale gray, no border, soft icon (matches popup reference). */
const MINIMAL_BG = '#F1F5F9';
const MINIMAL_ICON = '#94A3B8';
const MINIMAL_PLACEHOLDER = '#94A3B8';

export type SearchBarVariant = 'default' | 'minimal';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  wrapperStyle?: ViewStyle;
  /** `minimal` = flat gray, no stroke, compact (home modals). */
  variant?: SearchBarVariant;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  wrapperStyle,
  variant = 'default',
}: SearchBarProps) {
  const isMinimal = variant === 'minimal';

  return (
    <View
      style={[
        styles.wrapper,
        isMinimal ? styles.wrapperMinimal : styles.wrapperDefault,
        wrapperStyle,
      ]}
    >
      {isMinimal ? (
        <Ionicons
          name="search-outline"
          size={18}
          color={MINIMAL_ICON}
          style={styles.iconMinimal}
        />
      ) : (
        <Text style={styles.iconEmoji}>🔍</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={
          isMinimal ? MINIMAL_PLACEHOLDER : COLORS.subtext
        }
        style={[styles.input, isMinimal && styles.inputMinimal]}
        returnKeyType="search"
      />
    </View>
  );
}

const COMPACT_HEIGHT = 44;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    minHeight: COMPACT_HEIGHT,
  },
  wrapperDefault: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 44,
  },
  wrapperMinimal: {
    backgroundColor: MINIMAL_BG,
    borderRadius: RADIUS.sm,
    borderWidth: 0,
    minHeight: COMPACT_HEIGHT,
  },
  iconEmoji: {
    marginRight: SPACING.sm,
    fontSize: 16,
  },
  iconMinimal: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.body,
    color: COLORS.text,
  },
  inputMinimal: {
    paddingVertical: 8,
    fontSize: FONT_SIZE.body,
  },
});
