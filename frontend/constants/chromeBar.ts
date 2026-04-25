import { StyleSheet } from 'react-native';

/** Matches bottom tab bar vertical sizing (see app/(tabs)/_layout.tsx). */
export const CHROME_BAR_MIN_HEIGHT = 86;
export const CHROME_BAR_PADDING_TOP = 8;
export const CHROME_BAR_PADDING_BOTTOM = 14;
export const CHROME_BAR_BORDER_COLOR = '#E5E7EB';

/** Unused (corners are square). Kept so stale Metro bundles don’t throw ReferenceError. */
export const CHROME_BAR_RADIUS = 0;

export function tabBarOuterHeight(bottomInset: number) {
  return CHROME_BAR_MIN_HEIGHT + Math.max(bottomInset - 6, 0);
}

export function tabBarPaddingBottom(bottomInset: number) {
  return Math.max(bottomInset, CHROME_BAR_PADDING_BOTTOM);
}

export const chromeBarShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 2,
  elevation: 6,
} as const;

export const chromeBarTopHairline = {
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: CHROME_BAR_BORDER_COLOR,
} as const;

export const chromeBarBottomHairline = {
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: CHROME_BAR_BORDER_COLOR,
} as const;
