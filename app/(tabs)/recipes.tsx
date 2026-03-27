import { CookingModeModal } from '@/components/recipes/CookingModeModal';
import type { RecipeItem } from '@/components/recipes/RecipeCard';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { RecipeDetailsModal } from '@/components/recipes/RecipeDetailsModal';
import { recipesScreenStyles } from '@/components/recipes/recipes.styles';
import { SearchBar } from '@/components/ui/SearchBar';
import { COLORS } from '@/constants/colors';
import { recipes } from '@/constants/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
] as const;

export default function RecipesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterId, setFilterId] = useState<string | null>('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
  const [isRecipeModalVisible, setIsRecipeModalVisible] = useState(false);
  const [isCookingModeVisible, setIsCookingModeVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const filtered = useMemo(() => {
    let list = recipes as RecipeItem[];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      );
    }
    if (filterId && filterId !== 'all') {
      const difficulty = filterId.charAt(0).toUpperCase() + filterId.slice(1);
      list = list.filter((r) => r.difficulty === difficulty);
    }
    return list;
  }, [search, filterId]);

  const selectFilter = useCallback((id: string) => {
    setFilterId(id);
    setFilterMenuOpen(false);
  }, []);

  const openRecipeModal = useCallback((recipe: RecipeItem) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalVisible(true);
  }, []);

  const closeRecipeModal = useCallback(() => {
    setIsRecipeModalVisible(false);
    setIsCookingModeVisible(false);
    setSelectedRecipe(null);
    setCurrentStep(0);
  }, []);

  const startCookingMode = useCallback(() => {
    setCurrentStep(0);
    setIsRecipeModalVisible(false);
    setIsCookingModeVisible(true);
  }, []);

  const closeCookingMode = useCallback(() => {
    setIsCookingModeVisible(false);
    setCurrentStep(0);
    if (selectedRecipe) {
      setIsRecipeModalVisible(true);
    }
  }, [selectedRecipe]);

  const goNextStep = useCallback(() => {
    if (!selectedRecipe) return;
    const last = selectedRecipe.instructions.length - 1;
    if (currentStep >= last) {
      closeCookingMode();
      return;
    }
    setCurrentStep((s) => s + 1);
  }, [selectedRecipe, currentStep, closeCookingMode]);

  const goPreviousStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const renderItem: ListRenderItem<RecipeItem> = ({ item }) => (
    <View style={recipesScreenStyles.cardWrap}>
      <RecipeCard
        recipe={item}
        onViewRecipe={() => openRecipeModal(item)}
        onBookmark={() => {}}
      />
    </View>
  );

  return (
    <SafeAreaView style={recipesScreenStyles.safe} edges={['top']}>
      <View style={recipesScreenStyles.screenBody}>
        <View style={recipesScreenStyles.profileFixedLayer} pointerEvents="box-none">
          <Pressable
            style={recipesScreenStyles.profileBtn}
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            hitSlop={8}>
            <Ionicons name="person" size={22} color={COLORS.surface} />
          </Pressable>
        </View>

        <View style={recipesScreenStyles.contentLayer}>
          <View style={recipesScreenStyles.headerLayer}>
            <View style={recipesScreenStyles.headerRow}>
              <View style={recipesScreenStyles.titleBlock}>
                <Text style={recipesScreenStyles.pageTitle}>Recipe Suggestions</Text>
                <Text style={recipesScreenStyles.pageSubtitle}>
                  Recipes based on your current inventory
                </Text>
              </View>
            </View>

            <View style={recipesScreenStyles.searchSpacing}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search recipes..."
                variant="recipes"
              />
            </View>

            <View style={recipesScreenStyles.filterAnchor}>
              <Pressable
                onPress={() => setFilterMenuOpen((o) => !o)}
                style={({ pressed }) => [
                  recipesScreenStyles.filterTrigger,
                  pressed && recipesScreenStyles.filterTriggerPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ expanded: filterMenuOpen }}
                accessibilityLabel="Filters"
              >
                <View style={recipesScreenStyles.filterLeft}>
                  <Ionicons name="funnel-outline" size={20} color={COLORS.primary} />
                  <Text style={recipesScreenStyles.filterLabel}>Filters</Text>
                </View>
                <Ionicons
                  name={filterMenuOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={COLORS.subtext}
                />
              </Pressable>

              {filterMenuOpen ? (
                <View style={recipesScreenStyles.filterMenu}>
                  {FILTER_OPTIONS.map((opt, index) => {
                    const selected = filterId === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => selectFilter(opt.id)}
                        style={[
                          recipesScreenStyles.filterOption,
                          index === FILTER_OPTIONS.length - 1 &&
                            recipesScreenStyles.filterOptionLast,
                        ]}
                      >
                        <Text
                          style={[
                            recipesScreenStyles.filterOptionText,
                            selected &&
                              recipesScreenStyles.filterOptionTextSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>

          <FlatList
            style={recipesScreenStyles.listScroll}
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={recipesScreenStyles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => setFilterMenuOpen(false)}
            removeClippedSubviews={Platform.OS === 'android' ? false : undefined}
            ListEmptyComponent={
              <Text style={recipesScreenStyles.emptyText}>
                No recipes match your search or filters.
              </Text>
            }
          />
        </View>
      </View>

      <RecipeDetailsModal
        visible={isRecipeModalVisible && !isCookingModeVisible}
        recipe={selectedRecipe}
        onClose={closeRecipeModal}
        onStartCooking={startCookingMode}
      />

      <CookingModeModal
        visible={isCookingModeVisible}
        recipe={selectedRecipe}
        currentStep={currentStep}
        onClose={closeCookingMode}
        onPrevious={goPreviousStep}
        onNext={goNextStep}
      />
    </SafeAreaView>
  );
}
