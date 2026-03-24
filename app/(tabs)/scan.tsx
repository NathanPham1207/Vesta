import { ManualAddCard } from '@/components/scan/ManualAddCard';
import { ScanActionCard } from '@/components/scan/ScanActionCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { saveInventory } from '@/services/auth/inventoryApi';
import { scanReceipt } from '@/services/auth/scanApi';
import {
  calculateExpiryDate,
  getDaysLeft,
  getExpiryDays,
  isExpiringSoon,
} from '@/utils/expiry';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScannedItem = {
  name: string;
  quantity: number | string;
  price?: number | string;
};

type ScanResult = {
  store?: string;
  purchaseDate?: string;
  items?: ScannedItem[];
};

type InventoryItem = {
  name: string;
  quantity: number;
  category: string;
  source: 'receipt';
  purchaseDate: string;
  createdAt: string;
  expiryDate: string;
  daysLeft: number;
  price?: number;
};

function inferCategory(name: string): string {
  const normalized = name.toLowerCase();

  if (/(milk|eggs?|cheese|yogurt)/.test(normalized)) return 'Dairy';
  if (/(bread|bun|cake)/.test(normalized)) return 'Bakery';
  if (/(apple|banana|orange)/.test(normalized)) return 'Fruits';
  if (/(juice|water|coke)/.test(normalized)) return 'Beverages';
  if (/(chicken|beef|pork)/.test(normalized)) return 'Meat';

  return 'Other';
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toInventoryItems(scanResult: ScanResult): InventoryItem[] {
  const createdAt = new Date().toISOString();
  const purchaseDate = scanResult.purchaseDate || createdAt;
  const items = scanResult.items ?? [];

  return items.map((item) => {
    const category = inferCategory(item.name);
    const expiryDays = getExpiryDays(item.name, category);
    const expiryDate = calculateExpiryDate(purchaseDate, expiryDays);
    const daysLeft = getDaysLeft(expiryDate);
    const parsedPrice = toNumber(item.price, NaN);
    const inventoryItem: InventoryItem = {
      name: item.name,
      quantity: Math.max(1, toNumber(item.quantity, 1)),
      category,
      source: 'receipt',
      purchaseDate,
      createdAt,
      expiryDate,
      daysLeft,
    };

    if (Number.isFinite(parsedPrice)) {
      inventoryItem.price = parsedPrice;
    }

    return inventoryItem;
  });
}

export default function ScanScreen() {
  const [scanResult, setScanResult] = React.useState<ScanResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const previewItems = React.useMemo(
    () => (scanResult ? toInventoryItems(scanResult) : []),
    [scanResult],
  );

  const handleScan = async (asset: any) => {
    try {
      setLoading(true);
      const data = await scanReceipt(asset);
      console.log("Scan result:", data);
      setScanResult(data);
    } catch (error) {
      console.error("Scan error:", error);
      Alert.alert("Error", "Failed to scan receipt.");
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
      console.log("Image asset:", asset);
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
      console.log("Image asset:", asset);
      await handleScan(asset);
    }
  };

  const addItemManually = () => {
    Alert.alert('Add Item', 'Manual item entry form will be available in a future update.');
  };

  const confirmScan = async () => {
    if (!scanResult?.items?.length) {
      Alert.alert('No Items', 'No scanned items available to save.');
      return;
    }

    try {
      setSaving(true);
      await saveInventory(previewItems);
      Alert.alert('Success', 'Items saved to inventory.');
      setScanResult(null);
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
              <Text>Store: {scanResult.store}</Text>
              <Text>Date: {scanResult.purchaseDate}</Text>

              {previewItems.map((item, index) => (
                <Text
                  key={index}
                  style={isExpiringSoon(item.daysLeft) ? styles.expiringSoonText : undefined}
                >
                  {item.name} - Qty: {item.quantity} - ${item.price ?? 0} ({item.daysLeft} days
                  {' '}
                  left
                  {isExpiringSoon(item.daysLeft) ? ' ⚠️ Expiring Soon' : ''}
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
