import { AppCard } from '@/components/ui/AppCard';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

export interface CategoryItem {
  id: string;
  title: string;
  icon: ImageSourcePropType;
  count: number;
}

interface CategoryCardProps {
  item: CategoryItem;
  onPress?: () => void;
}

export function CategoryCard({ item, onPress }: CategoryCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <AppCard padding="md" style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.top}>
            <View style={styles.iconWrapper}>
              <Image
                source={item.icon}
                style={styles.icon}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <Text style={styles.count}>{item.count}</Text>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 128,
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  top: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginBottom: 14,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  count: {
    fontSize: 26,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.subtext,
    marginTop: SPACING.sm,
  },
  pressed: {
    opacity: 0.9,
  },
});
