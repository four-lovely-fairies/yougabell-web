import type { HomeDashboard as HomeDashboardData } from "@/lib/home-data";
import { HOME_ICON_PATHS } from "./icons";

export function splitMissionTitle(title: string): string[] {
  if (title.includes("\n")) {
    return title.split("\n");
  }

  const parts = title.split(" ");
  if (parts.length <= 3) {
    return [title];
  }

  const pivot = Math.ceil(parts.length / 2);
  return [parts.slice(0, pivot).join(" "), parts.slice(pivot).join(" ")];
}

export function monthHeadingLabel(week: HomeDashboardData["week"]): string {
  const baseDate = week.days[0]?.date;
  if (!baseDate) {
    return week.monthLabel;
  }

  const [year] = baseDate.split("-");
  return `${year}년 ${week.monthLabel}`;
}

export function moodIconPath(level: 1 | 2 | 3 | 4 | 5): string {
  switch (level) {
    case 1:
      return HOME_ICON_PATHS.moodVeryBad;
    case 2:
      return HOME_ICON_PATHS.moodBad;
    case 3:
      return HOME_ICON_PATHS.moodNeutral;
    case 4:
      return HOME_ICON_PATHS.moodGood;
    case 5:
      return HOME_ICON_PATHS.moodVeryGood;
  }
}
