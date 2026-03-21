import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AttentionItemsModal } from '@/components/home/AttentionItemsModal';
import { CategoryDetailModal } from '@/components/home/CategoryDetailModal';
import { FreshnessGuideCard } from '@/components/home/FreshnessGuideCard';
import { ExpiringSoonCard } from '@/components/home/ExpiringSoonCard';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { categories } from '@/constants/mockData';
import {
  INITIAL_INVENTORY_ITEMS,
  type CategoryInventoryItem,
  itemRequiresAttention,
  toAttentionInventoryItem,
} from '@/constants/homeInventory';
import {
  CHROME_BAR_MIN_HEIGHT,
  CHROME_BAR_PADDING_BOTTOM,
  CHROME_BAR_PADDING_TOP,
  chromeBarBottomHairline,
  chromeBarShadow,
} from '@/constants/chromeBar';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

export default function HomeScreen() {
  // TODO: Replace local inventory with Firestore subscription / context.
  const [inventoryItems, setInventoryItems] = useState<CategoryInventoryItem[]>(
    () => [...INITIAL_INVENTORY_ITEMS],
  );

  const [categoryModalId, setCategoryModalId] = useState<string | null>(null);
  const [attentionModalVisible, setAttentionModalVisible] = useState(false);

  const countsByCategory = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of inventoryItems) {
      m[it.categoryId] = (m[it.categoryId] ?? 0) + 1;
    }
    return m;
  }, [inventoryItems]);

  const categoriesWithCounts = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        count: countsByCategory[c.id] ?? 0,
      })),
    [countsByCategory],
  );

  const attentionSourceItems = useMemo(
    () => inventoryItems.filter(itemRequiresAttention),
    [inventoryItems],
  );

  const attentionCount = attentionSourceItems.length;

  const attentionDisplayItems = useMemo(
    () =>
      attentionSourceItems.map((it) => {
        const cat = categories.find((c) => c.id === it.categoryId);
        return toAttentionInventoryItem(it, cat?.title ?? '');
      }),
    [attentionSourceItems],
  );

  const selectedCategory = useMemo(
    () =>
      categoryModalId
        ? categoriesWithCounts.find((c) => c.id === categoryModalId) ?? null
        : null,
    [categoryModalId, categoriesWithCounts],
  );

  const categoryModalItems = useMemo(
    () =>
      categoryModalId
        ? inventoryItems.filter((i) => i.categoryId === categoryModalId)
        : [],
    [inventoryItems, categoryModalId],
  );

  // TODO: Replace local item deletion with Firebase delete.
  const deleteInventoryItem = useCallback((id: string) => {
    setInventoryItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/logo_vesta_clean.png')}
            style={styles.headerLogo}
          />
          <View style={styles.headerText}>
            <Text style={styles.brand}>Vesta</Text>
            <Text style={styles.brandSubtitle}>Smart Inventory</Text>
          </View>
        </View>
        <Pressable style={styles.avatarBtn} onPress={() => {}} hitSlop={10}>
          <Text style={styles.avatarIcon}>👤</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FreshnessGuideCard />
        <View style={styles.spacer} />
        <ExpiringSoonCard
          count={attentionCount}
          onPress={() => setAttentionModalVisible(true)}
        />
        <View style={styles.spacer} />
        <CategoryGrid
          categories={categoriesWithCounts}
          onCategoryPress={(id) => setCategoryModalId(id)}
        />
      </ScrollView>

      <CategoryDetailModal
        visible={selectedCategory !== null}
        category={selectedCategory}
        items={categoryModalItems}
        onDeleteItem={deleteInventoryItem}
        onClose={() => setCategoryModalId(null)}
      />
      <AttentionItemsModal
        visible={attentionModalVisible}
        onClose={() => setAttentionModalVisible(false)}
        attentionItems={attentionDisplayItems}
        attentionCount={attentionCount}
        onDeleteItem={deleteInventoryItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
  },
  spacer: {
    height: SPACING.lg,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: CHROME_BAR_PADDING_TOP,
    paddingBottom: CHROME_BAR_PADDING_BOTTOM,
    minHeight: CHROME_BAR_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...chromeBarBottomHairline,
    ...chromeBarShadow,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  headerText: {
    flexDirection: 'column',
    gap: 2,
  },
  brand: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    lineHeight: 28,
  },
  brandSubtitle: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    fontWeight: FONT_WEIGHT.medium,
    lineHeight: 18,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 18,
  },
});
