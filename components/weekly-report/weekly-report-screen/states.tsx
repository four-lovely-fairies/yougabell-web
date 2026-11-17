import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { type WeeklyReportLoadState } from "@/lib/api";
import { type WeeklyReportEmptyState } from "@/lib/weekly-report-data";
import { isFirstPlayEmptyState } from "@/lib/weekly-report-data";
import { getWeeklyReportCountdown } from "@/lib/report-progress";
import { Skeleton } from "@/components/ui/skeleton";

// 빈 리포트 아이콘 — Figma icon/empty-document (42×51)
const EmptyDocumentIcon = () => (
  <Image
    src="/images/figma/report/empty-document.svg"
    alt=""
    width={42}
    height={51}
    className="h-12.75 w-10.5 shrink-0"
  />
);

export const WeeklyReportEmpty = ({
  emptyState,
  onStartMission,
}: {
  emptyState: WeeklyReportEmptyState | null;
  onStartMission: () => void;
}) => {
  if (!isFirstPlayEmptyState(emptyState)) {
    // 지난주 기록이 없을 때는 웹 문구로 고정
    const noRecordLastWeek = emptyState?.reason === "no_mission_for_week";
    const title = noRecordLastWeek
      ? "아직 주간 리포트가 없어요"
      : (emptyState?.title ?? "주간 리포트를 준비하고 있어요");
    const description = noRecordLastWeek
      ? "지난주에는 리포트로 만들 기록이 없었어요.\n이번 주 놀이를 시작해보세요"
      : (emptyState?.description ?? "리포트가 준비되면 알림으로 알려드릴게요.");
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-9 px-8 pb-20 text-center">
        <EmptyDocumentIcon />
        <div className="flex w-full flex-col items-center gap-7">
          <div className="space-y-3">
            <h2 className="text-lg font-bold leading-[25px]">
              {title}
            </h2>
            <p className="mx-auto max-w-75 whitespace-pre-line break-keep text-sm leading-5 text-gray-500">
              {description}
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
        <EmptyDocumentIcon />
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
  <div
    className="flex flex-1 flex-col gap-8 px-5 pb-12 pt-5"
    role="status"
    aria-label="불러오는 중"
  >
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="space-y-3">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    ))}
  </div>
);
