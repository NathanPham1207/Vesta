import React from 'react';
import { Text, StyleSheet, View, ViewStyle } from 'react-native';
import { Info } from 'lucide-react-native';
import { AppCard } from '@/components/ui/AppCard';
import { COLORS } from '@/constants/colors';
import { styles as infoStyles } from './InfoCard.styles';

type InfoCardProps = {
  title: string;
  children?: React.ReactNode;
  headerRight?: React.ReactNode;
  icon?: React.ReactNode;
  iconBackgroundColor?: string;
  iconBorderColor?: string;
  style?: ViewStyle;
};

export function InfoCard({
  title,
  children,
  headerRight,
  icon,
  iconBackgroundColor,
  iconBorderColor,
  style,
}: InfoCardProps) {
  const mergedCardStyle: ViewStyle = {
    ...styles.card,
    ...(style ?? {}),
  };

  return (
    <AppCard style={mergedCardStyle}>
      <View style={infoStyles.headerRow}>
        <View style={infoStyles.titleRow}>
          <View
            style={[
              infoStyles.infoIconWrap,
              {
                backgroundColor: iconBackgroundColor ?? infoStyles.infoIconWrap.backgroundColor,
                borderColor: iconBorderColor ?? COLORS.border,
              },
            ]}
          >
            {icon ?? <Info size={18} color={COLORS.subtext} />}
          </View>
          <Text style={infoStyles.title}>{title}</Text>
        </View>

        {headerRight ? headerRight : null}
      </View>

      {children ? <View style={infoStyles.bodySpacer}>{children}</View> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
  },
});

