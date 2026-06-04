import { fetchServerMe } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 온보딩 viewport — 메인과 동일한 모바일 frame을 유지하고 콘텐츠만 교체.
// 좌우 padding(20px)도 layout이 책임 → 모든 page가 자동으로 정렬된 콘텐츠 영역을 가짐.
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const me = await fetchServerMe();
  // 이미 온보딩 완료한 사용자는 홈으로. intro 공개 여부는 하위 route group이 처리한다.
  if (me?.onboardedAt) {
    redirect("/");
  }
  // 루트 layout이 이미 가운데 정렬된 흰색 모바일 frame(max-w-[430px])을 제공한다.
  // 여기서 frame을 다시 감싸면 폭 차이만큼 좌우에 배경 띠가 노출되므로, 부모 frame을 그대로 채운다.
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-x-clip bg-white px-5"
      // safe-area inset이 0인 환경(데스크톱·일부 Android)에서도 최소 여백 보장
      style={{
        paddingBottom: "max(20px, env(safe-area-inset-bottom))",
      }}
    >
      {children}
    </div>
  );
}
