import React, { ReactNode } from "react";
import { Text, TextStyle, View, ViewStyle } from "react-native";
import { styles } from "./Badge.styles";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

export function Badge({
  children,
  variant = "default",
  style,
  textStyle,
}: BadgeProps) {
  const containerVariantStyle = [
    styles.badge,
    variant === "default" && styles.defaultBadge,
    variant === "secondary" && styles.secondaryBadge,
    variant === "destructive" && styles.destructiveBadge,
    variant === "outline" && styles.outlineBadge,
    style,
  ];

  const labelVariantStyle = [
    styles.badgeText,
    variant === "default" && styles.defaultBadgeText,
    variant === "secondary" && styles.secondaryBadgeText,
    variant === "destructive" && styles.destructiveBadgeText,
    variant === "outline" && styles.outlineBadgeText,
    textStyle,
  ];

  return (
    <View style={containerVariantStyle}>
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={labelVariantStyle}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
