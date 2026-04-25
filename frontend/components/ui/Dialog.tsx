import { X } from "lucide-react-native";
import React, { ReactNode } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { styles } from "./Dialog.styles";

type DialogProps = {
  visible: boolean;
  onOpenChange: (visible: boolean) => void;
  children: ReactNode;
};

type DialogContentProps = {
  children: ReactNode;
  style?: ViewStyle;
  showCloseButton?: boolean;
  onClose?: () => void;
};

type DialogHeaderProps = {
  children: ReactNode;
  style?: ViewStyle;
};

type DialogFooterProps = {
  children: ReactNode;
  style?: ViewStyle;
};

type DialogTitleProps = {
  children: ReactNode;
  style?: TextStyle;
};

type DialogDescriptionProps = {
  children: ReactNode;
  style?: TextStyle;
};

type DialogTriggerProps = {
  children: ReactNode;
  onPress: () => void;
  style?: ViewStyle;
};

type DialogCloseProps = {
  children?: ReactNode;
  onPress: () => void;
  style?: ViewStyle;
};

function Dialog({ visible, onOpenChange, children }: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.modalRoot}>{children}</View>
    </Modal>
  );
}

function DialogTrigger({ children, onPress, style }: DialogTriggerProps) {
  return (
    <Pressable onPress={onPress} style={style}>
      {children}
    </Pressable>
  );
}

function DialogOverlay({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.overlay} />
    </TouchableWithoutFeedback>
  );
}

function DialogContent({
  children,
  style,
  showCloseButton = true,
  onClose,
}: DialogContentProps) {
  return (
    <View style={styles.centeredContainer}>
      <View style={[styles.content, style]}>
        {children}

        {showCloseButton && (
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
          >
            <X size={20} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function DialogHeader({ children, style }: DialogHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

function DialogFooter({ children, style }: DialogFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

function DialogTitle({ children, style }: DialogTitleProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

function DialogDescription({ children, style }: DialogDescriptionProps) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

function DialogClose({ children, onPress, style }: DialogCloseProps) {
  return (
    <Pressable onPress={onPress} style={style}>
      {children}
    </Pressable>
  );
}

function DialogPortal({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
