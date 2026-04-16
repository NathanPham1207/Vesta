import React, { ReactNode } from "react";
import { View } from "react-native";
import { styles } from "./AspectRatio.styles";

type AspectRatioProps = {
  ratio?: number;
  children?: ReactNode;
};

export function AspectRatio({ ratio = 1, children }: AspectRatioProps) {
  return (
    <View style={[styles.container, { aspectRatio: ratio }]}>{children}</View>
  );
}
