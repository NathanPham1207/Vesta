import React, { ReactNode } from "react";
import { Text, TextProps, View, ViewProps } from "react-native";
import { styles } from "./Card.styles";

type CardProps = ViewProps & {
  children: ReactNode;
};

type CardHeaderProps = ViewProps & {
  children: ReactNode;
};

type CardTitleProps = TextProps & {
  children: ReactNode;
};

type CardDescriptionProps = TextProps & {
  children: ReactNode;
};

type CardContentProps = ViewProps & {
  children: ReactNode;
};

type CardFooterProps = ViewProps & {
  children: ReactNode;
};

type CardActionProps = ViewProps & {
  children: ReactNode;
};

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, style, ...props }: CardTitleProps) {
  return (
    <Text style={[styles.title, style]} {...props}>
      {children}
    </Text>
  );
}

export function CardDescription({
  children,
  style,
  ...props
}: CardDescriptionProps) {
  return (
    <Text style={[styles.description, style]} {...props}>
      {children}
    </Text>
  );
}

export function CardAction({ children, style, ...props }: CardActionProps) {
  return (
    <View style={[styles.action, style]} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ children, style, ...props }: CardContentProps) {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style, ...props }: CardFooterProps) {
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
}
