import React, { ReactNode, useState } from "react";
import { Image, ImageProps, Text, View } from "react-native";
import { styles } from "./Avatar.styles";

type AvatarProps = {
  children?: ReactNode;
  size?: number;
};

type AvatarImageProps = ImageProps;

type AvatarFallbackProps = {
  children?: ReactNode;
};

export function Avatar({ children, size = 40 }: AvatarProps) {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {children}
    </View>
  );
}

export function AvatarImage(props: AvatarImageProps) {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <Image
      {...props}
      style={[styles.image, props.style]}
      onError={() => setError(true)}
    />
  );
}

export function AvatarFallback({ children }: AvatarFallbackProps) {
  return (
    <View style={styles.fallback}>
      {typeof children === "string" ? (
        <Text style={styles.text}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
