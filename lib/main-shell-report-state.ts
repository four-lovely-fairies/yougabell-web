import type { HomeDashboard } from "./home-data";

export type MainShellReportState = {
  childId: string | null;
  hasUnviewedWeeklyReport: boolean;
  updatedAt: number;
};

export const reportStateFromHome = (
  data: HomeDashboard,
  updatedAt = Date.now(),
): MainShellReportState => ({
  childId: data.selectedChild.id,
  hasUnviewedWeeklyReport: data.hasUnviewedWeeklyReport,
  updatedAt,
});

export const reportStateForChild = (
  state: MainShellReportState | null,
  childId: string | null,
) => (state?.childId === childId ? state : null);
