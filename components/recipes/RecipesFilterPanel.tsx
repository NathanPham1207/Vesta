import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import {
  COOK_TIME_OPTIONS,
  DIETARY_OPTIONS,
  SERVINGS_OPTIONS,
  cookTimeLabel,
  dietaryLabel,
  servingsLabel,
  type CookTimeId,
  type DietaryFilterId,
  type ServingsFilterId,
} from '@/utils/recipes/recipeFilters';

const BORDER = '#E0E0E0';
const INGREDIENT_BG = '#F2F2F2';

const MENU_MAX_H = 220;

type PickerKey = 'cookTime' | 'servings' | 'dietary';

type MenuRect = { x: number; y: number; width: number; height: number };

type RecipesFilterPanelProps = {
  cookTime: CookTimeId;
  onCookTime: (id: CookTimeId) => void;
  servings: ServingsFilterId;
  onServings: (id: ServingsFilterId) => void;
  mainIngredient: string;
  onMainIngredient: (text: string) => void;
  dietary: DietaryFilterId;
  onDietary: (id: DietaryFilterId) => void;
};

type SelectFieldProps = {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  displayValue: string;
  menuAnchorRef: React.RefObject<View | null>;
};

function SelectField({
  label,
  isOpen,
  onToggle,
  displayValue,
  menuAnchorRef,
}: SelectFieldProps) {
  return (
    <View style={styles.gridCell}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        ref={menuAnchorRef}
        collapsable={false}
        style={styles.selectAnchor}
      >
        <Pressable
          onPress={onToggle}
          style={({ pressed }) => [
            styles.selectBox,
            isOpen && styles.selectBoxOpen,
            pressed && styles.selectPressed,
          ]}
        >
          <Text style={styles.selectValue} numberOfLines={1}>
            {displayValue}
          </Text>
          <View pointerEvents="none">
            {isOpen ? (
              <ChevronUp size={16} color={COLORS.subtext} />
            ) : (
              <ChevronDown size={16} color={COLORS.subtext} />
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export function RecipesFilterPanel({
  cookTime,
  onCookTime,
  servings,
  onServings,
  mainIngredient,
  onMainIngredient,
  dietary,
  onDietary,
}: RecipesFilterPanelProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [openPicker, setOpenPicker] = useState<PickerKey | null>(null);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);

  const cookRef = useRef<View>(null);
  const servingsRef = useRef<View>(null);
  const dietaryRef = useRef<View>(null);

  const refForPicker = (k: PickerKey) =>
    k === 'cookTime' ? cookRef : k === 'servings' ? servingsRef : dietaryRef;

  const togglePicker = (key: PickerKey) => {
    setOpenPicker((p) => (p === key ? null : key));
  };

  const closePicker = () => {
    setOpenPicker(null);
    setMenuRect(null);
  };

  const selectCook = (id: string) => {
    onCookTime(id as CookTimeId);
    closePicker();
  };
  const selectServings = (id: string) => {
    onServings(id as ServingsFilterId);
    closePicker();
  };
  const selectDietary = (id: string) => {
    onDietary(id as DietaryFilterId);
    closePicker();
  };

  useLayoutEffect(() => {
    if (!openPicker) {
      setMenuRect(null);
      return;
    }

    const id = requestAnimationFrame(() => {
      refForPicker(openPicker).current?.measureInWindow((x, y, width, height) => {
        setMenuRect({ x, y, width, height });
      });
    });

    return () => cancelAnimationFrame(id);
  }, [openPicker]);

  const pickerOptions =
    openPicker === 'cookTime'
      ? COOK_TIME_OPTIONS
      : openPicker === 'servings'
        ? SERVINGS_OPTIONS
        : openPicker === 'dietary'
          ? DIETARY_OPTIONS
          : null;

  const menuTop =
    menuRect != null ? menuRect.y + menuRect.height + 4 : 0;
  const menuMaxHeight = Math.max(
    120,
    Math.min(MENU_MAX_H, windowHeight - menuTop - 16),
  );

  return (
    <View style={styles.card}>
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <SelectField
            label="Cook Time"
            isOpen={openPicker === 'cookTime'}
            onToggle={() => togglePicker('cookTime')}
            displayValue={cookTimeLabel(cookTime)}
            menuAnchorRef={cookRef}
          />
          <SelectField
            label="Servings"
            isOpen={openPicker === 'servings'}
            onToggle={() => togglePicker('servings')}
            displayValue={servingsLabel(servings)}
            menuAnchorRef={servingsRef}
          />
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <Text style={styles.fieldLabel}>Main Ingredient</Text>
            <TextInput
              value={mainIngredient}
              onChangeText={onMainIngredient}
              placeholder="e.g., chicken, pasta"
              placeholderTextColor={COLORS.subtext}
              style={styles.ingredientInput}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          <SelectField
            label="Dietary"
            isOpen={openPicker === 'dietary'}
            onToggle={() => togglePicker('dietary')}
            displayValue={dietaryLabel(dietary)}
            menuAnchorRef={dietaryRef}
          />
        </View>
      </View>

      <Modal
        visible={openPicker !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePicker}
      >
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closePicker}
            accessibilityLabel="Dismiss filter menu"
          />
          {menuRect && pickerOptions ? (
            <View
              style={[
                styles.floatingMenu,
                {
                  top: menuTop,
                  left: menuRect.x,
                  width: menuRect.width,
                  maxHeight: menuMaxHeight,
                },
              ]}
              pointerEvents="box-none"
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={{ maxHeight: menuMaxHeight }}
                bounces={false}
              >
                {pickerOptions.map((opt, index) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      if (openPicker === 'cookTime') selectCook(opt.id);
                      else if (openPicker === 'servings')
                        selectServings(opt.id);
                      else selectDietary(opt.id);
                    }}
                    style={({ pressed }) => [
                      styles.optionRow,
                      index < pickerOptions.length - 1 && styles.optionRowBorder,
                      pressed && styles.optionRowPressed,
                    ]}
                  >
                    <Text style={styles.optionText}>{opt.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  grid: {
    gap: SPACING.md,
    overflow: 'visible',
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    overflow: 'visible',
  },
  gridCell: {
    flex: 1,
    minWidth: 0,
    overflow: 'visible',
  },
  fieldLabel: {
    fontSize: FONT_SIZE.small,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  selectAnchor: {
    position: 'relative',
    zIndex: 1,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    minHeight: 42,
  },
  selectBoxOpen: {
    borderColor: COLORS.primary,
  },
  selectPressed: {
    opacity: 0.92,
  },
  selectValue: {
    flex: 1,
    fontSize: FONT_SIZE.small,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
  },
  modalRoot: {
    flex: 1,
  },
  floatingMenu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 28,
    zIndex: 9999,
  },
  ingredientInput: {
    backgroundColor: INGREDIENT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    minHeight: 42,
  },
  optionRow: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  optionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  optionRowPressed: {
    backgroundColor: INGREDIENT_BG,
  },
  optionText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
});
