// "새로워진 육아벨을 소개해요" 업데이트 안내 — 기존(재방문) 사용자에게 기기당 1회만 노출.
// 신규 가입자는 온보딩 완료 시점에 본 것으로 기록해서 뜨지 않게 한다.
// 다음 업데이트 안내를 만들 때는 키의 날짜만 바꾸면 다시 1회 노출된다.
const WHATS_NEW_KEY = "yb:whats-new:2026-11-17";

export function shouldShowWhatsNew(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(WHATS_NEW_KEY) === null;
  } catch {
    // 저장소를 못 쓰는 환경에서는 매번 뜨지 않도록 숨긴다.
    return false;
  }
}

export function markWhatsNewSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WHATS_NEW_KEY, new Date().toISOString());
  } catch {
    // 무시
  }
}
