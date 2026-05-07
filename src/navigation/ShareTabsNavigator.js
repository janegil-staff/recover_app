// src/navigation/ShareTabsNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import {
  IconCode,
  IconQuestionnaire,
  IconStudies,
} from '../screens/share/shareComponents';

import ShareScreen from '../screens/share/ShareScreen';
import QuestionnaireScreen from '../screens/questionnaire/QuestionnaireScreen';
import RecoveryStudiesScreen from '../screens/share/RecoveryStudiesScreen';

const Tab = createBottomTabNavigator();

export default function ShareTabsNavigator() {
  const { theme } = useTheme();
  const { t } = useLang();
  const ACCENT = theme?.accent ?? '#4A7AB5';
  const INACTIVE = theme?.textMuted ?? '#a0b8d0';
  const TAB_BG = theme?.surface ?? theme?.card ?? '#fff';
  const TAB_BORDER = theme?.border ?? '#a0b8d0';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopColor: TAB_BORDER,
          borderTopWidth: 1.5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="ShareCode"
        component={ShareScreen}
        options={{
          tabBarLabel: t.shareTabCode ?? 'Code',
          tabBarIcon: ({ color, size }) => <IconCode color={color} size={size ?? 24} />,
        }}
      />
      <Tab.Screen
        name="ShareQuestionnaire"
        component={QuestionnaireScreen}
        options={{
          tabBarLabel: t.shareTabQuestionnaire ?? 'Questionnaire',
          tabBarIcon: ({ color, size }) => (
            <IconQuestionnaire color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tab.Screen
        name="ShareStudies"
        component={RecoveryStudiesScreen}
        options={{
          tabBarLabel: t.shareTabStudies ?? 'Studies',
          tabBarIcon: ({ color, size }) => <IconStudies color={color} size={size ?? 24} />,
        }}
      />
    </Tab.Navigator>
  );
}
