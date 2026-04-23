import { AppButton } from '@/components/ui/AppButton';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import type { ScanAnalysisResult, ScanItem } from '@/services/auth/scanApi';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// ─── Helpers (có thể move vào utils/scan.ts nếu dùng ở nhiều nơi) ───────────

function resolveItemName(item: ScanItem, index: number): string {
  const normalized = typeof item.name === 'string' ? item.name.trim() : '';
  return normalized || `Item ${index + 1}`;
}

function resolveItemCategory(item: ScanItem): string {
  return item.category?.trim() || 'Misc';
}

function resolveStoreName(result: ScanAnalysisResult): string {
  return result.storeName?.trim() || 'Unknown store';
}

function resolvePurchaseDate(result: ScanAnalysisResult): string {
  return result.purchaseDate || new Date().toISOString();
}

function formatPurchaseDate(dateString: string): string {
  return dateString.slice(0, 10);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  scanResult: ScanAnalysisResult | null;
  receiptPreviewUri: string | null;
  saving: boolean;
  onConfirm: () => void;
  onRetake: () => void;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const MODAL_LIST_MAX_HEIGHT = 220;
const RECEIPT_PREVIEW_HEIGHT = 140;

export function ConfirmScanModal({
  visible,
  scanResult,
  receiptPreviewUri,
  saving,
  onConfirm,
  onRetake,
  onClose,
}: Props) {
  const previewItems = scanResult?.items ?? [];
  const hasPreviewItems = previewItems.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet} pointerEvents="box-none">
          <View style={styles.card}>
            {/* Close button */}
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            {/* Header */}
            <Text style={styles.modalTitle}>Confirm Scanned Items</Text>
            <Text style={styles.modalSubtitle}>
              Review detected items before saving them to your inventory.
            </Text>

            {/* Receipt preview */}
            {receiptPreviewUri ? (
              <Image
                source={{ uri: receiptPreviewUri }}
                style={styles.previewImage}
              />
            ) : null}

            {/* Store & date meta */}
            {scanResult ? (
              <View style={styles.metaBlock}>
                <Text style={styles.metaLabel}>Store</Text>
                <Text style={styles.metaValue}>{resolveStoreName(scanResult)}</Text>

                <Text style={styles.metaLabel}>Purchase Date</Text>
                <Text style={styles.metaValue}>
                  {formatPurchaseDate(resolvePurchaseDate(scanResult))}
                </Text>
              </View>
            ) : null}

            {/* Items list */}
            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {previewItems.map((item, index) => (
                <View
                  key={`${item.name}-${item.category}-${index}`}
                  style={styles.itemRow}
                >
                  <Text style={styles.itemName}>{resolveItemName(item, index)}</Text>
                  <Text style={styles.itemText}>Qty: {item.quantity ?? 1} {item.unit ?? ''}</Text>
                  <Text style={styles.itemText}>
                    Price: {item.price != null ? `$${item.price}` : 'N/A'}
                  </Text>
                  <Text style={styles.itemText}>Category: {resolveItemCategory(item)}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Actions */}
            <AppButton
              title="Confirm"
              onPress={onConfirm}
              disabled={!hasPreviewItems}
              loading={saving}
              style={styles.primaryButton}
            />
            <AppButton
              title="Retake / Cancel"
              onPress={onRetake}
              variant="secondary"
              style={styles.secondaryButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    zIndex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 2,
    padding: SPACING.xs,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.subtext,
  },
  modalTitle: {
    marginBottom: SPACING.xs,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalSubtitle: {
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.subtext,
  },
  previewImage: {
    width: '100%',
    height: RECEIPT_PREVIEW_HEIGHT,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.muted,
  },
  metaBlock: {
    gap: 2,
    marginBottom: SPACING.md,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.subtext,
  },
  metaValue: {
    marginBottom: SPACING.xs,
    fontSize: 14,
    color: COLORS.text,
  },
  listScroll: {
    maxHeight: MODAL_LIST_MAX_HEIGHT,
    zIndex: 0,
  },
  listContent: {
    gap: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  itemRow: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  itemName: {
    marginBottom: 2,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemText: {
    fontSize: 13,
    color: COLORS.text,
  },
  primaryButton: {
    marginTop: SPACING.md,
  },
  secondaryButton: {
    marginTop: SPACING.sm,
  },
});
