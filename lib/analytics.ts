// 분석 이벤트. 실제 발송기(GA / Mixpanel / PostHog)는 후속.
// 본 구현은 콘솔에만 출력하는 placeholder.

export type OnboardingEvent =
  | { type: "onboarding_intro_view"; page?: number }
  | { type: "onboarding_google_sign_in_click" }
  | { type: "onboarding_apple_sign_in_click" }
  | {
      type: "onboarding_step_complete";
      step:
        | "consent"
        | "parent"
        | "interest"
        | "notification"
        | "app_usage"
        | "children";
    }
  | { type: "onboarding_work_status_filled" }
  | { type: "onboarding_skip"; from: "intro" }
  | { type: "onboarding_finish" };

// 설정 화면 이벤트 (docs/features/20260519-settings.md §6).
export type SettingsEvent =
  | { type: "settings_open" }
  | {
      type: "settings_notification_change";
      notificationType: "play_10min" | "weekly_report";
      enabled: boolean;
    }
  | { type: "settings_interests_save"; count: number }
  | { type: "settings_parent_save" }
  | { type: "settings_child_add" }
  | { type: "settings_child_update"; childId: string }
  | { type: "settings_child_delete"; childId: string }
  | { type: "settings_logout" }
  | { type: "settings_account_delete_confirm" };

// AI 챗봇 이벤트 (docs/features/20260525-ai-integration.md §6).
export type ChatEvent =
  | { type: "chat_open" }
  | { type: "chat_message_send"; length: number }
  | { type: "chat_response_first_token"; latencyMs: number }
  | {
      type: "chat_response_complete";
      latencyMs: number;
      cardCount: number;
      sourceCount: number;
    }
  | { type: "chat_response_error"; reason: string }
  | { type: "chat_quick_reply_use"; label: string }
  | { type: "chat_source_link_open"; domain: string };

export type AnalyticsEvent = OnboardingEvent | SettingsEvent | ChatEvent;

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event.type, event);
  }
  // TODO(analytics): 실제 트래커 통합
}
