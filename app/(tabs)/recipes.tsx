import { CookingModeModal } from '@/components/recipes/CookingModeModal';
import type { RecipeItem } from '@/components/recipes/RecipeCard';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { RecipeDetailsModal } from '@/components/recipes/RecipeDetailsModal';
import { recipesScreenStyles } from '@/components/recipes/recipes.styles';
import { SearchBar } from '@/components/ui/SearchBar';
import { COLORS } from '@/constants/colors';
import { recipes } from '@/constants/mockData';
import { SPACING } from '@/constants/spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';
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

  // Split the header into three parts: Profile, Title, and Sticky Controls
  const listData = useMemo(() => {
    let list = recipes as RecipeItem[];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      );
    }
    if (filterId && filterId !== 'all') {
      const difficulty = filterId.charAt(0).toUpperCase() + filterId.slice(1);
      list = list.filter((r) => r.difficulty === difficulty);
    }

    return [
      { id: 'profile-item', type: 'profile' },  // Index 0: Scrolls away
      { id: 'title-item', type: 'title' },      // Index 1: Scrolls away
      { id: 'sticky-controls', type: 'sticky' }, // Index 2: STICKS TO TOP
      ...list.map(item => ({ ...item, type: 'recipe' }))
    ];
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

  const renderItem: ListRenderItem<any> = ({ item }) => {
    // 1. Profile Icon (Scrolls)
    if (item.type === 'profile') {
      return (
        <View style={styles.profileRow}>
          <Pressable
            style={styles.profileBtn}
            onPress={() => router.push('/profile')}
            hitSlop={8}>
            <Ionicons name="person" size={22} color={COLORS.surface} />
          </Pressable>
        </View>
      );
    }

    // 2. Main Title (Scrolls)
    if (item.type === 'title') {
      return (
        <View style={styles.titleContainer}>
          <Text style={recipesScreenStyles.pageTitle}>Recipe Suggestions</Text>
          <Text style={recipesScreenStyles.pageSubtitle}>
            Based on your current inventory
          </Text>
        </View>
      );
    }

    // 3. Search & Filter (Sticks to Top)
    if (item.type === 'sticky') {
      return (
        <View style={styles.stickyHeader}>
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
              style={recipesScreenStyles.filterTrigger}
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

            {filterMenuOpen && (
              <View style={recipesScreenStyles.filterMenu}>
                {FILTER_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => selectFilter(opt.id)}
                    style={recipesScreenStyles.filterOption}
                  >
                    <Text style={[
                      recipesScreenStyles.filterOptionText, 
                      filterId === opt.id && recipesScreenStyles.filterOptionTextSelected
                    ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      );
    }

    // 4. Standard Recipe Card
    return (
      <View style={[recipesScreenStyles.cardWrap, { paddingHorizontal: SPACING.lg }]}>
        <RecipeCard
          recipe={item}
          onViewRecipe={() => openRecipeModal(item)}
          onBookmark={() => {}}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        style={recipesScreenStyles.listScroll}
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        // index 2 (Sticky Controls) stays at the top
        stickyHeaderIndices={[2]} 
        contentContainerStyle={{ paddingBottom: SPACING.xxl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

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

const styles = StyleSheet.create({
  // Ensures background behind status bar matches other screens
  safe: { flex: 1, backgroundColor: COLORS.background },
  profileRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: 5,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  stickyHeader: {
    backgroundColor: COLORS.background, // Important: recipes hide behind this
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingTop: 5,
    zIndex: 10,
  }
});