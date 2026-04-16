import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { styles } from "./Button.styles";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

const variantStyleMap = {
  default: styles.variantDefault,
  destructive: styles.variantDestructive,
  outline: styles.variantOutline,
  secondary: styles.variantSecondary,
  ghost: styles.variantGhost,
  link: styles.variantLink,
};

const variantTextStyleMap = {
  default: styles.variantDefaultText,
  destructive: styles.variantDestructiveText,
  outline: styles.variantOutlineText,
  secondary: styles.variantSecondaryText,
  ghost: styles.variantGhostText,
  link: styles.variantLinkText,
};

const sizeStyleMap = {
  default: styles.sizeDefault,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  icon: styles.sizeIcon,
};

export function Button({
  children,
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
  onPress,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles = [
    styles.base,
    variantStyleMap[variant],
    sizeStyleMap[size],
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyles = [
    styles.textBase,
    variantTextStyleMap[variant],
    textStyle,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        containerStyles,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor(variant)} />
      ) : typeof children === "string" || typeof children === "number" ? (
        <Text style={labelStyles}>{children}</Text>
      ) : (
        <View style={styles.contentRow}>{children}</View>
      )}
    </Pressable>
  );
}

function getSpinnerColor(variant: ButtonVariant) {
  switch (variant) {
    case "default":
    case "destructive":
      return "#FFFFFF";
    case "outline":
    case "secondary":
    case "ghost":
    case "link":
    default:
      return "#111827";
  }
}
