import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS } from '@/constants/colors';
import {
  CHROME_BAR_PADDING_TOP,
  chromeBarTopHairline,
  tabBarOuterHeight,
  tabBarPaddingBottom,
} from '@/constants/chromeBar';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({
  symbol,
  color,
}: {
  symbol: string;
  color: string;
}) {
  return (
    <Text style={{ fontSize: 23, lineHeight: 24, color, textAlign: 'center' }}>
      {symbol}
    </Text>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = tabBarOuterHeight(insets.bottom);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.subtext,
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 0,
          paddingBottom: 0,
        },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          ...chromeBarTopHairline,
          paddingTop: CHROME_BAR_PADDING_TOP,
          paddingBottom: tabBarPaddingBottom(insets.bottom),
          height: tabBarHeight,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.04,
          shadowRadius: 2,
          elevation: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: FONT_WEIGHT.semibold,
          textAlign: 'center',
          marginTop: 4,
          marginBottom: 0,
          lineHeight: 16,
        },
        tabBarIconStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 0,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon symbol="⌂" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => (
            <TabIcon symbol="◉" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => (
            <TabIcon symbol="⌸" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="receipts"
        options={{
          title: 'Receipts',
          tabBarIcon: ({ color }) => (
            <TabIcon symbol="▣" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
