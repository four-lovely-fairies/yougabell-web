import { fetchServerMe } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 온보딩 viewport — 메인과 동일한 모바일 frame을 유지하고 콘텐츠만 교체.
// 좌우 padding(20px)도 layout이 책임 → 모든 page가 자동으로 정렬된 콘텐츠 영역을 가짐.
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const me = await fetchServerMe();
  // 이미 온보딩 완료한 사용자는 홈으로. 미인증·미온보딩은 통과.
  if (me?.onboardedAt) {
    redirect("/");
  }
  return (
    <div className="min-h-screen flex justify-center bg-[#ddd2df]">
      <div
        className="relative w-full max-w-98 min-h-screen bg-white overflow-hidden flex flex-col px-5"
        // safe-area inset이 0인 환경(데스크톱·일부 Android)에서도 최소 여백 보장
        style={{
          paddingTop: "max(12px, env(safe-area-inset-top))",
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </div>
    </div>
  );
}
