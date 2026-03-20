import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import { styles } from "./AlertDialog.styles";

type AlertDialogContextType = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const AlertDialogContext = createContext<AlertDialogContextType | null>(null);

function useAlertDialogContext() {
  const context = useContext(AlertDialogContext);

  if (!context) {
    throw new Error("AlertDialog components must be used inside AlertDialog");
  }

  return context;
}

type AlertDialogProps = {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function AlertDialog({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = typeof open === "boolean";
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  const value = useMemo(
    () => ({
      open: currentOpen,
      setOpen,
    }),
    [currentOpen],
  );

  return (
    <AlertDialogContext.Provider value={value}>
      {children}
    </AlertDialogContext.Provider>
  );
}

type AlertDialogTriggerProps = {
  children: ReactNode;
};

function AlertDialogTrigger({ children }: AlertDialogTriggerProps) {
  const { setOpen } = useAlertDialogContext();

  return <Pressable onPress={() => setOpen(true)}>{children}</Pressable>;
}

type AlertDialogPortalProps = {
  children: ReactNode;
};

function AlertDialogPortal({ children }: AlertDialogPortalProps) {
  return <>{children}</>;
}

type AlertDialogOverlayProps = {
  children?: ReactNode;
};

function AlertDialogOverlay({ children }: AlertDialogOverlayProps) {
  const { open, setOpen } = useAlertDialogContext();

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
        {children}
      </Pressable>
    </Modal>
  );
}

type AlertDialogContentProps = {
  children: ReactNode;
};

function AlertDialogContent({ children }: AlertDialogContentProps) {
  const { open, setOpen } = useAlertDialogContext();

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
        <View style={styles.contentWrapper}>
          <Pressable
            style={styles.content}
            onPress={(e: GestureResponderEvent) => e.stopPropagation()}
          >
            {children}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type AlertDialogHeaderProps = {
  children: ReactNode;
};

function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <View style={styles.header}>{children}</View>;
}

type AlertDialogFooterProps = {
  children: ReactNode;
};

function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <View style={styles.footer}>{children}</View>;
}

type AlertDialogTitleProps = {
  children: ReactNode;
};

function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <Text style={styles.title}>{children}</Text>;
}

type AlertDialogDescriptionProps = {
  children: ReactNode;
};

function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return <Text style={styles.description}>{children}</Text>;
}

type AlertDialogActionProps = {
  children: ReactNode;
  onPress?: () => void;
};

function AlertDialogAction({ children, onPress }: AlertDialogActionProps) {
  const { setOpen } = useAlertDialogContext();

  const handlePress = () => {
    onPress?.();
    setOpen(false);
  };

  return (
    <Pressable style={styles.actionButton} onPress={handlePress}>
      <Text style={styles.actionButtonText}>{children}</Text>
    </Pressable>
  );
}

type AlertDialogCancelProps = {
  children: ReactNode;
  onPress?: () => void;
};

function AlertDialogCancel({ children, onPress }: AlertDialogCancelProps) {
  const { setOpen } = useAlertDialogContext();

  const handlePress = () => {
    onPress?.();
    setOpen(false);
  };

  return (
    <Pressable style={styles.cancelButton} onPress={handlePress}>
      <Text style={styles.cancelButtonText}>{children}</Text>
    </Pressable>
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
