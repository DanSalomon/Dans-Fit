import {ActivityCategory, ActivityConfig} from '../types';
import {colors} from './colors';

export const ACTIVITY_CONFIGS: Record<ActivityCategory, ActivityConfig> = {
  running: {
    category: 'running',
    label: 'Running',
    unit: 'km',
    exerciseTypes: [56, 57], // running, treadmill
    color: colors.running,
    icon: '🏃',
  },
  cycling: {
    category: 'cycling',
    label: 'Cycling / Bike',
    unit: 'km',
    exerciseTypes: [8, 9, 10], // biking, biking stationary, mountain biking
    color: colors.cycling,
    icon: '🚴',
  },
  swimming: {
    category: 'swimming',
    label: 'Swimming',
    unit: 'km',
    exerciseTypes: [73, 74], // open water, pool
    color: colors.swimming,
    icon: '🏊',
  },
  gym: {
    category: 'gym',
    label: 'Gym / Strength',
    unit: 'hrs',
    exerciseTypes: [70, 81, 13, 36], // strength, weightlifting, calisthenics, HIIT
    color: colors.gym,
    icon: '🏋️',
  },
};

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'running',
  'cycling',
  'swimming',
  'gym',
];
