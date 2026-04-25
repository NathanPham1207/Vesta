import { Search } from "lucide-react-native";
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
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewProps,
} from "react-native";
import { styles } from "./Command.styles";

type CommandContextType = {
  search: string;
  setSearch: (value: string) => void;
};

const CommandContext = createContext<CommandContextType | null>(null);

function useCommandContext() {
  const context = useContext(CommandContext);

  if (!context) {
    throw new Error("Command components must be used inside <Command>");
  }

  return context;
}

type CommandProps = {
  children: ReactNode;
};

export function Command({ children }: CommandProps) {
  const [search, setSearch] = useState("");

  const value = useMemo(
    () => ({
      search,
      setSearch,
    }),
    [search],
  );

  return (
    <CommandContext.Provider value={value}>
      <View style={styles.command}>{children}</View>
    </CommandContext.Provider>
  );
}

type CommandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
};

export function CommandDialog({
  open,
  onOpenChange,
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
}: CommandDialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.overlay} onPress={() => onOpenChange(false)} />
        <View style={styles.dialog}>
          <View style={styles.srOnly}>
            <Text>{title}</Text>
            <Text>{description}</Text>
          </View>
          <Command>{children}</Command>
        </View>
      </View>
    </Modal>
  );
}

type CommandInputProps = TextInputProps;

export function CommandInput({ style, ...props }: CommandInputProps) {
  const { search, setSearch } = useCommandContext();

  return (
    <View style={styles.inputWrapper}>
      <Search size={16} color="#6B7280" />
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Type a command or search..."
        placeholderTextColor="#9CA3AF"
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

type CommandListProps = ViewProps & {
  children: ReactNode;
};

export function CommandList({ children, style, ...props }: CommandListProps) {
  return (
    <ScrollView
      style={[styles.list, style]}
      contentContainerStyle={styles.listContent}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

type CommandEmptyProps = TextProps & {
  children?: ReactNode;
};

export function CommandEmpty({
  children = "No results found.",
  style,
  ...props
}: CommandEmptyProps) {
  return (
    <Text style={[styles.empty, style]} {...props}>
      {children}
    </Text>
  );
}

type CommandGroupProps = ViewProps & {
  heading?: ReactNode;
  children: ReactNode;
};

export function CommandGroup({
  heading,
  children,
  style,
  ...props
}: CommandGroupProps) {
  return (
    <View style={[styles.group, style]} {...props}>
      {heading ? <Text style={styles.groupHeading}>{heading}</Text> : null}
      <View>{children}</View>
    </View>
  );
}

type CommandSeparatorProps = ViewProps;

export function CommandSeparator({ style, ...props }: CommandSeparatorProps) {
  return <View style={[styles.separator, style]} {...props} />;
}

type CommandItemProps = PressableProps & {
  children: ReactNode;
  disabled?: boolean;
};

export function CommandItem({
  children,
  style,
  disabled,
  ...props
}: CommandItemProps) {
  return (
    <Pressable
      disabled={disabled}
      style={(state) => [
        styles.item,
        disabled && styles.itemDisabled,
        state.pressed && !disabled && styles.itemPressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

type CommandShortcutProps = TextProps & {
  children: ReactNode;
};

export function CommandShortcut({
  children,
  style,
  ...props
}: CommandShortcutProps) {
  return (
    <Text style={[styles.shortcut, style]} {...props}>
      {children}
    </Text>
  );
}
