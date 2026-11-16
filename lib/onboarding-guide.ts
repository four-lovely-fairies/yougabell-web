// 로그인 전 서비스 소개(가이드) 노출 여부.
// 로그인하지 않은 사용자에게는 앱을 새로 열 때마다 보여준다. 한 번 실행하는 동안만
// 기록(sessionStorage)해서, 가이드 → 로그인 화면 이동이나 OAuth 오류로 로그인 화면에
// 다시 돌아올 때는 반복해서 띄우지 않는다.
const GUIDE_SEEN_KEY = "yougabell:onboarding-guide-seen";

export const ONBOARDING_GUIDE_PATH = "/onboarding/guide";

export function hasSeenOnboardingGuide(): boolean {
  try {
    return window.sessionStorage.getItem(GUIDE_SEEN_KEY) === "1";
  } catch {
    // 저장소 접근이 막힌 환경에서는 가이드로 로그인이 막히지 않게 본 것으로 간주한다.
    return true;
  }
}

export function markOnboardingGuideSeen(): void {
  try {
    window.sessionStorage.setItem(GUIDE_SEEN_KEY, "1");
  } catch {
    // 저장 실패는 무시 — 로그인 화면으로 갈 때 가이드가 한 번 더 보일 수 있을 뿐이다.
  }
}
