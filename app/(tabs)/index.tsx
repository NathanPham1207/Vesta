import { AttentionItemsModal } from '@/components/home/AttentionItemsModal';
import { CategoryDetailModal } from '@/components/home/CategoryDetailModal';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ExpiringSoonCard } from '@/components/home/ExpiringSoonCard';
import { FreshnessGuideCard } from '@/components/home/FreshnessGuideCard';
import { COLORS } from '@/constants/colors';
import {
  INITIAL_INVENTORY_ITEMS,
  itemRequiresAttention,
  toAttentionInventoryItem,
  type CategoryInventoryItem,
} from '@/constants/homeInventory';
import { categories } from '@/constants/mockData';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
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

  const deleteInventoryItem = useCallback((id: string) => {
    setInventoryItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* FIXED HEADER BANNER */}
      <View style={styles.fixedHeader}>
        <View style={styles.brandHeader}>
          <Image
            source={require('../../assets/images/logo_vesta_clean.png')}
            style={styles.headerLogo}
          />
          <View>
            <Text style={styles.brand}>Vesta</Text>
            <Text style={styles.brandSubtitle}>Smart Inventory</Text>
          </View>
        </View>

        <Pressable
          style={styles.profileBtn}
          onPress={() => router.push('/profile')}
          hitSlop={8}>
          <Ionicons name="person" size={22} color={COLORS.surface} />
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
    backgroundColor: COLORS.background 
  },
  fixedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Moved up to match scrolling headers
    paddingHorizontal: SPACING.lg,
    paddingTop: 5, // Tightened to match the status bar clearance on other screens
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  brandHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.sm 
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  scroll: { 
    flex: 1 
  },
  content: { 
    paddingHorizontal: SPACING.lg, 
    paddingBottom: SPACING.xxl, 
    paddingTop: SPACING.md
  },
  headerLogo: { 
    width: 40, 
    height: 40, 
    resizeMode: 'contain' 
  },
  brand: { 
    fontSize: FONT_SIZE.h2, 
    fontWeight: FONT_WEIGHT.bold, 
    color: COLORS.primary 
  },
  brandSubtitle: { 
    fontSize: FONT_SIZE.small, 
    color: COLORS.subtext, 
    fontWeight: FONT_WEIGHT.medium 
  },
  spacer: { 
    height: SPACING.lg 
  },
});