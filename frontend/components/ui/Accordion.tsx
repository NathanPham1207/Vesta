import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { ReactNode, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native";
import { styles } from "./Accordion.styles";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AccordionProps = {
  children: ReactNode;
};

type AccordionItemProps = {
  children: ReactNode;
  defaultOpen?: boolean;
};

type AccordionTriggerProps = {
  children: ReactNode;
  onPress?: () => void;
  isOpen?: boolean;
};

type AccordionContentProps = {
  children: ReactNode;
};

export function Accordion({ children }: AccordionProps) {
  return <View style={styles.container}>{children}</View>;
}

export function AccordionItem({
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const childArray = React.Children.toArray(children);

  const triggerChild = childArray.find(
    (child) =>
      React.isValidElement(child) &&
      (child.type as any)?.displayName === "AccordionTrigger",
  );

  const contentChild = childArray.find(
    (child) =>
      React.isValidElement(child) &&
      (child.type as any)?.displayName === "AccordionContent",
  );

  const [open, setOpen] = useState(defaultOpen);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  };

  return (
    <View style={styles.item}>
      {React.isValidElement(triggerChild)
        ? React.cloneElement(triggerChild as React.ReactElement<any>, {
            onPress: handleToggle,
            isOpen: open,
          })
        : null}

      {open && contentChild}
    </View>
  );
}

export function AccordionTrigger({
  children,
  onPress,
  isOpen = false,
}: AccordionTriggerProps) {
  return (
    <Pressable style={styles.trigger} onPress={onPress}>
      <View style={styles.triggerContent}>
        {typeof children === "string" ? (
          <Text style={styles.triggerText}>{children}</Text>
        ) : (
          children
        )}
      </View>

      <View style={[styles.iconWrapper, isOpen && styles.iconOpen]}>
        {isOpen ? (
          <ChevronUp size={18} color="#6B7280" />
        ) : (
          <ChevronDown size={18} color="#6B7280" />
        )}
      </View>
    </Pressable>
  );
}

AccordionTrigger.displayName = "AccordionTrigger";

export function AccordionContent({ children }: AccordionContentProps) {
  return <View style={styles.content}>{children}</View>;
}

AccordionContent.displayName = "AccordionContent";
