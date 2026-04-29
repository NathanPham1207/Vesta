import { COLORS } from '@/constants/colors';
import { useInventory } from '@/contexts/InventoryContext';
import {
  ChefHatBadge,
  getRankColor,
  getRankTier,
} from '@/utils/rankings/rankUtils';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

interface ProfileAvatarButtonProps {
  /** Optional style applied to the outermost wrapper — use for positioning (absolute, margins, etc.) */
  style?: StyleProp<ViewStyle>;
  /** Diameter of the avatar circle. Ring adds ~6px around it. Default 40. */
  size?: number;
}

/**
 * Profile avatar button used in all 4 main tabs.
 * Shows a tier-colored ring + chef hat badge overlay.
 * Navigates to /profile on press.
 */
export function ProfileAvatarButton({ style, size = 40 }: ProfileAvatarButtonProps) {
  const router = useRouter();
  const { userRank } = useInventory();

  const currentTier = getRankTier(userRank.points);
  const rankColors = getRankColor(currentTier);
  const isNovice = currentTier === 'Novice';

  const ringSize = size + 8;          // 2px gap + 2px border on each side
  const ringRadius = ringSize / 2;
  const ringBorderWidth = isNovice ? 1.5 : 2.5;
  const ringBorderColor = isNovice ? COLORS.border : rankColors.crownColor;

  const avatarBg = isNovice ? COLORS.muted : rankColors.bg;

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable
        onPress={() => router.push('/profile')}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Profile"
        style={({ pressed }) => [
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringRadius,
            borderWidth: ringBorderWidth,
            borderColor: ringBorderColor,
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: avatarBg,
            },
          ]}
        >
          <Text style={[styles.icon, { fontSize: size * 0.43 }]}>👤</Text>
        </View>
      </Pressable>

      {/* Chef hat badge — hidden for Novice */}
      {!isNovice && (
        <View style={styles.badgeWrap}>
          <ChefHatBadge tier={currentTier} size={20} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Position is controlled by parent via `style` prop
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    lineHeight: undefined,
  },
  badgeWrap: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
});
