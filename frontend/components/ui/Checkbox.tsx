import { Check } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { styles } from "./Checkbox.styles";

type CheckboxProps = {
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Checkbox({
  checked = false,
  disabled = false,
  onCheckedChange,
}: CheckboxProps) {
  const handlePress = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        checked && styles.containerChecked,
        disabled && styles.containerDisabled,
        pressed && !disabled && styles.containerPressed,
      ]}
    >
      <View style={styles.indicator}>
        {checked ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}
