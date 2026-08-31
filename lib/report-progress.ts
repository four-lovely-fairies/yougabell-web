/** Sunday is the weekly report publication day. */
export function daysUntilWeeklyReport(now = new Date()): number {
  const days = (7 - now.getDay()) % 7;
  return days === 0 ? 7 : days;
}

export type WeeklyReportCountdown =
  | { kind: "days"; daysRemaining: number }
  | { kind: "generation_tomorrow" };

export function getWeeklyReportCountdown(
  now = new Date(),
): WeeklyReportCountdown {
  if (now.getDay() === 0) {
    return { kind: "generation_tomorrow" };
  }

  return { kind: "days", daysRemaining: daysUntilWeeklyReport(now) };
}
