import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CategoryDetailView } from '@/components/inventory/CategoryDetailView';
import { COLORS } from '@/constants/colors';

export default function CategoryDetailScreen() {
  const params = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
    itemCount?: string;
  }>();

  const categoryId = params.categoryId ?? '';
  const categoryName = params.categoryName ?? 'Category';
  const itemCount =
    typeof params.itemCount === 'string' && params.itemCount.length > 0
      ? Number(params.itemCount)
      : undefined;

  return (
    <RequireAuth>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <CategoryDetailView
          categoryId={categoryId}
          categoryName={categoryName}
          itemCount={itemCount}
        />
      </SafeAreaView>
    </RequireAuth>
  );
}

