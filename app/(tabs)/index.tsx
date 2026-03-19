import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/ui/AppHeader';
import { FreshnessGuideCard } from '@/components/home/FreshnessGuideCard';
import { ExpiringSoonCard } from '@/components/home/ExpiringSoonCard';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { categories, expiringSoonCount } from '@/constants/mockData';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Vesta"
        rightAction={{
          onPress: () => {},
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FreshnessGuideCard />
        <View style={styles.spacer} />
        <ExpiringSoonCard count={expiringSoonCount} />
        <View style={styles.spacer} />
        <CategoryGrid categories={categories} />
      </ScrollView>
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
  },
  spacer: {
    height: SPACING.lg,
  },
});
