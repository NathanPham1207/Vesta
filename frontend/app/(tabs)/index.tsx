import { AttentionItemsModal } from '@/components/home/AttentionItemsModal';
import { CategoryDetailModal } from '@/components/home/CategoryDetailModal';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ExpiringSoonCard } from '@/components/home/ExpiringSoonCard';
import { FreshnessGuideCard } from '@/components/home/FreshnessGuideCard';
import {
  CHROME_BAR_MIN_HEIGHT,
  CHROME_BAR_PADDING_BOTTOM,
  CHROME_BAR_PADDING_TOP,
  chromeBarBottomHairline,
  chromeBarShadow,
} from '@/constants/chromeBar';
import { COLORS } from '@/constants/colors';
import {
  type CategoryInventoryItem,
  itemRequiresAttention,
  toAttentionInventoryItem,
} from '@/constants/homeInventory';
import { categories } from '@/constants/mockData';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { deleteInventory, getInventory, type InventoryItem } from '@/services/auth/inventoryApi';
import { getDaysLeft } from '@/utils/expiry';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function categoryToId(category: string): string {
  const normalized = category.trim().toLowerCase();
  if (normalized === 'beverages') return '1';
  if (normalized === 'dairy') return '2';
  if (normalized === 'fruits') return '3';
  if (normalized === 'meat') return '5';
  if (normalized === 'vegetables') return '6';
  return '4';
}

function statusToFreshness(item: InventoryItem, daysLeft: number): CategoryInventoryItem['status'] {
  if (item.status === 'expired' || daysLeft < 0) return 'expired';
  if (item.status === 'expiring soon' || daysLeft <= 5) return 'good';
  return 'fresh';
}

function toCategoryInventoryItem(item: InventoryItem): CategoryInventoryItem {
  const daysLeft = getDaysLeft(item.expiryDate);
  const quantity = Number.isFinite(item.quantity) ? item.quantity : 1;
  return {
    id: item.id ?? `${item.name}-${item.expiryDate}`,
    name: item.name,
    categoryId: categoryToId(item.category),
    quantityLabel: `${quantity} item${quantity === 1 ? '' : 's'}`,
    daysLeft,
    status: statusToFreshness(item, daysLeft),
  };
}

export default function HomeScreen() {
  const [inventoryItems, setInventoryItems] = useState<CategoryInventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

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

  const loadInventory = useCallback(async () => {
    try {
      setLoadingInventory(true);
      setInventoryError(null);
      const items = await getInventory();
      setInventoryItems(items.map(toCategoryInventoryItem));
    } catch (error) {
      console.error('Inventory load error:', error);
      setInventoryError('Failed to load inventory.');
    } finally {
      setLoadingInventory(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [loadInventory])
  );

  const deleteInventoryItem = useCallback(async (id: string) => {
    try {
      await deleteInventory(id);
      await loadInventory();
    } catch (error) {
      console.error('Delete inventory error:', error);
      Alert.alert('Error', 'Failed to delete inventory item.');
    }
  }, [loadInventory]);

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
        {loadingInventory ? <Text style={styles.messageText}>Loading inventory...</Text> : null}
        {inventoryError ? (
          <Pressable style={styles.retryButton} onPress={loadInventory}>
            <Text style={styles.retryText}>{inventoryError} Tap to retry.</Text>
          </Pressable>
        ) : null}
        {!loadingInventory && !inventoryError && inventoryItems.length === 0 ? (
          <Text style={styles.messageText}>No inventory items yet.</Text>
        ) : null}
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
  messageText: {
    color: COLORS.subtext,
    marginBottom: SPACING.sm,
  },
  retryButton: {
    marginBottom: SPACING.sm,
  },
  retryText: {
    color: COLORS.danger,
    fontWeight: FONT_WEIGHT.medium,
  },
});
