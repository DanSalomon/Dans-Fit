import {ExerciseCatalogEntry} from '../types';

export const EXERCISE_CATALOG: ExerciseCatalogEntry[] = [
  {
    id: 'bicep-curl-dumbbell',
    name: 'Bicep Curl (Dumbbell)',
    image: require('../../assets/exercises/bicep-curl-dumbbell.png'),
  },
  {
    id: 'incline-bench-press-dumbbell',
    name: 'Incline Bench Press (Dumbbell)',
    image: require('../../assets/exercises/incline-bench-press-dumbbell.png'),
  },
  {
    id: 'bench-press-barbell',
    name: 'Bench Press (Barbell)',
    image: require('../../assets/exercises/bench-press-barbell.png'),
  },
  {
    id: 'chest-fly-machine',
    name: 'Chest Fly (Machine)',
    image: require('../../assets/exercises/chest-fly-machine.png'),
  },
  {
    id: 'lateral-raise-dumbbell',
    name: 'Lateral Raise (Dumbbell)',
    image: require('../../assets/exercises/lateral-raise-dumbbell.png'),
  },
  {
    id: 'seated-shoulder-press-machine',
    name: 'Seated Shoulder Press (Machine)',
    image: require('../../assets/exercises/seated-shoulder-press-machine.png'),
  },
  {
    id: 'lat-pulldown-cable',
    name: 'Lat Pulldown (Cable)',
    image: require('../../assets/exercises/lat-pulldown-cable.png'),
  },
  {
    id: 'decline-crunch-weighted',
    name: 'Decline Crunch (Weighted)',
    image: require('../../assets/exercises/decline-crunch-weighted.png'),
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    image: require('../../assets/exercises/seated-cable-row.png'),
  },
];

export const EXERCISE_BY_ID: Record<string, ExerciseCatalogEntry> = Object.fromEntries(
  EXERCISE_CATALOG.map(e => [e.id, e]),
);
