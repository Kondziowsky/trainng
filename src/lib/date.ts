/**
 * Date helpers.
 *
 * The app stores plan dates as calendar dates (`YYYY-MM-DD`), never instants.
 * "My Friday workout" must stay on Friday regardless of timezone, so every
 * conversion here is deliberately LOCAL — using `toISOString()` would shift the
 * date for anyone east or west of UTC.
 *
 * No date library: the MVP needs a month grid and two format calls, both of
 * which `Intl` already does well.
 */

/** A calendar date in `YYYY-MM-DD` form. */
export type ISODate = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

/** Parses `YYYY-MM-DD` into a local-midnight Date. */
export function fromISODate(value: ISODate): Date {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function isSameISODate(a: ISODate, b: ISODate): boolean {
  return a === b;
}

/** e.g. "Wednesday, August 19" */
export function formatLongDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** e.g. "August 2026" */
export function formatMonthYear(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

/** e.g. "Fri, 21 Aug" */
export function formatShortDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/** Monday-first short weekday initials, localised. e.g. ["Mo","Tu",...] */
export function weekdayLabels(locale?: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, i) =>
    formatter.format(new Date(2024, 0, 1 + i)).slice(0, 2),
  );
}

export type CalendarCell = {
  date: ISODate;
  dayOfMonth: number;
  /** False for the leading/trailing days that pad the grid. */
  inCurrentMonth: boolean;
};

/**
 * Builds a Monday-first month grid of whole weeks (5 or 6 rows of 7).
 */
export function buildMonthGrid(month: Date): CalendarCell[][] {
  const first = startOfMonth(month);
  // getDay(): 0 = Sunday. Shift so Monday = 0.
  const leading = (first.getDay() + 6) % 7;
  const gridStart = addDays(first, -leading);

  const totalDays = endOfMonth(month).getDate();
  const weeks = Math.ceil((leading + totalDays) / 7);

  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const date = addDays(gridStart, week * 7 + day);
      return {
        date: toISODate(date),
        dayOfMonth: date.getDate(),
        inCurrentMonth: date.getMonth() === month.getMonth(),
      };
    }),
  );
}
