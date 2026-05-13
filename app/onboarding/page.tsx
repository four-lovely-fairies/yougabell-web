import { redirect } from "next/navigation";

// /onboarding 진입 시 첫 단계인 intro로 보냄.
// 추후 proxy(미들웨어)가 me.onboardedAt 분기로 자동 라우팅하면 본 페이지는
// 직접 진입한 사용자만 처리. 인증 통합 후에도 유지.
export default function OnboardingIndex() {
  redirect("/onboarding/intro");
}
