import { RankTier } from '@/contexts/InventoryContext'; //
import { Crown } from 'lucide-react-native'; //
import React from 'react';
import { View } from 'react-native';

export const getRankTier = (points: number): RankTier => {
  if (points >= 10000) return 'Master'; //
  if (points >= 5000) return 'Diamond'; //
  if (points >= 2500) return 'Platinum'; //
  if (points >= 1000) return 'Gold'; //
  if (points >= 300) return 'Silver'; //
  return 'Bronze'; //
};

export const getRankColor = (tier: RankTier) => {
  // Swapped Tailwind strings for hex codes that work in React Native styles
  const colors: Record<RankTier, { bg: string; text: string; gradient: string[]; crownColor: string }> = {
    Bronze: { 
      bg: '#FFEDD5', // bg-orange-100
      text: '#C2410C', // text-orange-700
      gradient: ['#FB923C', '#EA580C'], // orange-400 to orange-600
      crownColor: '#CD7F32' //
    },
    Silver: { 
      bg: '#F3F4F6', // bg-gray-100
      text: '#374151', // text-gray-700
      gradient: ['#D1D5DB', '#6B7280'], // gray-300 to gray-500
      crownColor: '#C0C0C0' //
    },
    Gold: { 
      bg: '#FEF9C3', // bg-yellow-100
      text: '#A16207', // text-yellow-700
      gradient: ['#FACC15', '#CA8A04'], // yellow-400 to yellow-600
      crownColor: '#FFD700' //
    },
    Platinum: { 
      bg: '#CFFAFE', // bg-cyan-100
      text: '#0E7490', // text-cyan-700
      gradient: ['#67E8F9', '#0891B2'], // cyan-300 to cyan-500
      crownColor: '#E5E4E2' //
    },
    Diamond: { 
      bg: '#F3E8FF', // bg-purple-100
      text: '#7E22CE', // text-purple-700
      gradient: ['#C084FC', '#EC4899'], // purple-400 to pink-500
      crownColor: '#B9F2FF' //
    },
    Master: { 
      bg: '#FEE2E2', // bg-red-100
      text: '#B91C1C', // text-red-700
      gradient: ['#F87171', '#DC2626'], // red-400 to red-600
      crownColor: '#FF0000' //
    },
  };
  return colors[tier];
};

export const getNextRank = (tier: RankTier): { tier: RankTier; points: number } | null => {
  const ranks: { tier: RankTier; points: number }[] = [
    { tier: 'Bronze', points: 0 },
    { tier: 'Silver', points: 300 },
    { tier: 'Gold', points: 1000 },
    { tier: 'Platinum', points: 2500 },
    { tier: 'Diamond', points: 5000 },
    { tier: 'Master', points: 10000 },
  ]; //
  
  const currentIndex = ranks.findIndex(r => r.tier === tier); //
  if (currentIndex === -1 || currentIndex === ranks.length - 1) return null; //
  
  return ranks[currentIndex + 1]; //
};

export const getProgressToNextRank = (points: number, currentTier: RankTier): number => {
  const nextRank = getNextRank(currentTier); //
  if (!nextRank) return 100; //
  
  const thresholds: Record<RankTier, number> = {
    Bronze: 0, Silver: 300, Gold: 1000, Platinum: 2500, Diamond: 5000, Master: 10000
  }; //
  
  const currentThreshold = thresholds[currentTier] || 0; //
  const progress = ((points - currentThreshold) / (nextRank.points - currentThreshold)) * 100; //
  return Math.min(Math.max(progress, 0), 100); //
};

export const CrownIcon = ({ tier, size = 24 }: { tier: RankTier; size?: number }) => {
  if (tier === 'Bronze') return null; //
  
  const colors = getRankColor(tier); //
  if (!colors?.crownColor) return null; //
  
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Crown 
        size={size} //
        color={colors.crownColor} //
        fill={colors.crownColor} //
        strokeWidth={1.5} //
      />
    </View>
  );
};