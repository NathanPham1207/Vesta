import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE } from '@/constants/typography';

interface ScanActionCardProps {
  onTakePhoto: () => void;
  onUploadFromGallery: () => void;
}

export function ScanActionCard({
  onTakePhoto,
  onUploadFromGallery,
}: ScanActionCardProps) {
  return (
    <AppCard>
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.title}>Scan Your Receipt</Text>
      <Text style={styles.subtitle}>
        Take a photo or upload an image to add items to your inventory.
      </Text>
      <AppButton
        title="Take Photo"
        onPress={onTakePhoto}
        style={styles.primaryButton}
      />
      <AppButton
        title="Upload from Gallery"
        onPress={onUploadFromGallery}
        variant="outline"
        style={styles.secondaryButton}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    marginBottom: SPACING.md,
  },
  secondaryButton: {},
});
