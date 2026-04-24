import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Search } from 'lucide-react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE } from '@/constants/typography';

/** Modal / flat row style: pale gray, no border, soft icon (matches popup reference). */
const MINIMAL_BG = '#F1F5F9';
const MINIMAL_ICON = '#94A3B8';
const MINIMAL_PLACEHOLDER = '#94A3B8';

const RECIPES_SEARCH_BG = '#F3F4F6';
const RECIPES_PLACEHOLDER = '#9CA3AF';
const RECIPES_SEARCH_ICON = '#9CA3AF';

export type SearchBarVariant = 'default' | 'minimal' | 'recipes';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  wrapperStyle?: ViewStyle;
  /** `minimal` = flat gray, no stroke (modals). `recipes` = light gray search field on Recipes screen. */
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
  const isRecipes = variant === 'recipes';

  return (
    <View
      style={[
        styles.wrapper,
        isRecipes && styles.wrapperRecipes,
        isMinimal && styles.wrapperMinimal,
        !isMinimal && !isRecipes && styles.wrapperDefault,
        wrapperStyle,
      ]}
    >
      {isRecipes ? (
        <Search
          size={19}
          color={RECIPES_SEARCH_ICON}
          strokeWidth={2}
          style={styles.iconRecipes}
        />
      ) : isMinimal ? (
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
          isRecipes
            ? RECIPES_PLACEHOLDER
            : isMinimal
              ? MINIMAL_PLACEHOLDER
              : COLORS.subtext
        }
        style={[
          styles.input,
          isMinimal && styles.inputMinimal,
          isRecipes && styles.inputRecipes,
        ]}
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
  wrapperRecipes: {
    backgroundColor: RECIPES_SEARCH_BG,
    borderRadius: 14,
    borderWidth: 0,
    minHeight: 48,
  },
  iconRecipes: {
    marginRight: 8,
  },
  inputRecipes: {
    paddingVertical: 10,
    fontSize: FONT_SIZE.body,
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
