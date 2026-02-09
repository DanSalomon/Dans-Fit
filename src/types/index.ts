export type ActivityCategory = 'running' | 'cycling' | 'swimming' | 'gym';

export type MeasurementUnit = 'km' | 'hrs';

export interface Goal {
  id: string;
  category: ActivityCategory;
  target: number;
}

export interface ActivityConfig {
  category: ActivityCategory;
  label: string;
  unit: MeasurementUnit;
  exerciseTypes: number[];
  color: string;
  icon: string;
}

export interface WeeklyProgress {
  goalId: string;
  category: ActivityCategory;
  current: number;
  target: number;
  unit: MeasurementUnit;
}

export interface ExerciseSessionRecord {
  startTime: string;
  endTime: string;
  exerciseType: number;
}

export interface DistanceRecord {
  startTime: string;
  endTime: string;
  distance: {
    inKilometers: number;
  };
}
