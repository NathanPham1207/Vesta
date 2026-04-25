import { SectionTitle } from '@/components/ui/SectionTitle';
import { SettingsModal } from '@/components/profile/SettingsModal';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/contexts/InventoryContext';
import { CrownIcon, getNextRank, getProgressToNextRank, getRankColor, getRankTier } from '@/utils/rankings/rankUtils';
import { useRouter } from 'expo-router';
import {
  Award,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const {
    inventory,
    bookmarkedRecipes,
    userRank,
    shoppingList,
    removeFromShoppingList,
  } = useInventory();

  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentTier = getRankTier(userRank?.points || 0);
  const rankColors = getRankColor(currentTier);
  const nextRank = getNextRank(currentTier);
  const progressToNext = getProgressToNextRank(userRank?.points || 0, currentTier);

  const handleLogout = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={COLORS.primary} />
        </TouchableOpacity>

        <SectionTitle
          title="My Profile"
          subtitle="Manage your kitchen rank and lists"
        />

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={[styles.headerGradient, { backgroundColor: rankColors.bg }]} />
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>

          {/* Rank Section */}
          <View style={[styles.rankBox, { backgroundColor: rankColors.bg + '20' }]}>
            <View style={styles.rankHeader}>
              <CrownIcon tier={currentTier} size={32} />
              <View>
                <Text style={[styles.rankTitle, { color: rankColors.text }]}>
                  {currentTier === 'Master' ? '??? Secret Rank' : `${currentTier} Chef`}
                </Text>
                <Text style={styles.pointsText}>{userRank?.points || 0} points</Text>
              </View>
            </View>
            {nextRank && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressToNext}%`, backgroundColor: rankColors.text },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  Progress to {nextRank.tier}: {Math.round(progressToNext)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Inventory" count={inventory.length} icon={<Package size={20} color={COLORS.primary} />} />
          <StatCard title="Saved" count={bookmarkedRecipes.length} icon={<Bookmark size={20} color="#2563eb" />} />
          <StatCard title="Cooked" count={userRank.cookedRecipes.length} icon={<Award size={20} color="#9333ea" />} />
        </View>

        {/* Shopping List */}
        <TouchableOpacity
          style={styles.shoppingHeader}
          onPress={() => setShowShoppingList(!showShoppingList)}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <ShoppingCart size={24} color="#ea580c" />
            <Text style={styles.sectionTitle}>Shopping List ({shoppingList.length})</Text>
          </View>
          <ChevronDown
            size={20}
            color={COLORS.subtext}
            style={{ transform: [{ rotate: showShoppingList ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>

        {showShoppingList && (
          <View style={styles.shoppingListContainer}>
            {shoppingList.length === 0 ? (
              <Text style={styles.emptyText}>No items in your shopping list.</Text>
            ) : (
              shoppingList.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.shoppingItem,
                    index === shoppingList.length - 1 && styles.shoppingItemLast,
                  ]}
                >
                  <View style={styles.shoppingItemInfo}>
                    <Text style={styles.shoppingItemName}>{item.name}</Text>
                    <Text style={styles.shoppingItemMeta}>
                      {[
                        item.quantity && item.unit ? `${item.quantity} ${item.unit}` : null,
                        item.category || null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeFromShoppingList(item.id)}
                    hitSlop={8}
                  >
                    <Trash2 size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.outlineButton} onPress={() => setShowSettings(true)}>
            <Settings size={20} color={COLORS.primary} />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={COLORS.danger} />
            <Text style={[styles.buttonText, { color: COLORS.danger }]}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
    </SafeAreaView>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ title, count, icon }: { title: string; count: number; icon: React.ReactNode }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.rankHeader}>{icon}</View>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    marginBottom: SPACING.sm,
    alignSelf: 'flex-start',
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerGradient: { height: 80 },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    marginTop: -40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  userDetails: { marginLeft: SPACING.sm, marginBottom: 5 },
  userName: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  userEmail: { color: COLORS.subtext, fontSize: 14 },
  rankBox: { margin: SPACING.md, padding: SPACING.md, borderRadius: 12 },
  rankHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankTitle: { fontSize: 18, fontWeight: 'bold' },
  pointsText: { fontSize: 12, color: COLORS.subtext },
  progressContainer: { marginTop: SPACING.md },
  progressBarBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  progressLabel: { fontSize: 11, marginTop: 4, color: COLORS.subtext },
  statsGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statCount: { fontSize: 20, fontWeight: 'bold', marginVertical: 4, color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.subtext },
  shoppingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  shoppingListContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
  },
  shoppingItemLast: {
    borderBottomWidth: 0,
  },
  shoppingItemInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  shoppingItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  shoppingItemMeta: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyText: {
    padding: SPACING.md,
    color: COLORS.subtext,
    fontSize: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  footer: { marginTop: SPACING.xl, gap: SPACING.md, paddingBottom: 40 },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
    backgroundColor: COLORS.surface,
  },
  logoutButton: { borderColor: '#fecaca' },
  buttonText: { fontWeight: '600', fontSize: 15, color: COLORS.text },
});
