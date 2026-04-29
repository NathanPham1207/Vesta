import { Crown } from 'lucide-react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';

// ─── RankTier ─────────────────────────────────────────────────────────────────
// Defined here to avoid circular imports (InventoryContext imports from here).

export type RankTier = 'Novice' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

// ─── Thresholds ───────────────────────────────────────────────────────────────
// Points needed to REACH each tier.
// Scoring: 1 ingredient = 10 points. Cook a recipe → ingredients.length × 10 pts.

const TIER_THRESHOLDS: Record<RankTier, number> = {
  Novice:   0,
  Bronze:   150,
  Silver:   300,
  Gold:     600,
  Platinum: 1200,
  Diamond:  2400,
  Master:   4800,
};

export const ORDERED_TIERS: RankTier[] = [
  'Novice', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getRankTier = (points: number): RankTier => {
  if (points >= TIER_THRESHOLDS.Master)   return 'Master';
  if (points >= TIER_THRESHOLDS.Diamond)  return 'Diamond';
  if (points >= TIER_THRESHOLDS.Platinum) return 'Platinum';
  if (points >= TIER_THRESHOLDS.Gold)     return 'Gold';
  if (points >= TIER_THRESHOLDS.Silver)   return 'Silver';
  if (points >= TIER_THRESHOLDS.Bronze)   return 'Bronze';
  return 'Novice';
};

export const getRankColor = (
  tier: RankTier,
): { bg: string; text: string; gradient: string[]; crownColor: string } => {
  const colors: Record<
    RankTier,
    { bg: string; text: string; gradient: string[]; crownColor: string }
  > = {
    Novice: {
      bg: '#F9FAFB',
      text: '#6B7280',
      gradient: ['#D1D5DB', '#9CA3AF'],
      crownColor: '#9CA3AF',
    },
    Bronze: {
      bg: '#FFEDD5',
      text: '#C2410C',
      gradient: ['#FB923C', '#EA580C'],
      crownColor: '#CD7F32',
    },
    Silver: {
      bg: '#F3F4F6',
      text: '#374151',
      gradient: ['#D1D5DB', '#6B7280'],
      crownColor: '#C0C0C0',
    },
    Gold: {
      bg: '#FEF9C3',
      text: '#A16207',
      gradient: ['#FACC15', '#CA8A04'],
      crownColor: '#FFD700',
    },
    Platinum: {
      bg: '#CFFAFE',
      text: '#0E7490',
      gradient: ['#67E8F9', '#0891B2'],
      crownColor: '#E5E4E2',
    },
    Diamond: {
      bg: '#F3E8FF',
      text: '#7E22CE',
      gradient: ['#C084FC', '#EC4899'],
      crownColor: '#B9F2FF',
    },
    Master: {
      bg: '#FEE2E2',
      text: '#B91C1C',
      gradient: ['#F87171', '#DC2626'],
      crownColor: '#FF0000',
    },
  };
  return colors[tier];
};

export const getTierLabel = (tier: RankTier): string => {
  if (tier === 'Novice') return 'Novice';
  return `${tier} Chef`;
};

export const getNextRank = (
  tier: RankTier,
): { tier: RankTier; points: number } | null => {
  const currentIndex = ORDERED_TIERS.indexOf(tier);
  if (currentIndex === -1 || currentIndex === ORDERED_TIERS.length - 1) return null;
  const nextTier = ORDERED_TIERS[currentIndex + 1];
  return { tier: nextTier, points: TIER_THRESHOLDS[nextTier] };
};

export const getProgressToNextRank = (
  points: number,
  currentTier: RankTier,
): number => {
  const next = getNextRank(currentTier);
  if (!next) return 100;

  const currentThreshold = TIER_THRESHOLDS[currentTier];
  const range = next.points - currentThreshold;
  if (range <= 0) return 100;

  const progress = ((points - currentThreshold) / range) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

// ─── CrownIcon ────────────────────────────────────────────────────────────────
// Shown in profile rank box. Hidden for Novice.

export const CrownIcon = ({
  tier,
  size = 24,
}: {
  tier: RankTier;
  size?: number;
}) => {
  if (tier === 'Novice') return null;

  const colors = getRankColor(tier);
  return (
    <View style={{ width: size, height: size }}>
      <Crown
        size={size}
        color={colors.crownColor}
        fill={colors.crownColor}
        strokeWidth={1.5}
      />
    </View>
  );
};

// ─── ChefHatBadge ─────────────────────────────────────────────────────────────
// Small crown badge overlaid on the profile avatar, shown when tier > Novice.

export const ChefHatBadge = ({
  tier,
  size = 24,
}: {
  tier: RankTier;
  size?: number;
}) => {
  if (tier === 'Novice') return null;

  const colors = getRankColor(tier);

  return (
    <View
      style={[
        badgeStyles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.bg,
          borderColor: colors.crownColor + '80',
        },
      ]}
    >
      <Crown
        size={size * 0.55}
        color={colors.crownColor}
        fill={colors.crownColor}
        strokeWidth={1.5}
      />
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    } as object),
  },
});
