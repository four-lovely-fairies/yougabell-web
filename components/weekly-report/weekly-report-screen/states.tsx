import { RefreshCw } from "lucide-react";
import { Mascot } from "@/components/characters/mascot";
import { type WeeklyReportLoadState } from "@/lib/api";
import { type WeeklyReportEmptyState } from "@/lib/weekly-report-data";
import { isFirstPlayEmptyState } from "@/lib/weekly-report-data";
import { getWeeklyReportCountdown } from "@/lib/report-progress";

export const WeeklyReportEmpty = ({
  emptyState,
  onStartMission,
}: {
  emptyState: WeeklyReportEmptyState | null;
  onStartMission: () => void;
}) => {
  if (!isFirstPlayEmptyState(emptyState)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-9 px-8 pb-20 text-center">
        <Mascot pose="reviewing" className="w-36" />
        <div className="flex w-full flex-col items-center gap-7">
          <div className="space-y-3">
            <h2 className="text-lg font-bold leading-[25px]">
              {emptyState?.title ?? "주간 리포트를 준비하고 있어요"}
            </h2>
            <p className="mx-auto max-w-65 whitespace-pre-line text-sm leading-5 text-gray-500">
              {emptyState?.description ??
                "리포트가 준비되면 알림으로 알려드릴게요."}
            </p>
          </div>
          <button
            type="button"
            onClick={onStartMission}
            className="flex h-12 w-65.75 items-center justify-center rounded-2xl bg-primary-300 px-5 text-base font-medium leading-6 text-white"
          >
            {emptyState?.ctaLabel ?? "놀이 시작하기"}
          </button>
        </div>
      </div>
    );
  }

  const countdown = getWeeklyReportCountdown();

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 pb-16 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-[34%] size-96 -translate-x-1/2 rounded-full bg-primary-50/70 blur-3xl"
        aria-hidden
      />
      <div className="relative flex w-full flex-col items-center">
        <Mascot pose="reviewing" className="w-28" />
        <h2 className="mt-12 text-[20px] font-bold leading-[1.4] tracking-[-0.4px] text-gray-800">
          {countdown.kind === "generation_tomorrow" ? (
            "주간 리포트가 내일 아침에 생성돼요."
          ) : (
            <>
              주간 리포트 생성까지{" "}
              <span className="text-primary-300">
                {countdown.daysRemaining}일
              </span>{" "}
              남았어요!
            </>
          )}
        </h2>
        <p className="mt-4 text-sm leading-[1.65] text-gray-400">
          아이와 놀이하고 기록하면 매주 일요일,
          <br />
          객관적인 성장 리포트를 받아볼 수 있어요
        </p>
        <button
          type="button"
          onClick={onStartMission}
          className="mt-9 flex h-15 w-full max-w-81.25 items-center justify-center rounded-2xl bg-primary-300 px-5 text-base font-medium leading-6 text-white"
        >
          놀이 시작하기
        </button>
      </div>
    </div>
  );
};

export const WeeklyReportError = ({
  error,
  onRetry,
}: {
  error: NonNullable<WeeklyReportLoadState["error"]>;
  onRetry: () => void;
}) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 pb-20 text-center">
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
