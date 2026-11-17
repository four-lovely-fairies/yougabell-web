import { Skeleton } from "@/components/ui/skeleton";

// 설정 화면으로 넘어가는 동안 바로 보여 주는 자리표시.
export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-safe" role="status" aria-label="불러오는 중">
      <Skeleton className="mt-4 h-8 w-28 rounded-lg" />
      <Skeleton className="h-20 rounded-[20px]" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
