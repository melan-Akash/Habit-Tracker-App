import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../lib/theme-context';

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* 1. Today's Habits */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'calendar-check' : 'calendar-check-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 2. AI Coach Assistant */}
      <Tabs.Screen
        name="ai-coach"
        options={{
          title: "AI Coach",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'robot' : 'robot-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Add Habit */}
      <Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'plus-circle' : 'plus-circle-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account-circle' : 'account-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden from bottom bar, accessible via Dashboard Menu */}
      <Tabs.Screen
        name="calendar"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="streaks"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}