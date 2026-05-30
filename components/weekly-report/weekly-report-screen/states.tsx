import { RefreshCw } from "lucide-react";
import { type WeeklyReportLoadState } from "@/lib/api";
import { type WeeklyReportEmptyState } from "@/lib/weekly-report-data";

export const WeeklyReportEmpty = ({
  emptyState,
  onStartMission,
}: {
  emptyState: WeeklyReportEmptyState | null;
  onStartMission: () => void;
}) => (
  <div className="flex min-h-180 flex-1 flex-col items-center justify-center gap-9 px-8 pb-20 text-center">
    {/* empty-mascot.png은 3×3(9컷) 마스코트 시트 — background sprite로 한 컷만 노출.
       background-position으로 컷 선택: 가로 0/50/100% = 좌/중/우, 세로 0/50/100% = 상/중/하.
       현재: 50% 100% = 가운데-아래(클립보드 든 마스코트, 리포트 테마). */}
    <div
      className="w-36 bg-no-repeat aspect-[1024/837]"
      style={{
        backgroundImage: "url('/images/figma/report/empty-mascot.png')",
        backgroundSize: "300% 300%",
        backgroundPosition: "50% 100%",
      }}
      aria-hidden
    />
    <div className="flex w-full flex-col items-center gap-7">
      <div className="space-y-3">
        <h2 className="text-lg font-bold leading-[25px]">
          {emptyState?.title ?? "아직 주간 리포트가 없습니다"}
        </h2>
        <p className="mx-auto max-w-65 whitespace-pre-line text-sm leading-5 text-gray-500">
          {emptyState?.description ??
            "미션을 수행하고 아이와의 소중한 순간을 기록해보세요. 일주일 후 첫 리포트를 확인할 수 있습니다."}
        </p>
      </div>
      <button
        type="button"
        onClick={onStartMission}
        className="flex h-12 w-65.75 items-center justify-center rounded-2xl bg-primary-300 px-5 text-base font-medium leading-6 text-white"
      >
        {emptyState?.ctaLabel ?? "미션 시작하기"}
      </button>
    </div>
  </div>
);

export const WeeklyReportError = ({
  error,
  onRetry,
}: {
  error: NonNullable<WeeklyReportLoadState["error"]>;
  onRetry: () => void;
}) => (
  <div className="flex min-h-180 flex-1 flex-col items-center justify-center gap-6 px-8 pb-20 text-center">
    <div className="size-24 rounded-full bg-error-50" aria-hidden />
    <div>
      <h2 className="text-lg font-bold leading-[25px]">
        주간 리포트를 불러오지 못했습니다
      </h2>
      <p className="mt-3 text-sm leading-5 text-gray-500">{error.message}</p>
    </div>
    <button
      type="button"
      onClick={onRetry}
      className="flex h-12 min-w-40 items-center justify-center gap-2 rounded-2xl bg-primary-300 px-5 text-base font-medium text-white"
    >
      <RefreshCw className="size-4" aria-hidden />
      다시 시도
    </button>
  </div>
);

export const WeeklyReportSkeleton = () => (
  <div className="flex flex-1 flex-col gap-8 px-5 pb-12 pt-5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="space-y-3">
        <div className="h-6 w-40 animate-pulse rounded-full bg-[#eeeeee]" />
        <div className="h-32 animate-pulse rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_2px_rgba(0,0,0,0.05)]" />
      </div>
    ))}
  </div>
);
