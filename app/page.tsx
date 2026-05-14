import { redirect } from "next/navigation";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { fetchServerMe } from "@/lib/supabase/server";

export default async function HomePage() {
  const me = await fetchServerMe();
  // 인증된 사용자가 온보딩 미완료면 강제 진입.
  // 미인증(me === null)은 일단 통과 — 로그인 라우트는 별도 task.
  if (me && !me.onboardedAt) {
    redirect("/onboarding/intro");
  }
  return <HomeDashboard />;
}
