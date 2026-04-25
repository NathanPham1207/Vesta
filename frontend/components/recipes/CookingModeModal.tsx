import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';
import type { RecipeItem } from '@/components/recipes/RecipeCard';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

const RING_SIZE = 140;
const STROKE = 8;
const R = (RING_SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

interface CookingModeModalProps {
  visible: boolean;
  recipe: RecipeItem | null;
  currentStep: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function CookingModeModal({
  visible,
  recipe,
  currentStep,
  onClose,
  onPrevious,
  onNext,
}: CookingModeModalProps) {
  const { height } = useWindowDimensions();

  if (!recipe) return null;

  const steps = recipe.instructions;
  const total = steps.length;
  const stepIndex =
    total === 0 ? 0 : Math.min(Math.max(currentStep, 0), total - 1);
  const progress = total > 0 ? (stepIndex + 1) / total : 0;
  const isFirst = stepIndex <= 0 || total === 0;
  const isLast = total === 0 ? true : stepIndex >= total - 1;
  const currentText = steps[stepIndex] ?? 'No steps for this recipe.';

  const maxModalH = Math.min(height * 0.85, 640);
  const dashOffset = CIRC * (1 - progress);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { maxHeight: maxModalH }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Pressable
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close cooking mode"
          >
            <Ionicons name="close" size={22} color={COLORS.subtext} />
          </Pressable>

          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.stepLabel}>
            Step {stepIndex + 1} of {total}
          </Text>

          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={R}
                stroke="#E5E7EB"
                strokeWidth={STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={R}
                stroke={COLORS.primary}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={CIRC}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>
            <View style={styles.ringCenter} pointerEvents="none">
              <Text style={styles.ringBig}>{stepIndex + 1}</Text>
              <Text style={styles.ringSmall}>of {total}</Text>
            </View>
          </View>

          <View style={styles.instructionCard}>
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>{stepIndex + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{currentText}</Text>
          </View>

          <View style={styles.navRow}>
            <Pressable
              onPress={onPrevious}
              disabled={isFirst}
              style={({ pressed }) => [
                styles.navBtn,
                styles.navBtnSecondary,
                isFirst && styles.navBtnDisabled,
                pressed && !isFirst && styles.navBtnPressed,
              ]}
            >
              <Text
                style={[
                  styles.navBtnTextSecondary,
                  isFirst && styles.navBtnTextDisabled,
                ]}
              >
                Previous
              </Text>
            </Pressable>
            <Pressable
              onPress={onNext}
              style={({ pressed }) => [
                styles.navBtn,
                styles.navBtnPrimary,
                pressed && styles.navBtnPressed,
              ]}
            >
              <Text style={styles.navBtnTextPrimary}>
                {isLast ? 'Finish' : 'Next Step'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: { elevation: 14 },
    }),
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 2,
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
  stepLabel: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: FONT_WEIGHT.medium,
  },
  ringWrap: {
    alignSelf: 'center',
    width: RING_SIZE,
    height: RING_SIZE,
    marginBottom: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBig: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  ringSmall: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    fontWeight: FONT_WEIGHT.medium,
  },
  instructionCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: 'rgba(12, 175, 67, 0.35)',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  stepPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPillText: {
    color: COLORS.surface,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.small,
  },
  instructionText: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    color: COLORS.text,
    lineHeight: 22,
    fontWeight: FONT_WEIGHT.medium,
  },
  navRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  navBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  navBtnSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
  navBtnPressed: {
    opacity: 0.9,
  },
  navBtnTextSecondary: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.subtext,
  },
  navBtnTextPrimary: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },
  navBtnTextDisabled: {
    color: COLORS.subtext,
  },
});
