import { ManualAddCard } from '@/components/scan/ManualAddCard';
import { ScanActionCard } from '@/components/scan/ScanActionCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { type InventoryItem, saveInventory } from '@/services/auth/inventoryApi';
import { scanReceipt } from '@/services/auth/scanApi';
import { getDaysLeft } from '@/utils/expiry';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScannedReceiptItem = {
  name: string;
  category: string;
  quantity: number;
  expiryDate: string;
  status?: 'fresh' | 'expiring soon' | 'expired';
};

type ScanResult = {
  success: boolean;
  items: ScannedReceiptItem[];
};

export default function ScanScreen() {
  const router = useRouter();
  const [scanResult, setScanResult] = React.useState<ScanResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const previewItems = scanResult?.items ?? [];

  const handleScan = async (asset: any) => {
    try {
      setLoading(true);
      const data = await scanReceipt(asset);
      if (!data?.success || !Array.isArray(data.items)) {
        throw new Error('Invalid scan response');
      }
      setScanResult(data);
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to scan receipt.');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to scan receipts.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      console.log('Image asset:', asset);
      await handleScan(asset);
    }
  };

  const uploadFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      console.log('Image asset:', asset);
      await handleScan(asset);
    }
  };

  const addItemManually = () => {
    Alert.alert('Add Item', 'Manual item entry form will be available in a future update.');
  };

  const confirmScan = async () => {
    if (!previewItems.length) {
      Alert.alert('No Items', 'No scanned items available to save.');
      return;
    }

    try {
      setSaving(true);

      const confirmedItems: InventoryItem[] = previewItems.map((item) => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
      }));

      await saveInventory(confirmedItems);

      setScanResult(null);

      Alert.alert('Success', 'Items saved to inventory.', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/');
          },
        },
      ]);
    } catch (error) {
      console.error('Save inventory error:', error);
      Alert.alert('Error', 'Failed to save items to inventory.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Scan"
        rightAction={{
          onPress: () => {},
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScanActionCard
          onTakePhoto={takePhoto}
          onUploadFromGallery={uploadFromGallery}
        />

        {loading ? <Text style={styles.loadingText}>Scanning...</Text> : null}

        {scanResult ? (
          <>
            <View style={styles.scanResultCard}>
              {previewItems.map((item, index) => (
                <Text
                  key={index}
                  style={item.status === 'expiring soon' ? styles.expiringSoonText : undefined}
                >
                  {item.name} - Qty: {item.quantity} - {item.category} (
                  {Math.max(0, getDaysLeft(item.expiryDate))} days left
                  {item.status === 'expiring soon' ? ' ⚠️ Expiring Soon' : ''}
                  )
                </Text>
              ))}
            </View>

            <AppButton
              title="Confirm"
              onPress={confirmScan}
              loading={saving}
              style={styles.confirmButton}
            />
          </>
        ) : null}

        <View style={styles.spacer} />
        <ManualAddCard onAddItem={addItemManually} />
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
    height: SPACING.xl,
  },
  scanResultCard: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
  },
  confirmButton: {
    marginTop: 12,
  },
  expiringSoonText: {
    color: COLORS.danger,
  },
});
