import { MonthSelector } from '@/components/receipts/MonthSelector';
import type { ReceiptItem } from '@/components/receipts/ReceiptHistoryCard';
import { ReceiptHistoryCard } from '@/components/receipts/ReceiptHistoryCard';
import { ReceiptSummaryCard } from '@/components/receipts/ReceiptSummaryCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { COLORS } from '@/constants/colors';
import { receiptSummary, receipts } from '@/constants/mockData';
import { SPACING } from '@/constants/spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, ListRenderItem, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReceiptsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [monthId, setMonthId] = useState<string | null>('all');

  const filteredReceipts = useMemo(() => {
    if (!search.trim()) return receipts;
    const q = search.toLowerCase();
    return receipts.filter((r) => r.storeName.toLowerCase().includes(q) || r.purchaseDate.includes(q));
  }, [search]);

  const renderItem: ListRenderItem<ReceiptItem> = ({ item }) => (
    <View style={styles.cardWrap}>
      <ReceiptHistoryCard receipt={item} onPress={() => {}} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filteredReceipts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* SCROLLING PROFILE ICON ROW */}
            <View style={styles.iconRow}>
              <Pressable style={styles.profileBtn} onPress={() => router.push('/profile')}>
                <Ionicons name="person" size={22} color={COLORS.surface} />
              </Pressable>
            </View>

            <SectionTitle title="Purchase History" subtitle="Your receipt and spending summary" />
            <ReceiptSummaryCard
              totalReceipts={receiptSummary.totalReceipts}
              totalSpent={receiptSummary.totalSpent}
              averagePerTrip={receiptSummary.averagePerTrip}
            />
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search by store or date..." />
            <MonthSelector
              months={[{ id: 'all', label: 'All' }, { id: '2025-03', label: 'Mar 2025' }]}
              selectedId={monthId}
              onSelect={(id) => setMonthId(id)}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  iconRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginBottom: 10,
    paddingTop: SPACING.sm 
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { paddingBottom: SPACING.md },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  cardWrap: { marginBottom: SPACING.md },
});