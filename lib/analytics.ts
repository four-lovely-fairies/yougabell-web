// 분석 이벤트. 실제 발송기(GA / Mixpanel / PostHog)는 후속.
// 본 구현은 콘솔에만 출력하는 placeholder.

export type OnboardingEvent =
  | { type: "onboarding_intro_view"; page?: number }
  | { type: "onboarding_skip"; from: string }
  | {
      type: "onboarding_step_complete";
      step: "parent" | "children" | "app_usage";
    }
  | { type: "onboarding_work_status_filled" }
  | { type: "onboarding_finish" };

export function track(event: OnboardingEvent): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event.type, event);
  }
  // TODO(analytics): 실제 트래커 통합
}
