import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CategoryCard, CategoryItem } from './CategoryCard';
import { SPACING } from '@/constants/spacing';

interface CategoryGridProps {
  categories: CategoryItem[];
  onCategoryPress?: (id: string) => void;
}

export function CategoryGrid({ categories, onCategoryPress }: CategoryGridProps) {
  return (
    <View style={styles.grid}>
      {categories.map((item) => (
        <View key={item.id} style={styles.cell}>
          <CategoryCard
            item={item}
            onPress={
              onCategoryPress ? () => onCategoryPress(item.id) : undefined
            }
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.sm,
  },
  cell: {
    width: '50%',
    padding: SPACING.sm,
  },
});
