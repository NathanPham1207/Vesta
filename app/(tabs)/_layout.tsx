import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/constants/colors';
import {
  CHROME_BAR_PADDING_TOP,
  chromeBarTopHairline,
  tabBarOuterHeight,
  tabBarPaddingBottom,
} from '@/constants/chromeBar';
import { FONT_WEIGHT } from '@/constants/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IonName = React.ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({
  name,
  color,
}: {
  name: IonName;
  color: string;
}) {
  return <Ionicons name={name} size={22} color={color} />;
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
            <TabBarIcon name="home-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="scan-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="restaurant-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="receipts"
        options={{
          title: 'Receipts',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="receipt-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
