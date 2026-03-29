import { ManualAddCard } from '@/components/scan/ManualAddCard';
import { ScanActionCard } from '@/components/scan/ScanActionCard';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const router = useRouter();

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    await ImagePicker.launchCameraAsync({ mediaTypes: ['images'] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* SCROLLING PROFILE ICON ROW */}
        <View style={styles.iconRow}>
          <Pressable style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <Ionicons name="person" size={22} color={COLORS.surface} />
          </Pressable>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Scan Receipt</Text>
          <Text style={styles.pageSubtitle}>Add items to your inventory automatically</Text>
        </View>

        <ScanActionCard onTakePhoto={takePhoto} onUploadFromGallery={() => {}} />
        <View style={styles.spacer} />
        <ManualAddCard onAddItem={() => {}} />
      </ScrollView>
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
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  titleSection: { marginBottom: SPACING.lg },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  pageSubtitle: { fontSize: 14, color: COLORS.subtext },
  spacer: { height: SPACING.xl },
});