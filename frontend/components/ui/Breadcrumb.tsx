import { ChevronRight, MoreHorizontal } from "lucide-react-native";
import React, { ReactNode } from "react";
import { Pressable, Text, TextProps, View, ViewProps } from "react-native";
import { styles } from "./Breadcrumb.styles";

type BreadcrumbProps = ViewProps & {
  children: ReactNode;
};

type BreadcrumbListProps = ViewProps & {
  children: ReactNode;
};

type BreadcrumbItemProps = ViewProps & {
  children: ReactNode;
};

type BreadcrumbLinkProps = TextProps & {
  children: ReactNode;
  onPress?: () => void;
};

type BreadcrumbPageProps = TextProps & {
  children: ReactNode;
};

type BreadcrumbSeparatorProps = ViewProps & {
  children?: ReactNode;
};

type BreadcrumbEllipsisProps = ViewProps;

export function Breadcrumb({ children, style, ...props }: BreadcrumbProps) {
  return (
    <View
      accessibilityRole="summary"
      style={[styles.breadcrumb, style]}
      {...props}
    >
      {children}
    </View>
  );
}

export function BreadcrumbList({
  children,
  style,
  ...props
}: BreadcrumbListProps) {
  return (
    <View style={[styles.list, style]} {...props}>
      {children}
    </View>
  );
}

export function BreadcrumbItem({
  children,
  style,
  ...props
}: BreadcrumbItemProps) {
  return (
    <View style={[styles.item, style]} {...props}>
      {children}
    </View>
  );
}

export function BreadcrumbLink({
  children,
  onPress,
  style,
  ...props
}: BreadcrumbLinkProps) {
  return (
    <Pressable onPress={onPress} style={styles.linkWrapper}>
      <Text style={[styles.link, style]} {...props}>
        {children}
      </Text>
    </Pressable>
  );
}

export function BreadcrumbPage({
  children,
  style,
  ...props
}: BreadcrumbPageProps) {
  return (
    <Text style={[styles.page, style]} {...props}>
      {children}
    </Text>
  );
}

export function BreadcrumbSeparator({
  children,
  style,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <View style={[styles.separator, style]} {...props}>
      {children ?? <ChevronRight size={14} color="#6B7280" />}
    </View>
  );
}

export function BreadcrumbEllipsis({
  style,
  ...props
}: BreadcrumbEllipsisProps) {
  return (
    <View style={[styles.ellipsis, style]} {...props}>
      <MoreHorizontal size={16} color="#6B7280" />
      <Text style={styles.srOnly}>More</Text>
    </View>
  );
}
