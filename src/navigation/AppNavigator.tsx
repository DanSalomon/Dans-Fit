import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {DashboardScreen} from '../screens/DashboardScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {useGoals} from '../hooks/useGoals';
import {colors} from '../constants/colors';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  const {goals, loading, addGoal, editGoal, removeGoal} = useGoals();

  if (loading) {
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: colors.text,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        options={{
          title: 'Dans-Fit',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>📊</Text>
          ),
        }}>
        {() => <DashboardScreen goals={goals} />}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{
          title: 'Goals',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>⚙️</Text>
          ),
        }}>
        {() => (
          <SettingsScreen
            goals={goals}
            onAddGoal={addGoal}
            onEditGoal={editGoal}
            onRemoveGoal={removeGoal}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
