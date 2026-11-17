// 온보딩을 마친 사용자임을 기억하는 쿠키.
// 화면을 옮길 때마다 서버 레이아웃이 API `/me`를 다시 불러 온보딩 여부를 확인하느라 전환이
// 늦어졌다. 한 번 확인되면 이 쿠키(값 = 사용자 id)를 남겨 두고, 서버는 같은 사용자의 세션이면
// `/me` 왕복 없이 바로 통과시킨다. 온보딩 게이트는 화면 분기용일 뿐 권한 확인은 API가 하므로
// 쿠키가 남아 있어도 데이터 접근에는 영향이 없다. 다른 계정으로 로그인하면 id가 달라 다시 확인한다.
export const ONBOARDED_COOKIE = "yb_onboarded";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function rememberOnboarded(userId: string) {
  if (typeof document === "undefined" || !userId) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ONBOARDED_COOKIE}=${encodeURIComponent(userId)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function forgetOnboarded() {
  if (typeof document === "undefined") return;
  document.cookie = `${ONBOARDED_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
