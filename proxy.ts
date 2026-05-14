import { updateSession } from "./lib/supabase/middleware";
import type { NextRequest } from "next/server";

/**
 * Supabase 세션을 매 요청마다 새로고침해 Server Component·라우트 핸들러가
 * 최신 access_token으로 동작하도록 한다.
 *
 * 온보딩 게이트(미완료자 강제 /onboarding, 완료자 /onboarding 차단)는
 * Server Component에서 `fetchServerMe()` 결과로 redirect — middleware는 라우팅 분기 X.
 */
export async function proxy(request: NextRequest) {
  const { response } = await updateSession(request);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
