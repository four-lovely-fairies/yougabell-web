/** Sunday is the weekly report publication day. */
export function daysUntilWeeklyReport(now = new Date()): number {
  const days = (7 - now.getDay()) % 7;
  return days === 0 ? 7 : days;
}
