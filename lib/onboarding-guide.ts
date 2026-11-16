// 로그인 전 서비스 소개(가이드) 노출 여부. 기기 단위로 한 번만 보여준다.
const GUIDE_SEEN_KEY = "yougabell:onboarding-guide-seen";

export const ONBOARDING_GUIDE_PATH = "/onboarding/guide";

export function hasSeenOnboardingGuide(): boolean {
  try {
    return window.localStorage.getItem(GUIDE_SEEN_KEY) === "1";
  } catch {
    // 저장소 접근이 막힌 환경에서는 가이드로 로그인이 막히지 않게 본 것으로 간주한다.
    return true;
  }
}

export function markOnboardingGuideSeen(): void {
  try {
    window.localStorage.setItem(GUIDE_SEEN_KEY, "1");
  } catch {
    // 저장 실패는 무시 — 다음 실행 때 가이드가 한 번 더 보일 뿐이다.
  }
}
