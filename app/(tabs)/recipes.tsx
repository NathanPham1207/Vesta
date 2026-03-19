import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterBar } from '@/components/ui/FilterBar';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import type { RecipeItem } from '@/components/recipes/RecipeCard';
import { recipes } from '@/constants/mockData';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

export default function RecipesScreen() {
  const [search, setSearch] = useState('');
  const [filterId, setFilterId] = useState<string | null>('all');

  const filtered = useMemo(() => {
    let list = recipes as RecipeItem[];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    if (filterId && filterId !== 'all') {
      const difficulty = filterId.charAt(0).toUpperCase() + filterId.slice(1);
      list = list.filter((r) => r.difficulty === difficulty);
    }
    return list;
  }, [search, filterId]);

  const renderItem: ListRenderItem<RecipeItem> = ({ item }) => (
    <View style={styles.cardWrap}>
      <RecipeCard
        recipe={item}
        onViewRecipe={() => {}}
        onBookmark={() => {}}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <SectionTitle
          title="Recipe Suggestions"
          subtitle="Based on what you have in your inventory"
        />
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search recipes..."
        />
        <FilterBar
          options={FILTER_OPTIONS}
          selectedId={filterId}
          onSelect={(id) => setFilterId(id)}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  cardWrap: {
    marginBottom: SPACING.lg,
  },
});
