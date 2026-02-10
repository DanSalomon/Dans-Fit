import {startOfWeek, endOfWeek, subWeeks, format} from 'date-fns';

export function getWeekBoundaries(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const start = startOfWeek(date, {weekStartsOn: 0}); // Sunday
  const end = endOfWeek(date, {weekStartsOn: 0}); // Saturday
  return {start, end};
}

export function formatWeekRange(date: Date = new Date()): string {
  const {start, end} = getWeekBoundaries(date);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}

export function getPastWeekBoundaries(weeksAgo: number): {
  start: Date;
  end: Date;
} {
  const pastDate = subWeeks(new Date(), weeksAgo);
  return getWeekBoundaries(pastDate);
}

export function getWeekKey(date: Date): string {
  const {start} = getWeekBoundaries(date);
  return format(start, 'yyyy-MM-dd');
}
