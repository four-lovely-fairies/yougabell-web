// 온보딩 v3 — 클라이언트 타입.
// 기획: https://github.com/four-lovely-fairies/yougabell/blob/main/docs/features/20260508-onboarding.md
// 서버 enum과 일치 (lowercase).

export type Gender = "female" | "male";
export type WorkStatus = "working" | "full_time_caregiver";
export type NotificationSlot =
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "custom";

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

// v3: 요일×시간대 매트릭스 폐기, 단일 시간대 선택 + 직접 입력 옵션 (Figma 2146:4530).
// docs/features/20260508-onboarding.md §3 (UserAppUsageSlot) 모델은 api 작업 시 갱신 필요.
export type NotificationPreference = {
  slot: NotificationSlot;
  time?: string; // "HH:MM" — custom일 때 필수, preset일 때 선택(미지정 시 시간대 디폴트)
};

export type OnboardingStep = "intro" | "parent" | "children" | "app-usage";

export type OnboardingDraft = {
  schemaVersion: 3;
  lastStep: OnboardingStep;
  parent?: ParentDraft;
  children?: ChildDraft[];
  notification?: NotificationPreference;
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
  notification: NotificationPreference;
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
  notification: NotificationPreference | null;
};

export const NOTIFICATION_SLOT_META: Record<
  NotificationSlot,
  { label: string; sub: string; defaultTime?: string; chips?: string[] }
> = {
  morning: {
    label: "오전",
    sub: "(08:00-09:00)",
    defaultTime: "08:00",
    chips: ["07:30", "08:00", "08:30", "09:00"],
  },
  afternoon: {
    label: "오후",
    sub: "(12:00-13:00)",
    defaultTime: "12:00",
    chips: ["12:00", "12:30", "13:00", "13:30"],
  },
  evening: {
    label: "저녁",
    sub: "(18:00-20:00)",
    defaultTime: "18:00",
    chips: ["18:00", "19:00", "20:00"],
  },
  night: {
    label: "밤",
    sub: "(22:00 이후)",
    defaultTime: "22:00",
    chips: ["22:00", "23:00"],
  },
  custom: {
    label: "직접 입력",
    sub: "시간대를 직접 입력합니다.",
  },
};
