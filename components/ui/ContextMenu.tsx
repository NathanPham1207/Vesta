import { Check, ChevronRight, Circle } from "lucide-react-native";
import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  PressableProps,
  Text,
  TextProps,
  View,
  ViewProps,
} from "react-native";
import { styles } from "./ContextMenu.styles";

type ContextMenuContextType = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

function useContextMenuContext() {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("ContextMenu components must be used inside <ContextMenu>");
  }

  return context;
}

type ContextMenuProps = {
  children: ReactNode;
};

export function ContextMenu({ children }: ContextMenuProps) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      open,
      setOpen,
    }),
    [open],
  );

  return (
    <ContextMenuContext.Provider value={value}>
      {children}
    </ContextMenuContext.Provider>
  );
}

type ContextMenuTriggerProps = PressableProps & {
  children: ReactNode;
  triggerOnLongPress?: boolean;
};

export function ContextMenuTrigger({
  children,
  triggerOnLongPress = true,
  onPress,
  onLongPress,
  style,
  ...props
}: ContextMenuTriggerProps) {
  const { setOpen } = useContextMenuContext();

  return (
    <Pressable
      onPress={(event) => {
        if (!triggerOnLongPress) {
          setOpen(true);
        }
        onPress?.(event);
      }}
      onLongPress={(event) => {
        if (triggerOnLongPress) {
          setOpen(true);
        }
        onLongPress?.(event);
      }}
      style={(state) => {
        const resolvedStyle =
          typeof style === "function" ? style(state) : style;

        return resolvedStyle;
      }}
      {...props}
    >
      {children}
    </Pressable>
  );
}

type ContextMenuGroupProps = {
  children: ReactNode;
};

export function ContextMenuGroup({ children }: ContextMenuGroupProps) {
  return <View style={styles.group}>{children}</View>;
}

type ContextMenuPortalProps = {
  children: ReactNode;
};

export function ContextMenuPortal({ children }: ContextMenuPortalProps) {
  return <>{children}</>;
}

type ContextMenuSubProps = {
  children: ReactNode;
};

export function ContextMenuSub({ children }: ContextMenuSubProps) {
  return <>{children}</>;
}

type ContextMenuRadioGroupProps = {
  children: ReactNode;
};

export function ContextMenuRadioGroup({
  children,
}: ContextMenuRadioGroupProps) {
  return <View>{children}</View>;
}

type ContextMenuContentProps = {
  children: ReactNode;
};

export function ContextMenuContent({ children }: ContextMenuContentProps) {
  const { open, setOpen } = useContextMenuContext();

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
        <View style={styles.content}>{children}</View>
      </View>
    </Modal>
  );
}

type ContextMenuSubTriggerProps = PressableProps & {
  children: ReactNode;
  inset?: boolean;
};

export function ContextMenuSubTrigger({
  children,
  inset,
  style,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <Pressable
      style={(state) => {
        const resolvedStyle =
          typeof style === "function" ? style(state) : style;

        return [
          styles.item,
          inset && styles.itemInset,
          state.pressed && styles.itemPressed,
          resolvedStyle,
        ];
      }}
      {...props}
    >
      <View style={styles.itemContent}>
        {typeof children === "string" ? (
          <Text style={styles.itemText}>{children}</Text>
        ) : (
          children
        )}
      </View>
      <ChevronRight size={16} color="#6B7280" />
    </Pressable>
  );
}

type ContextMenuSubContentProps = {
  children: ReactNode;
};

export function ContextMenuSubContent({
  children,
}: ContextMenuSubContentProps) {
  return <View style={styles.subContent}>{children}</View>;
}

type ContextMenuItemProps = PressableProps & {
  children: ReactNode;
  inset?: boolean;
  variant?: "default" | "destructive";
  disabled?: boolean;
};

export function ContextMenuItem({
  children,
  inset,
  variant = "default",
  disabled,
  style,
  onPress,
  ...props
}: ContextMenuItemProps) {
  const { setOpen } = useContextMenuContext();

  return (
    <Pressable
      disabled={disabled}
      onPress={(event) => {
        onPress?.(event);
        setOpen(false);
      }}
      style={(state) => {
        const resolvedStyle =
          typeof style === "function" ? style(state) : style;

        return [
          styles.item,
          inset && styles.itemInset,
          disabled && styles.itemDisabled,
          state.pressed && !disabled && styles.itemPressed,
          variant === "destructive" && styles.itemDestructive,
          resolvedStyle,
        ];
      }}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            styles.itemText,
            variant === "destructive" && styles.itemTextDestructive,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

type ContextMenuCheckboxItemProps = PressableProps & {
  children: ReactNode;
  checked?: boolean;
  disabled?: boolean;
};

export function ContextMenuCheckboxItem({
  children,
  checked = false,
  disabled,
  style,
  onPress,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={(state) => {
        const resolvedStyle =
          typeof style === "function" ? style(state) : style;

        return [
          styles.item,
          styles.checkboxItem,
          disabled && styles.itemDisabled,
          state.pressed && !disabled && styles.itemPressed,
          resolvedStyle,
        ];
      }}
      {...props}
    >
      <View style={styles.leadingIcon}>
        {checked ? <Check size={16} color="#111827" /> : null}
      </View>

      {typeof children === "string" ? (
        <Text style={styles.itemText}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

type ContextMenuRadioItemProps = PressableProps & {
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
};

export function ContextMenuRadioItem({
  children,
  selected = false,
  disabled,
  style,
  onPress,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={(state) => {
        const resolvedStyle =
          typeof style === "function" ? style(state) : style;

        return [
          styles.item,
          styles.checkboxItem,
          disabled && styles.itemDisabled,
          state.pressed && !disabled && styles.itemPressed,
          resolvedStyle,
        ];
      }}
      {...props}
    >
      <View style={styles.leadingIcon}>
        {selected ? <Circle size={10} color="#111827" fill="#111827" /> : null}
      </View>

      {typeof children === "string" ? (
        <Text style={styles.itemText}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

type ContextMenuLabelProps = TextProps & {
  children: ReactNode;
  inset?: boolean;
};

export function ContextMenuLabel({
  children,
  inset,
  style,
  ...props
}: ContextMenuLabelProps) {
  return (
    <Text style={[styles.label, inset && styles.itemInset, style]} {...props}>
      {children}
    </Text>
  );
}

type ContextMenuSeparatorProps = ViewProps;

export function ContextMenuSeparator({
  style,
  ...props
}: ContextMenuSeparatorProps) {
  return <View style={[styles.separator, style]} {...props} />;
}

type ContextMenuShortcutProps = TextProps & {
  children: ReactNode;
};

export function ContextMenuShortcut({
  children,
  style,
  ...props
}: ContextMenuShortcutProps) {
  return (
    <Text style={[styles.shortcut, style]} {...props}>
      {children}
    </Text>
  );
}
