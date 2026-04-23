import { AppButton } from '@/components/ui/AppButton';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import React from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ManualItemForm,
  type ManualItemCategory,
  type ManualItemFormErrors,
  type ManualItemFormValues,
} from './ManualItemForm';

export type ManualItemSubmitInput = {
  name: string;
  category: ManualItemCategory;
  quantity: number;
  purchaseDate?: string;
  expiryDate?: string;
};

type ManualItemModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: ManualItemSubmitInput) => Promise<void>;
};

const INITIAL_VALUES: ManualItemFormValues = {
  name: '',
  category: '',
  quantity: '1',
  purchaseDate: '',
  expiryDate: '',
};

function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to save item right now. Please try again.';
}

function isValidDateInput(value: string): boolean {
  const normalized = value.trim();
  const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

  if (!datePattern.test(normalized)) {
    return false;
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === normalized;
}

export function ManualItemModal({ visible, onClose, onSubmit }: ManualItemModalProps) {
  const [formValues, setFormValues] = React.useState<ManualItemFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = React.useState<ManualItemFormErrors>({});
  const [saving, setSaving] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setFormValues(INITIAL_VALUES);
    setErrors({});
  }, []);

  React.useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  const setFieldValue = <K extends keyof ManualItemFormValues>(field: K, value: ManualItemFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const nextErrors: ManualItemFormErrors = {};
    const trimmedName = formValues.name.trim();
    const quantityValue = Number(formValues.quantity.trim());
    const purchaseDateValue = formValues.purchaseDate.trim();
    const expiryDateValue = formValues.expiryDate.trim();

    if (!trimmedName) {
      nextErrors.name = 'Please enter an item name.';
    }

    if (!formValues.category) {
      nextErrors.category = 'Please select a category.';
    }

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      nextErrors.quantity = 'Quantity must be greater than 0.';
    }

    if (purchaseDateValue && !isValidDateInput(purchaseDateValue)) {
      nextErrors.purchaseDate = 'Please use YYYY-MM-DD for purchase date.';
    }

    if (expiryDateValue && !isValidDateInput(expiryDateValue)) {
      nextErrors.expiryDate = 'Please use YYYY-MM-DD for expiry date.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCancel = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const quantity = Number(formValues.quantity.trim());
    const purchaseDate = formValues.purchaseDate.trim();
    const expiryDate = formValues.expiryDate.trim();

    try {
      setSaving(true);

      await onSubmit({
        name: formValues.name.trim(),
        category: formValues.category as ManualItemCategory,
        quantity,
        purchaseDate: purchaseDate || undefined,
        expiryDate: expiryDate || undefined,
      });

      Alert.alert('Success', 'Item saved to inventory.');
      onClose();
    } catch (error) {
      Alert.alert('Save Failed', getFriendlyErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet} pointerEvents="box-none">
          <View style={styles.card}>
            <Pressable style={styles.closeBtn} onPress={handleCancel} hitSlop={12}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            <Text style={styles.title}>Add Item Manually</Text>
            <Text style={styles.subtitle}>Enter a food item to save it directly to your inventory.</Text>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              <ManualItemForm values={formValues} errors={errors} onChange={setFieldValue} />
            </ScrollView>

            <AppButton
              title="Save Item"
              onPress={() => {
                void handleSave();
              }}
              loading={saving}
              style={styles.primaryButton}
            />
            <AppButton
              title="Cancel"
              onPress={handleCancel}
              variant="secondary"
              disabled={saving}
              style={styles.secondaryButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
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
    color: COLORS.subtext,
    fontWeight: FONT_WEIGHT.semibold,
  },
  title: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  formScroll: {
    maxHeight: 360,
  },
  formContent: {
    paddingBottom: SPACING.xs,
  },
  primaryButton: {
    marginTop: SPACING.md,
  },
  secondaryButton: {
    marginTop: SPACING.sm,
  },
});
