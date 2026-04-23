import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';

// ─── Constants ───────────────────────────────────────────────────────────────

const FADE_IN_DURATION = 180;
const FADE_OUT_DURATION = 160;
const SCALE_IN_DURATION = 220;
const SCALE_OUT_DURATION = 160;

const LOADING_CARD_MAX_WIDTH = 320;

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ScanLoadingOverlay({ visible }: Props) {
  const [overlayMounted, setOverlayMounted] = React.useState(false);
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const cardScale = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    if (visible) {
      setOverlayMounted(true);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: FADE_IN_DURATION,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: SCALE_IN_DURATION,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: FADE_OUT_DURATION,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.97,
        duration: SCALE_OUT_DURATION,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setOverlayMounted(false);
      }
    });
  }, [visible, overlayOpacity, cardScale]);

  if (!overlayMounted) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Animated.View
        style={[styles.card, { transform: [{ scale: cardScale }] }]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.title}>Scanning image...</Text>
        <Text style={styles.subtitle}>Analyzing food items...</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    zIndex: 999,
  },
  card: {
    width: '100%',
    maxWidth: LOADING_CARD_MAX_WIDTH,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
    }),
  },
  title: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    textAlign: 'center',
  },
});
