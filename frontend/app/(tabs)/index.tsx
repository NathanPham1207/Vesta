import { AttentionItemsModal } from '@/components/home/AttentionItemsModal';
import { CategoryDetailModal } from '@/components/home/CategoryDetailModal';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ExpiringSoonCard } from '@/components/home/ExpiringSoonCard';
import { FreshnessGuideCard } from '@/components/home/FreshnessGuideCard';
import { CATEGORIES } from '@/constants/categories';
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
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { deleteInventory, getInventory, type InventoryItem } from '@/services/auth/inventoryApi';
import {
  categoryToId,
  getPriorityLotToDelete,
  groupInventoryItems
} from '@/utils/inventoryGrouping';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ProfileAvatarButton } from '@/components/ui/ProfileAvatarButton';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [rawInventoryLots, setRawInventoryLots] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const inventoryItems = useMemo<CategoryInventoryItem[]>(
    () => groupInventoryItems(rawInventoryLots),
    [rawInventoryLots],
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
      CATEGORIES.map((c) => ({
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
        const cat = CATEGORIES.find((c) => c.id === it.categoryId);
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
        ? rawInventoryLots.filter(
            (lot) => categoryToId(lot.category) === categoryModalId,
          )
        : [],
    [rawInventoryLots, categoryModalId],
  );

  const loadInventory = useCallback(async () => {
    try {
      setLoadingInventory(true);
      setInventoryError(null);
      const items = await getInventory();
      setRawInventoryLots(items);
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

  const deleteRawInventoryItem = useCallback(async (itemId: string) => {
    if (!itemId) return;
    try {
      await deleteInventory(itemId);
      setRawInventoryLots((prev) => prev.filter((lot) => lot.id !== itemId));
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete inventory item.');
    }
  }, []);


  const deleteAttentionItem = useCallback(
    async (groupId: string) => {
      const group = inventoryItems.find((item) => item.id === groupId);
      if (!group) return;

      const targetLot = getPriorityLotToDelete(group.lots);
      if (!targetLot?.id) {
        Alert.alert('Error', 'Unable to resolve a lot to delete.');
        return;
      }

      try {
        await deleteInventory(targetLot.id);
        await loadInventory();
      } catch (error) {
        console.error('Delete attention lot error:', error);
        Alert.alert('Error', 'Failed to delete inventory item.');
      }
    },
    [inventoryItems, loadInventory],
  );

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
        <ProfileAvatarButton />
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
        onDeleteItem={deleteRawInventoryItem}
        onClose={() => setCategoryModalId(null)}
      />
      <AttentionItemsModal
        visible={attentionModalVisible}
        onClose={() => setAttentionModalVisible(false)}
        attentionItems={attentionDisplayItems}
        attentionCount={attentionCount}
        onDeleteItem={deleteAttentionItem}
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
