import type { Plan } from './app-store';

export const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Local calendar day of a date, e.g. 2026-10-25 */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatLongDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours && rest) return `${hours} h ${rest} m`;
  if (hours) return `${hours} h`;
  return `${rest} m`;
}

/** Minutes from midnight to a readable clock time, e.g. 1020 -> 5:00 PM */
export function formatClock(minutes: number): string {
  const hours24 = Math.floor(minutes / 60) % 24;
  const rest = minutes % 60;
  const suffix = hours24 < 12 ? 'AM' : 'PM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(rest).padStart(2, '0')} ${suffix}`;
}

export function isPlanScheduledOn(plan: Plan, date: Date): boolean {
  if (plan.repeat === 'daily') return true;
  if (plan.repeat === 'days') return plan.days.includes(date.getDay());
  return plan.dateKey === dayKey(date);
}

export function planMinutes(plan: Plan): number {
  if (plan.mode === 'duration') return plan.durationMin ?? 0;
  return Math.max(0, (plan.endMin ?? 0) - (plan.startMin ?? 0));
}

export function scheduleLabel(plan: Plan): string {
  if (plan.mode === 'time' && plan.startMin != null && plan.endMin != null) {
    return `${formatClock(plan.startMin)} – ${formatClock(plan.endMin)}`;
  }
  return formatDuration(plan.durationMin ?? 0);
}

/** Weekday names in week order, starting on Monday, e.g. "Mon, Wed" */
export function formatDays(days: number[]): string {
  return [...days]
    .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
    .map((day) => DAY_NAMES[day])
    .join(', ');
}

export function repeatLabel(plan: Plan): string {
  if (plan.repeat === 'daily') return 'Every day';
  if (plan.repeat === 'days') return formatDays(plan.days);
  return 'Today only';
}

/** Plans with a fixed time come first, sorted by start time. */
export function comparePlans(a: Plan, b: Plan): number {
  const aKey = a.mode === 'time' ? a.startMin ?? 0 : Number.MAX_SAFE_INTEGER;
  const bKey = b.mode === 'time' ? b.startMin ?? 0 : Number.MAX_SAFE_INTEGER;
  return aKey - bKey || a.createdAt - b.createdAt;
}

export function completedMinutesOn(plans: Plan[], date: Date): number {
  const key = dayKey(date);
  return plans
    .filter((plan) => isPlanScheduledOn(plan, date) && plan.history[key])
    .reduce((total, plan) => total + planMinutes(plan), 0);
}

/** Monday of the week that contains the given date */
export function startOfWeek(date: Date): Date {
  const start = new Date(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  return start;
}

export function completedMinutesThisWeek(plans: Plan[], today: Date): number {
  const start = startOfWeek(today);
  let total = 0;
  for (let offset = 0; offset < 7; offset++) {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);
    total += completedMinutesOn(plans, day);
  }
  return total;
}

export function planMatchesQuery(plan: Plan, subjectName: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const topics = Array.isArray(plan.topics) ? plan.topics : [];
  return [plan.title, subjectName, ...topics].some(
    (value) => value && String(value).toLowerCase().includes(needle),
  );
}
