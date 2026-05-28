import type { components } from "./generated/api-types";

export type WeeklyReportCurrent =
  components["schemas"]["WeeklyReportCurrentResponseDto"];
export type WeeklyReportDetail = components["schemas"]["WeeklyReportDetailDto"];
export type WeeklyReportEmptyState =
  components["schemas"]["WeeklyReportEmptyStateDto"];
export type WeeklyReportSelectedChild =
  components["schemas"]["WeeklyReportSelectedChildDto"];

export type WeeklyReportViewData = {
  selectedChild: WeeklyReportSelectedChild | null;
  report: WeeklyReportDetail | null;
  emptyState: WeeklyReportEmptyState | null;
};

export type DurationSegment = {
  value: string;
  unit: string;
};

export function splitDurationLabel(label: string): DurationSegment[] {
  const matches = [...label.matchAll(/(\d+)\s*([^\d\s]+)/g)];
  return matches.map((match) => ({
    value: match[1],
    unit: match[2],
  }));
}
