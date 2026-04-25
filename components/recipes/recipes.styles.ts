import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { Platform, StyleSheet } from 'react-native';

/** Screen background — soft mint from mockup */
export const RECIPES_MINT_BG = '#E8F8EE';

/** Profile touch target size (unchanged). */
export const RECIPES_PROFILE_BTN_SIZE = 40;

/**
 * Vertical space reserved below the fixed profile so title/search/filter/cards sit lower.
 * Matches prior top padding + button height + gap (≈ header band).
 */
export const RECIPES_CONTENT_TOP_INSET =
  SPACING.sm + RECIPES_PROFILE_BTN_SIZE + SPACING.md;

export const recipesScreenStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  /** Wraps header + list so filter layer stacks above FlatList cells. */
  screenBody: {
    flex: 1,
    position: 'relative',
  },
  /**
   * Fixed layer: profile only (does not affect layout flow).
   * pointerEvents box-none so the rest of the screen receives touches.
   */
  profileFixedLayer: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
    pointerEvents: 'box-none',
    ...Platform.select({
      android: { elevation: 0 },
    }),
  },
  /**
   * Title, search, filter, list — extra top inset only here (not on SafeAreaView root).
   */
  contentLayer: {
    flex: 1,
    paddingTop: RECIPES_CONTENT_TOP_INSET,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
  },
  /**
   * Fixed above the list (not inside FlatList) so the open menu isn’t covered by cards.
   * High zIndex + elevation so dropdown paints over recipe images/cards.
   */
  headerLayer: {
    position: 'relative',
    zIndex: 1000,
    backgroundColor: RECIPES_MINT_BG,
    paddingBottom: SPACING.lg,
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: { elevation: 24 },
    }),
  },
  listScroll: {
    flex: 1,
    zIndex: 0,
    elevation: 0,
    position: 'relative',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxxl,
  },
  headerRow: {
    marginBottom: SPACING.lg,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: FONT_WEIGHT.bold,
    color: '#1A1A1A',
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: FONT_SIZE.small,
    color: '#7D7D7D',
    lineHeight: 20,
    fontWeight: FONT_WEIGHT.medium,
  },
  profileBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.lg,
    width: RECIPES_PROFILE_BTN_SIZE,
    height: RECIPES_PROFILE_BTN_SIZE,
    borderRadius: RECIPES_PROFILE_BTN_SIZE / 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  searchSpacing: {
    marginBottom: SPACING.sm,
  },
  filterAnchor: {
    position: 'relative',
    zIndex: 10050,
    marginBottom: 0,
    ...Platform.select({
      android: { elevation: 26 },
    }),
  },
  filterTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  filterTriggerPressed: {
    opacity: 0.92,
  },
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterLabel: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  /** overflow hidden only clips inner option corners, not the panel vs list. */
  filterMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 52,
    zIndex: 10060,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 32 },
    }),
  },
  filterOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  filterOptionLast: {
    borderBottomWidth: 0,
  },
  filterOptionText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  filterOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  cardWrap: {
    marginBottom: SPACING.xl,
    zIndex: 0,
    elevation: 0,
    position: 'relative',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7D7D7D',
    fontSize: FONT_SIZE.body,
    marginTop: SPACING.xl,
  },
});
