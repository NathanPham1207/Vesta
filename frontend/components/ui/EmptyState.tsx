import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE } from '@/constants/typography';

interface EmptyStateProps {
  message: string;
  submessage?: string;
}

export function EmptyState({ message, submessage }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.message}>{message}</Text>
      {submessage ? (
        <Text style={styles.submessage}>{submessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: FONT_SIZE.body,
    color: COLORS.subtext,
    textAlign: 'center',
  },
  submessage: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
