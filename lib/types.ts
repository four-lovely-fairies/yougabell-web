// 온보딩 v2 — 클라이언트 타입.
// 기획: https://github.com/four-lovely-fairies/yougabell/blob/main/docs/features/20260508-onboarding.md
// 서버 enum과 일치 (lowercase).

export type Gender = "female" | "male";
export type WorkStatus = "working" | "full_time_caregiver";
export type Weekday =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";
export type TimeSlot =
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "all_day";

export type ParentDraft = {
  name?: string;
  birthDate?: string; // "YYYY-MM-DD"
  gender?: Gender;
  workStatus?: WorkStatus | null;
};

export type ChildDraft = {
  tempId: string;
  name?: string;
  birthDate?: string;
  gender?: Gender;
  notes?: string;
};

export type AppUsageSlot = {
  dayOfWeek: Weekday;
  slot: TimeSlot;
};

export type OnboardingStep =
  | "intro"
  | "parent"
  | "children"
  | "app-usage";

export type OnboardingDraft = {
  schemaVersion: 2;
  lastStep: OnboardingStep;
  parent?: ParentDraft;
  children?: ChildDraft[];
  appUsage?: AppUsageSlot[];
  updatedAt: string;
};

export type CompleteOnboardingPayload = {
  parent: {
    name: string;
    birthDate: string;
    gender: Gender;
    workStatus?: WorkStatus | null;
  };
  children: Array<{
    name: string;
    birthDate: string;
    gender: Gender;
    notes?: string;
  }>;
  appUsage: AppUsageSlot[];
};

export type MeResponse = {
  id: string;
  name: string;
  birthDate: string;
  gender: Gender;
  workStatus: WorkStatus | null;
  onboardedAt: string | null;
  children: Array<{
    id: string;
    name: string;
    birthDate: string;
    gender: Gender;
    notes: string | null;
  }>;
  appUsageSlots: Array<{ dayOfWeek: Weekday; slot: TimeSlot }>;
};

export const WEEKDAYS: Weekday[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
  sun: "일",
};

export const TIME_SLOTS: TimeSlot[] = [
  "morning",
  "afternoon",
  "evening",
  "night",
  "all_day",
];

export const TIME_SLOT_LABEL: Record<TimeSlot, string> = {
  morning: "🌅 오전",
  afternoon: "☀️ 오후",
  evening: "🌙 저녁",
  night: "🌃 밤",
  all_day: "🏠 하루 종일",
};
