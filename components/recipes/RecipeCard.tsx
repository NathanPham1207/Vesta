import { AppButton } from '@/components/ui/AppButton';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_WEIGHT } from '@/constants/typography';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DifficultyBadge } from './DifficultyBadge';

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  image: string | null;
  inStock: boolean;
}

/** Optional tags for advanced recipe filters (RecipesFilterPanel). */
export type DietaryTag = 'vegan' | 'glutenFree' | 'highProtein' | 'lowCarb';

export interface RecipeItem {
  id: string;
  title: string;
  description: string;
  time: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image: string | null;
  ingredients: RecipeIngredient[];
  instructions: string[];
  dietaryTags?: DietaryTag[];
}

const CARD_RADIUS = 20;
const IMAGE_HEIGHT = 200;

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
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {recipe.image ? (
          <Image
            source={{ uri: recipe.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant" size={56} color={COLORS.primary} />
          </View>
        )}
        <Pressable
          onPress={onBookmark}
          style={({ pressed }) => [
            styles.bookmarkBtn,
            pressed && styles.bookmarkBtnPressed,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark recipe'}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color="#1A1A1A"
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {recipe.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.subtext} />
            <Text style={styles.metaText}>{recipe.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color={COLORS.subtext} />
            <Text style={styles.metaText}>{recipe.servings}</Text>
          </View>
          <DifficultyBadge difficulty={recipe.difficulty} variant="soft" />
        </View>

        <AppButton
          title="View Recipe"
          onPress={onViewRecipe ?? (() => {})}
          variant="primary"
          style={styles.viewButton}
          textStyle={styles.viewButtonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  imageWrap: {
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#E8F8EE',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F8EE',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  bookmarkBtnPressed: {
    opacity: 0.85,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    color: '#1A1A1A',
    marginTop: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 11,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.subtext,
    fontWeight: FONT_WEIGHT.medium,
  },
  viewButton: {
    width: '100%',
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  viewButtonText: {
    fontWeight: FONT_WEIGHT.bold,
  },
});
