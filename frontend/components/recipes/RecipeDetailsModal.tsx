import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DifficultyBadge } from '@/components/recipes/DifficultyBadge';
import type { RecipeIngredient, RecipeItem } from '@/components/recipes/RecipeCard';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

interface RecipeDetailsModalProps {
  visible: boolean;
  recipe: RecipeItem | null;
  onClose: () => void;
  onStartCooking: () => void;
}

function IngredientTile({ item }: { item: RecipeIngredient }) {
  const stock = item.inStock;
  return (
    <View
      style={[
        styles.ingredientCard,
        stock ? styles.ingredientCardInStock : styles.ingredientCardMissing,
      ]}
    >
      <View style={styles.ingredientImageWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.ingredientImage} />
        ) : (
          <View style={styles.ingredientImageFallback}>
            <Ionicons name="nutrition-outline" size={28} color={COLORS.subtext} />
          </View>
        )}
        <View
          style={[
            styles.stockBadge,
            stock ? styles.stockBadgeOk : styles.stockBadgeNo,
          ]}
        >
          <Ionicons
            name={stock ? 'checkmark' : 'close'}
            size={14}
            color={COLORS.surface}
          />
        </View>
      </View>
      <View style={[styles.ingredientTextBlock, stock && styles.ingredientTextInStock]}>
        <Text style={styles.ingredientName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.ingredientQty} numberOfLines={2}>
          {item.quantity}
        </Text>
      </View>
    </View>
  );
}

export function RecipeDetailsModal({
  visible,
  recipe,
  onClose,
  onStartCooking,
}: RecipeDetailsModalProps) {
  const { height } = useWindowDimensions();
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    if (visible) setInstructionsOpen(false);
  }, [visible, recipe?.id]);

  if (!recipe) return null;

  const maxModalH = Math.min(height * 0.88, 720);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <View style={[styles.sheet, { maxHeight: maxModalH }]}>
          <Pressable
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close recipe"
          >
            <Ionicons name="close" size={22} color={COLORS.subtext} />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            <Text style={styles.title}>{recipe.title}</Text>

            <View style={styles.metaRow}>
              <DifficultyBadge difficulty={recipe.difficulty} variant="soft" />
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={18} color="#7D7D7D" />
                <Text style={styles.metaText}>{recipe.time}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={18} color="#7D7D7D" />
                <Text style={styles.metaText}>
                  {recipe.servings}{' '}
                  {recipe.servings === 1 ? 'serving' : 'servings'}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientGrid}>
              {recipe.ingredients.map((ing) => (
                <View key={ing.id} style={styles.ingredientCell}>
                  <IngredientTile item={ing} />
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => setInstructionsOpen((o) => !o)}
              style={styles.accordionHeader}
              accessibilityRole="button"
              accessibilityState={{ expanded: instructionsOpen }}
            >
              <Text style={[styles.sectionTitle, styles.accordionTitleText]}>
                Instructions
              </Text>
              <Ionicons
                name={instructionsOpen ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={COLORS.subtext}
              />
            </Pressable>

            {instructionsOpen ? (
              <View style={styles.instructionsBody}>
                {recipe.instructions.map((line, index) => (
                  <View key={index} style={styles.instructionRow}>
                    <Text style={styles.instructionIndex}>{index + 1}.</Text>
                    <Text style={styles.instructionText}>{line}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.cookBtn,
                pressed && styles.cookBtnPressed,
              ]}
              onPress={onStartCooking}
            >
              <Ionicons name="restaurant-outline" size={20} color={COLORS.surface} />
              <Text style={styles.cookBtnText}>Start Cooking Mode</Text>
            </Pressable>
          </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  sheetWrap: {
    width: '100%',
    maxWidth: 400,
    zIndex: 1,
  },
  sheet: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 2,
    padding: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 8,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  title: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingRight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZE.small,
    color: '#7D7D7D',
    fontWeight: FONT_WEIGHT.medium,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
    marginBottom: SPACING.lg,
  },
  ingredientCell: {
    width: '50%',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  ingredientCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  ingredientCardInStock: {
    borderColor: 'rgba(22, 163, 74, 0.35)',
  },
  ingredientCardMissing: {
    borderColor: COLORS.border,
  },
  ingredientImageWrap: {
    height: 88,
    position: 'relative',
    backgroundColor: COLORS.muted,
  },
  ingredientImage: {
    width: '100%',
    height: '100%',
  },
  ingredientImageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadgeOk: {
    backgroundColor: COLORS.primary,
  },
  stockBadgeNo: {
    backgroundColor: COLORS.subtext,
  },
  ingredientTextBlock: {
    padding: SPACING.sm,
    alignItems: 'center',
  },
  ingredientTextInStock: {
    backgroundColor: '#F0FDF4',
  },
  ingredientName: {
    fontSize: FONT_SIZE.small,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  ingredientQty: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    textAlign: 'center',
  },
  accordionTitleText: {
    marginBottom: 0,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  instructionsBody: {
    marginBottom: SPACING.lg,
    paddingLeft: SPACING.xs,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  instructionIndex: {
    fontSize: FONT_SIZE.small,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    minWidth: 22,
  },
  instructionText: {
    flex: 1,
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    lineHeight: 20,
  },
  cookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  cookBtnPressed: {
    opacity: 0.92,
  },
  cookBtnText: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },
});
