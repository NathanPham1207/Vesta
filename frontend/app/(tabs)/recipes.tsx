import type { RecipeItem } from '@/components/recipes/RecipeCard';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { CookingModeModal } from '@/components/recipes/CookingModeModal';
import { RecipeDetailsModal } from '@/components/recipes/RecipeDetailsModal';
import { SearchBar } from '@/components/ui/SearchBar';
import { ProfileAvatarButton } from '@/components/ui/ProfileAvatarButton';
import { recipesScreenStyles } from '@/components/recipes/recipes.styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/constants/colors';
import { useInventory } from '@/contexts/InventoryContext';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRecipes } from '@/services/data/recipesApi';
import { useFocusEffect } from 'expo-router';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
] as const;

export default function RecipesScreen() {
  const { savedRecipes, toggleSaveRecipe, pendingOpenRecipe, setPendingOpenRecipe, cookRecipe } = useInventory();

  const [search, setSearch] = useState('');
  const [filterId, setFilterId] = useState<string | null>('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
  const [isRecipeModalVisible, setIsRecipeModalVisible] = useState(false);
  const [isCookingModeVisible, setIsCookingModeVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const savedIds = useMemo(() => new Set(savedRecipes.map((r) => r.id)), [savedRecipes]);

  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const result = await getRecipes();
      setRecipes(result);
    } catch (error) {
      console.error('Failed to load recipes:', error);
      setLoadError('Failed to load recipes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  // Open modal when navigating from profile Saved section
  useFocusEffect(
    useCallback(() => {
      if (pendingOpenRecipe) {
        setSelectedRecipe(pendingOpenRecipe);
        setIsRecipeModalVisible(true);
        setIsCookingModeVisible(false);
        setCurrentStep(0);
        setPendingOpenRecipe(null);
      }
    }, [pendingOpenRecipe, setPendingOpenRecipe]),
  );

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
  }, [search, filterId, recipes]);

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
      // Award points before closing: 1 ingredient = 10 pts
      cookRecipe(selectedRecipe.id, selectedRecipe.ingredients.length);
      closeCookingMode();
      return;
    }
    setCurrentStep((s) => s + 1);
  }, [selectedRecipe, currentStep, closeCookingMode, cookRecipe]);

  const goPreviousStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const renderItem: ListRenderItem<RecipeItem> = ({ item }) => (
    <View style={recipesScreenStyles.cardWrap}>
      <RecipeCard
        recipe={item}
        onViewRecipe={() => openRecipeModal(item)}
        onBookmark={() => toggleSaveRecipe(item)}
        bookmarked={savedIds.has(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={recipesScreenStyles.safe} edges={['top']}>
      <View style={recipesScreenStyles.screenBody}>
        <View style={recipesScreenStyles.profileFixedLayer} pointerEvents="box-none">
          <ProfileAvatarButton style={recipesScreenStyles.profileBtn} />
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
                {loading
                  ? 'Loading recipes...'
                  : loadError ?? 'No recipes match your search or filters.'}
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
