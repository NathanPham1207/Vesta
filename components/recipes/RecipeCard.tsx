import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { DifficultyBadge } from './DifficultyBadge';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { RADIUS } from '@/constants/radius';

export interface RecipeItem {
  id: string;
  title: string;
  description: string;
  time: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image: string | null;
}

interface RecipeCardProps {
  recipe: RecipeItem;
  onViewRecipe?: () => void;
  onBookmark?: () => void;
  bookmarked?: boolean;
}

export function RecipeCard({
  recipe,
  onViewRecipe,
  onBookmark,
  bookmarked = false,
}: RecipeCardProps) {
  return (
    <AppCard>
      <View style={styles.imagePlaceholder}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.imageEmoji}>🍽️</Text>
        )}
        <Pressable
          onPress={onBookmark}
          style={styles.bookmarkBtn}
          hitSlop={8}
        >
          <Text style={styles.bookmarkIcon}>{bookmarked ? '🔖' : '📑'}</Text>
        </Pressable>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {recipe.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {recipe.description}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>⏱ {recipe.time}</Text>
        <Text style={styles.metaText}>🍴 {recipe.servings}</Text>
      </View>
      <View style={styles.footer}>
        <DifficultyBadge difficulty={recipe.difficulty} />
        <AppButton
          title="View Recipe"
          onPress={onViewRecipe ?? (() => {})}
          variant="outline"
          style={styles.viewButton}
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  imagePlaceholder: {
    height: 140,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.muted,
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageEmoji: {
    fontSize: 48,
  },
  bookmarkBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  bookmarkIcon: {
    fontSize: 22,
  },
  title: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    marginBottom: SPACING.sm,
  },
  meta: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  metaText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  viewButton: {
    flex: 1,
  },
});
