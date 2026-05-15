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

export type OnboardingStep =
  | "intro"
  | "consent"
  | "parent"
  | "interest"
  | "notification"
  | "app-usage"
  | "children";

export type NotificationPermission = "granted" | "denied";

export type InterestId =
  | "working-parent"
  | "home-care"
  | "language"
  | "social"
  | "physical"
  | "cognition";

export type ConsentDraft = {
  service: boolean; // 필수
  privacy: boolean; // 필수
  marketing: boolean; // 선택
};

export type OnboardingDraft = {
  schemaVersion: 3;
  lastStep: OnboardingStep;
  parent?: ParentDraft;
  consents?: ConsentDraft;
  children?: ChildDraft[];
  interests?: InterestId[];
  notification?: NotificationPreference;
  /**
   * OS 알림 권한 요청 결과. null이면 미요청.
   * granted → app-usage 진입, denied → app-usage skip.
   */
  notificationPermission?: NotificationPermission | null;
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
  // v4 흐름: 알림 권한 거부 시 미전송. server는 null로 저장(별도 task — 현재 DTO required).
  notification?: NotificationPreference;
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
  {
    label: string;
    sub: string;
    emoji: string;
    defaultTime?: string;
    chips?: string[];
  }
> = {
  morning: {
    label: "오전",
    sub: "(08:00-09:00)",
    emoji: "🌅",
    defaultTime: "08:00",
    chips: ["07:30", "08:00", "08:30", "09:00"],
  },
  afternoon: {
    label: "오후",
    sub: "(12:00-13:00)",
    emoji: "☀️",
    defaultTime: "12:00",
    chips: ["12:00", "12:30", "13:00", "13:30"],
  },
  evening: {
    label: "저녁",
    sub: "(18:00-20:00)",
    emoji: "🌙",
    defaultTime: "18:00",
    chips: ["18:00", "19:00", "20:00"],
  },
  night: {
    label: "밤",
    sub: "(22:00 이후)",
    emoji: "🌃",
    defaultTime: "22:00",
    chips: ["22:00", "23:00"],
  },
  custom: {
    label: "직접 입력",
    sub: "시간대를 직접 입력합니다.",
    emoji: "🌞",
  },
};
