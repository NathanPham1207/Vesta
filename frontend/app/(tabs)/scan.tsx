import { ConfirmScanModal } from '@/components/scan/ConfirmScanModal';
import { ManualAddCard } from '@/components/scan/ManualAddCard';
import { ManualItemModal, type ManualItemSubmitInput } from '@/components/scan/ManualItemModal';
import { ScanActionCard } from '@/components/scan/ScanActionCard';
import { ScanLoadingOverlay } from '@/components/scan/ScanLoadingOverlay';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { saveInventory } from '@/services/auth/inventoryApi';
import { saveReceipt } from '@/services/auth/receiptApi';
import type { ScanAnalysisResult, ScanFailureReason } from '@/services/auth/scanApi';
import { scanReceipt } from '@/services/auth/scanApi';
import {
  buildInventoryItemsFromScan,
  buildManualInventoryItem,
  getScanFailureMessage,
  getUnexpectedScanErrorMessage,
  normalizeScanResponse,
  SCAN_GENERIC_FAILURE_MESSAGE,
} from '@/utils/scan';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Component ───────────────────────────────────────────────────────────────

export default function ScanScreen() {
  const router = useRouter();

  const [scanResult, setScanResult] = React.useState<ScanAnalysisResult | null>(null);
  const [receiptPreviewUri, setReceiptPreviewUri] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = React.useState(false);
  const [isManualModalVisible, setIsManualModalVisible] = React.useState(false);

  // ─── Scan flow ─────────────────────────────────────────────────────────────

  const resetScanState = React.useCallback(() => {
    setIsConfirmModalVisible(false);
    setScanResult(null);
    setReceiptPreviewUri(null);
  }, []);

  const handleScan = React.useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      resetScanState();
      setLoading(true);

      try {
        const response = await scanReceipt({
          uri: asset.uri ?? null,
          fileName: asset.fileName ?? null,
          mimeType: asset.mimeType ?? 'image/jpeg',
        });

        if (!response || typeof response !== 'object' || !('success' in response)) {
          Alert.alert('Scan Failed', SCAN_GENERIC_FAILURE_MESSAGE);
          return;
        }

        if (!response.success) {
          const reason = response.reason as ScanFailureReason | undefined;
          Alert.alert('Scan Failed', getScanFailureMessage(reason ?? null));
          return;
        }

        const result = normalizeScanResponse(response);
        if (!result) {
          Alert.alert('Scan Failed', getScanFailureMessage('no_food_items_detected'));
          return;
        }

        setReceiptPreviewUri(asset.uri ?? null);
        setScanResult(result);
        setIsConfirmModalVisible(true);
      } catch (error) {
        Alert.alert('Scan Failed', getUnexpectedScanErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [resetScanState],
  );

  const takePhoto = React.useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to scan images.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.length > 0) {
      await handleScan(result.assets[0]);
    }
  }, [handleScan]);

  const uploadFromGallery = React.useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.length > 0) {
      await handleScan(result.assets[0]);
    }
  }, [handleScan]);

  // ─── Confirm modal actions ──────────────────────────────────────────────────

  const confirmScan = React.useCallback(async () => {
    if (!scanResult) return;
   
    const items = buildInventoryItemsFromScan(scanResult);
    if (items.length === 0) {
      Alert.alert('No Items', 'No scanned items are available to save.');
      return;
    }
   
    try {
      setSaving(true);
   
      // Lưu inventory và receipt song song
      await Promise.all([
        saveInventory({ items }),
        saveReceipt({
          storeName: scanResult.storeName ?? 'Unknown store',
          purchaseDate: scanResult.purchaseDate ?? new Date().toISOString(),
          imageType: scanResult.imageType,
          items: scanResult.items,
        }),
      ]);
   
      resetScanState();
      Alert.alert('Success', 'Items saved to inventory.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (error) {
      Alert.alert('Save Failed', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [resetScanState, router, scanResult]);

  const handleRetake = React.useCallback(async () => {
    resetScanState();
    await takePhoto();
  }, [resetScanState, takePhoto]);

  // ─── Manual add actions ────────────────────────────────────────────────────

  const submitManualItem = React.useCallback(
    async (input: ManualItemSubmitInput) => {
      await saveInventory({ items: [buildManualInventoryItem(input)] });
    },
    [],
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRightAvatarRow}>
        <Pressable style={styles.avatarBtn} onPress={() => router.push('/profile')} hitSlop={10}>
          <Text style={styles.avatarIcon}>👤</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ScanActionCard
            onTakePhoto={takePhoto}
            onUploadFromGallery={uploadFromGallery}
          />
          <View style={styles.manualCard}>
            <ManualAddCard onAddItem={() => setIsManualModalVisible(true)} />
          </View>
        </ScrollView>
      </View>

      <ConfirmScanModal
        visible={isConfirmModalVisible}
        scanResult={scanResult}
        receiptPreviewUri={receiptPreviewUri}
        saving={saving}
        onConfirm={() => void confirmScan()}
        onRetake={handleRetake}
        onClose={resetScanState}
      />

      <ManualItemModal
        visible={isManualModalVisible}
        onClose={() => setIsManualModalVisible(false)}
        onSubmit={submitManualItem}
      />

      <ScanLoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.xl * 2,
  },
  topRightAvatarRow: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.muted,
  },
  avatarIcon: {
    fontSize: 18,
  },
  manualCard: {
    marginTop: SPACING.xl,
  },
});
