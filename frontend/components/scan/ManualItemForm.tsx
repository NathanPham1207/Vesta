import { AppInput } from '@/components/ui/AppInput';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const MANUAL_ITEM_CATEGORIES = [
  'Bakery',
  'Dairy',
  'Fruits',
  'Vegetables',
  'Frozen',
  'Meat',
  'Seafood',
  'Beverages',
  'Pantry',
  'Snacks',
  'Condiments',
  'Misc',
] as const;

export type ManualItemCategory = (typeof MANUAL_ITEM_CATEGORIES)[number];

export type ManualItemFormValues = {
  name: string;
  category: ManualItemCategory | '';
  quantity: string;
  purchaseDate: string;
  expiryDate: string;
};

export type ManualItemFormErrors = Partial<Record<keyof ManualItemFormValues, string>>;

type ManualItemFormProps = {
  values: ManualItemFormValues;
  errors: ManualItemFormErrors;
  onChange: <K extends keyof ManualItemFormValues>(field: K, value: ManualItemFormValues[K]) => void;
};

export function ManualItemForm({ values, errors, onChange }: ManualItemFormProps) {
  return (
    <View>
      <AppInput
        label="Item name *"
        placeholder="e.g. Greek yogurt"
        value={values.name}
        onChangeText={(value) => onChange('name', value)}
        error={errors.name}
      />

      <Text style={styles.fieldLabel}>Category *</Text>
      <View style={styles.categoryWrap}>
        {MANUAL_ITEM_CATEGORIES.map((category) => {
          const selected = values.category === category;
          return (
            <Pressable
              key={category}
              onPress={() => onChange('category', category)}
              style={({ pressed }) => [
                styles.categoryChip,
                selected && styles.categoryChipSelected,
                pressed && styles.categoryChipPressed,
              ]}
            >
              <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{category}</Text>
            </Pressable>
          );
        })}
      </View>
      {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

      <AppInput
        label="Quantity *"
        placeholder="1"
        keyboardType="numeric"
        value={values.quantity}
        onChangeText={(value) => onChange('quantity', value)}
        error={errors.quantity}
      />

      <AppInput
        label="Purchase date (optional)"
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
        value={values.purchaseDate}
        onChangeText={(value) => onChange('purchaseDate', value)}
        error={errors.purchaseDate}
      />

      <AppInput
        label="Expiry date (optional)"
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
        value={values.expiryDate}
        onChangeText={(value) => onChange('expiryDate', value)}
        error={errors.expiryDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipPressed: {
    opacity: 0.85,
  },
  categoryText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  categoryTextSelected: {
    color: COLORS.surface,
  },
  errorText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.danger,
    marginBottom: SPACING.md,
  },
});
