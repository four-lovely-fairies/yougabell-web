import { NextResponse } from "next/server";

/**
 * 온보딩 게이트 — placeholder.
 *
 * TODO(auth): Supabase 세션 cookie + `GET /me` 결과(onboardedAt)로 분기.
 * 의도된 동작:
 *   - 인증 사용자 중 me.onboardedAt == null → /onboarding/* 외 차단 → /onboarding/intro
 *   - 인증 사용자 중 me.onboardedAt != null → /onboarding/* 진입 차단 → /
 *   - 비인증 → /login (별도 task)
 *
 * 현재는 라우팅만 통과시키고 게이트는 클라이언트 측 흐름 가정.
 */
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // /_next, /api, 정적 자산은 proxy 제외
    "/((?!_next|favicon.ico|.*\\.).*)",
  ],
};
