// Sample dates are plain days ("2026-12-04"); format them in UTC so a
// viewer's time zone never shifts them by a day.

const DAY = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export function formatDay(isoDay: string): string {
  return DAY.format(new Date(`${isoDay.slice(0, 10)}T00:00:00Z`));
}

/** "2026-12-04" plus `days`, as "YYYY-MM-DD" */
export function addDays(isoDay: string, days: number): string {
  const d = new Date(`${isoDay.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatRange(from: string, to: string): string {
  return from.slice(0, 10) === to.slice(0, 10) ? formatDay(from) : `${formatDay(from)} – ${formatDay(to)}`;
}
