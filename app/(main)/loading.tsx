import { Skeleton } from "@/components/ui/skeleton";

// 홈·로드맵·주간리포트로 넘어가는 동안 바로 보여 주는 자리표시 (하단 탭은 그대로 유지).
export default function MainLoading() {
  return (
    <div className="flex flex-col gap-4 px-5 pb-28 pt-safe" role="status" aria-label="불러오는 중">
      <Skeleton className="mt-3 h-10 w-40 rounded-lg" />
      <Skeleton className="h-44 rounded-[24px]" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28 rounded-[20px]" />
        <Skeleton className="h-28 rounded-[20px]" />
      </div>
      <Skeleton className="h-32 rounded-[24px]" />
    </div>
  );
}
