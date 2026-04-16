import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  type LayoutChangeEvent,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import {
  type InventoryFreshnessFilter,
  getFilterLabel,
} from '@/constants/homeInventory';

const FILTERS: InventoryFreshnessFilter[] = ['all', 'fresh', 'good', 'expired'];

const OPTION_ROW_HEIGHT = 44;

/** Same system as SearchBar minimal variant (popup reference). */
const CONTROL_BG = '#F1F5F9';
const ICON_MUTED = '#64748B';
const CHEVRON = '#94A3B8';

interface StatusFilterDropdownProps {
  value: InventoryFreshnessFilter;
  onChange: (next: InventoryFreshnessFilter) => void;
  /** When this changes (e.g. modal open/category), menu closes. */
  resetKey: string;
  onOpenChange?: (open: boolean) => void;
}

export function StatusFilterDropdown({
  value,
  onChange,
  resetKey,
  onOpenChange,
}: StatusFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [triggerSize, setTriggerSize] = useState({ width: 148, height: 44 });

  useEffect(() => {
    setOpen(false);
    onOpenChange?.(false);
  }, [resetKey]);

  const onTriggerLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setTriggerSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  const select = (f: InventoryFreshnessFilter) => {
    onChange(f);
    setOpen(false);
    onOpenChange?.(false);
  };

  const menuHeight = FILTERS.length * OPTION_ROW_HEIGHT;

  return (
    <View
      style={[styles.anchor, open && { marginBottom: menuHeight }]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          open && styles.triggerOpen,
          pressed && styles.triggerPressed,
        ]}
        onLayout={onTriggerLayout}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Ionicons name="funnel-outline" size={18} color={ICON_MUTED} />
        <Text style={styles.triggerLabel} numberOfLines={1}>
          {getFilterLabel(value)}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={CHEVRON}
        />
      </Pressable>

      {open ? (
        <View
          style={[
            styles.menu,
            styles.menuOpen,
            {
              top: triggerSize.height,
              width: triggerSize.width,
            },
          ]}
          pointerEvents="box-none"
        >
          {FILTERS.map((f, index) => {
            const selected = f === value;
            return (
              <Pressable
                key={f}
                style={({ pressed }) => [
                  styles.option,
                  index < FILTERS.length - 1 && styles.optionBorder,
                  selected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
                onPress={() => select(f)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {getFilterLabel(f)}
                </Text>
                {selected ? (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={COLORS.primary}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const TRIGGER_MIN_WIDTH = 148;
const TRIGGER_MIN_HEIGHT = 44;

const styles = StyleSheet.create({
  anchor: {
    position: 'relative',
    alignSelf: 'flex-start',
    flexGrow: 0,
    flexShrink: 0,
    zIndex: 9999,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minWidth: TRIGGER_MIN_WIDTH,
    minHeight: TRIGGER_MIN_HEIGHT,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: CONTROL_BG,
    borderRadius: RADIUS.sm,
    borderWidth: 0,
  },
  triggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  triggerPressed: {
    opacity: 0.92,
  },
  triggerLabel: {
    flex: 1,
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  menu: {
    position: 'absolute',
    left: 0,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  menuOpen: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  option: {
    minHeight: OPTION_ROW_HEIGHT,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  optionSelected: {
    backgroundColor: '#ECFDF5',
  },
  optionPressed: {
    backgroundColor: CONTROL_BG,
  },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
  },
  optionTextSelected: {
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
});
