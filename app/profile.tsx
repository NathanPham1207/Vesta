import { SectionTitle } from '@/components/ui/SectionTitle';
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
  ShoppingCart
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, signOut } = useAuth(); 
  const router = useRouter(); 
  const {
    inventory,
    bookmarkedRecipes,
    userRank,
    shoppingList,
  } = useInventory();

  const [showShoppingList, setShowShoppingList] = useState(false);

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
        
        {/* Back Button - Now inside the ScrollView to move with the screen */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
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
                  <View style={[styles.progressBarFill, { width: `${progressToNext}%`, backgroundColor: rankColors.text }]} />
                </View>
                <Text style={styles.progressLabel}>Progress to {nextRank.tier}: {Math.round(progressToNext)}%</Text>
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

        {/* Shopping List Summary */}
        <TouchableOpacity 
          style={styles.shoppingHeader} 
          onPress={() => setShowShoppingList(!showShoppingList)}
        >
          <View style={styles.row}>
            <ShoppingCart size={24} color="#ea580c" />
            <Text style={styles.sectionTitle}>Shopping List ({shoppingList.length})</Text>
          </View>
          <ChevronDown size={20} color={COLORS.subtext} style={{ transform: [{ rotate: showShoppingList ? '180deg' : '0deg' }] }} />
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.outlineButton}>
            <Settings size={20} color={COLORS.primary} />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.outlineButton, styles.logoutButton]} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" />
            <Text style={[styles.buttonText, { color: '#ef4444' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Small helper component for Stats
function StatCard({ title, count, icon }: { title: string, count: number, icon: any }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.rankHeader}>{icon}</View>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { 
    padding: SPACING.lg,
    paddingTop: SPACING.md, // Reduced padding since the button is no longer absolute
  },
  backButton: {
    marginBottom: SPACING.sm, // Spacing between the arrow and the title
    alignSelf: 'flex-start', // Keeps the button on the left
    padding: SPACING.sm,
    marginLeft: -SPACING.sm, // Offsets the padding to align perfectly with the title
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerGradient: { height: 80 },
  profileInfo: { flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.md, marginTop: -40 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  userDetails: { marginLeft: SPACING.sm, marginBottom: 5 },
  userName: { fontSize: 20, fontWeight: 'bold' },
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
  statCard: { flex: 1, backgroundColor: 'white', padding: SPACING.md, borderRadius: 12, alignItems: 'center' },
  statCount: { fontSize: 20, fontWeight: 'bold', marginVertical: 4 },
  statLabel: { fontSize: 12, color: COLORS.subtext },
  shoppingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: SPACING.md,
    borderRadius: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
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
  },
  logoutButton: { borderColor: '#fecaca' },
  buttonText: { fontWeight: '600' },
});