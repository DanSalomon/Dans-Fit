import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {DashboardScreen} from '../screens/DashboardScreen';
import {WeekPlanScreen} from '../screens/WeekPlanScreen';
import {HistoryScreen} from '../screens/HistoryScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {GymScreen} from '../screens/GymScreen';
import {useGoals} from '../hooks/useGoals';
import {useWeekPlan} from '../hooks/useWeekPlan';
import {useGymWorkouts} from '../hooks/useGymWorkouts';
import {useGymSessions} from '../hooks/useGymSessions';
import {colors} from '../constants/colors';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  const {goals, loading, addGoal, editGoal, removeGoal} = useGoals();
  const {plan, loading: planLoading, toggleActivity} = useWeekPlan();
  const {
    workouts,
    loading: workoutsLoading,
    addWorkout,
    updateWorkout,
    removeWorkout,
  } = useGymWorkouts();
  const {sessions, loading: sessionsLoading, appendSession} = useGymSessions();

  if (loading || planLoading || workoutsLoading || sessionsLoading) {
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
        name="Plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>📋</Text>
          ),
        }}>
        {() =>
          plan ? (
            <WeekPlanScreen plan={plan} onToggleActivity={toggleActivity} />
          ) : null
        }
      </Tab.Screen>
      <Tab.Screen
        name="Gym"
        options={{
          title: 'Gym',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>🏋️</Text>
          ),
        }}>
        {() => (
          <GymScreen
            workouts={workouts}
            sessions={sessions}
            onAddWorkout={addWorkout}
            onUpdateWorkout={updateWorkout}
            onRemoveWorkout={removeWorkout}
            onAppendSession={appendSession}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="History"
        options={{
          title: 'History',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>📅</Text>
          ),
        }}>
        {() => <HistoryScreen goals={goals} gymSessions={sessions} />}
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
