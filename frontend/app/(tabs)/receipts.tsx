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
import { ReceiptSummaryCard } from '@/components/receipts/ReceiptSummaryCard';
import { ReceiptHistoryCard } from '@/components/receipts/ReceiptHistoryCard';
import type { ReceiptItem } from '@/components/receipts/ReceiptHistoryCard';
import { MonthSelector } from '@/components/receipts/MonthSelector';
import {
  receiptSummary,
  receipts,
} from '@/constants/mockData';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

const MONTHS = [
  { id: 'all', label: 'All' },
  { id: '2025-03', label: 'Mar 2025' },
  { id: '2025-02', label: 'Feb 2025' },
];

export default function ReceiptsScreen() {
  const [search, setSearch] = useState('');
  const [monthId, setMonthId] = useState<string | null>('all');

  const filteredReceipts = useMemo(() => {
    if (!search.trim()) return receipts;
    const q = search.toLowerCase();
    return receipts.filter(
      (r) =>
        r.storeName.toLowerCase().includes(q) ||
        r.purchaseDate.includes(q)
    );
  }, [search]);

  const summary = receiptSummary; // Could filter by monthId later

  const renderItem: ListRenderItem<ReceiptItem> = ({ item }) => (
    <View style={styles.cardWrap}>
      <ReceiptHistoryCard receipt={item} onPress={() => {}} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <SectionTitle
          title="Purchase History"
          subtitle="Your receipt and spending summary"
        />
        <ReceiptSummaryCard
          totalReceipts={summary.totalReceipts}
          totalSpent={summary.totalSpent}
          averagePerTrip={summary.averagePerTrip}
        />
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by store or date..."
        />
        <MonthSelector
          months={MONTHS}
          selectedId={monthId}
          onSelect={(id) => setMonthId(id)}
        />
      </View>
      <FlatList
        data={filteredReceipts}
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
    marginBottom: SPACING.md,
  },
});
