import {startOfWeek, endOfWeek, format} from 'date-fns';

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
