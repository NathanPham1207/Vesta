import React, { ReactNode } from "react";
import { View, Text, ViewProps } from "react-native";
import { styles } from "./Alert.styles";

type AlertVariant = "default" | "destructive";

type AlertProps = ViewProps & {
  children: ReactNode;
  variant?: AlertVariant;
};

type AlertTitleProps = {
  children: ReactNode;
};

type AlertDescriptionProps = {
  children: ReactNode;
};

export function Alert({
  children,
  variant = "default",
  style,
  ...props
}: AlertProps) {
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        variant === "default" ? styles.default : styles.destructive,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function AlertTitle({ children }: AlertTitleProps) {
  return <Text style={styles.title}>{children}</Text>;
}

export function AlertDescription({ children }: AlertDescriptionProps) {
  return (
    <View style={styles.descriptionContainer}>
      {typeof children === "string" ? (
        <Text style={styles.description}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
