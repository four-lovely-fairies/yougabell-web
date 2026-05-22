"use client";

import {
  ArrowLeft,
  Bell,
  Bot,
  CalendarDays,
  Check,
  MessageSquare,
  Moon,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getStoredSelectedChildId,
  loadWeeklyReport,
  type WeeklyReportLoadState,
} from "@/lib/api";
import {
  splitDurationLabel,
  type WeeklyReportDetail,
  type WeeklyReportEmptyState,
  type WeeklyReportViewData,
} from "@/lib/weekly-report-data";

const keywordStyles = [
  {
    icon: CalendarDays,
    className:
      "bg-[#fff0d6] text-[#f9a116] shadow-[inset_0_0_10px_rgba(255,166,33,0.1)]",
  },
  {
    icon: MessageSquare,
    className:
      "bg-[#efe4ff] text-[#9349f4] shadow-[inset_0_0_10px_rgba(147,73,244,0.1)]",
  },
  {
    icon: Moon,
    className:
      "bg-[#e5ecff] text-[#497af4] shadow-[inset_0_0_10px_rgba(73,122,244,0.1)]",
  },
];

export const WeeklyReportScreen = () => {
  const router = useRouter();
  const [state, setState] = useState<WeeklyReportLoadState | null>(null);
  const [loading, setLoading] = useState(true);

  const requestReport = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get("reportId");
    return loadWeeklyReport({
      childId: getStoredSelectedChildId(),
      reportId,
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const next = await requestReport();
    setState(next);
    setLoading(false);
  }, [requestReport]);

  useEffect(() => {
    let active = true;
    void requestReport().then((next) => {
      if (!active) return;
      setState(next);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [requestReport]);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  const startMission = () => {
    router.push("/mission");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#fdfdfe] text-[#262626]">
      <WeeklyReportHeader onBack={goBack} />
      {loading ? (
        <WeeklyReportSkeleton />
      ) : state?.error ? (
        <WeeklyReportError error={state.error} onRetry={load} />
      ) : state?.data ? (
        <WeeklyReportContent data={state.data} onStartMission={startMission} />
      ) : null}
    </div>
  );
};

const WeeklyReportHeader = ({ onBack }: { onBack: () => void }) => (
  <header className="flex h-[103px] shrink-0 flex-col">
    <div className="h-[47px]" aria-hidden />
    <div className="flex h-14 items-center justify-between px-4">
      <button
        type="button"
        onClick={onBack}
        className="flex size-11 items-center justify-center text-[#262626]"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="size-6" aria-hidden />
      </button>
      <h1 className="text-base font-semibold leading-[22px]">주간 리포트</h1>
      <button
        type="button"
        className="flex size-11 items-center justify-center text-[#262626]"
        aria-label="알림 열기"
      >
        <Bell className="size-6" aria-hidden />
      </button>
    </div>
  </header>
);

const WeeklyReportContent = ({
  data,
  onStartMission,
}: {
  data: WeeklyReportViewData;
  onStartMission: () => void;
}) => {
  if (!data.report) {
    return (
      <WeeklyReportEmpty
        emptyState={data.emptyState}
        onStartMission={onStartMission}
      />
    );
  }

  return <WeeklyReportDetailView report={data.report} />;
};

const WeeklyReportDetailView = ({ report }: { report: WeeklyReportDetail }) => (
  <div className="flex flex-1 flex-col gap-8 px-5 pb-12 pt-5">
    <ReportSection title={report.headline.question}>
      <ReportCard>
        <h2 className="text-base font-bold leading-[22px]">
          {report.headline.title}
        </h2>
        {report.headline.body ? (
          <p className="mt-[15px] text-sm leading-5 text-[#7b7b7b]">
            {report.headline.body}
          </p>
        ) : null}
      </ReportCard>
    </ReportSection>

    <ReportSection title="이번주 요약">
      <div className="flex flex-col gap-2">
        <ReportCard>
          <p className="text-sm font-semibold leading-4">이번주 미션 현황</p>
          <div className="mt-[15px] flex items-center justify-between">
            {report.missionSummary.days.map((day) => (
              <div
                key={day.weekday}
                className="flex w-[34px] flex-col items-center gap-1"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full ${
                    day.completed
                      ? "bg-[#9572ff] text-white"
                      : "border border-[#d9d9d9] bg-white text-[#c4c4c4]"
                  }`}
                  aria-label={`${day.label}요일 완료 미션 ${day.completedCount}개`}
                >
                  {day.completed ? (
                    <Check className="size-[18px]" aria-hidden />
                  ) : null}
                </span>
                <span className="text-xs leading-[15px] text-[#7b7b7b]">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </ReportCard>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="누적 미션 수행시간"
            value={report.missionSummary.totalDurationLabel}
            type="duration"
          />
          <StatCard
            label="아이 반응 긍정률"
            value={`${report.missionSummary.childPositiveReactionRate}%`}
            type="percent"
          />
        </div>
      </div>
    </ReportSection>

    <KeywordSection report={report} />
    <BestMomentSection moments={report.bestMoments} />
    <InnerStateSection report={report} />
    <ReportCard>
      <div className="flex items-center gap-1">
        <Bot className="size-[18px] text-[#262626]" aria-hidden />
        <h2 className="text-base font-bold leading-6">
          {report.aiActionSuggestion.title}
        </h2>
      </div>
      <p className="mt-[15px] text-sm leading-5 text-[#7b7b7b]">
        {report.aiActionSuggestion.body}
      </p>
    </ReportCard>
  </div>
);

const ReportSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-lg font-bold leading-[25px]">{title}</h2>
    {children}
  </section>
);

const ReportCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_2px_rgba(0,0,0,0.05)]">
    {children}
  </div>
);

const StatCard = ({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type: "duration" | "percent";
}) => (
  <div className="flex min-h-22 flex-col items-center justify-center gap-3 rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_2px_rgba(0,0,0,0.05)]">
    <p className="whitespace-nowrap text-xs font-medium leading-[17px] text-[#7b7b7b]">
      {label}
    </p>
    {type === "duration" ? (
      <p className="flex items-baseline justify-center gap-1 text-[#262626]">
        {splitDurationLabel(value).map((segment) => (
          <span key={`${segment.value}-${segment.unit}`} className="contents">
            <span className="text-2xl font-bold leading-8">
              {segment.value}
            </span>
            <span className="text-sm font-medium leading-5">
              {segment.unit}
            </span>
          </span>
        ))}
      </p>
    ) : (
      <p className="flex items-center justify-center gap-1 text-[#262626]">
        <Sparkles className="size-[18px] fill-[#9572ff] text-[#9572ff]" />
        <span className="text-2xl font-bold leading-8">
          {value.replace("%", "")}
        </span>
        <span className="text-sm font-bold leading-5">%</span>
      </p>
    )}
  </div>
);

const KeywordSection = ({ report }: { report: WeeklyReportDetail }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-lg font-bold leading-[25px]">
      아이의 관심 키워드 Top 3
    </h2>
    {report.topKeywords.length > 0 ? (
      <div className="flex flex-wrap items-center gap-3">
        {report.topKeywords.map((keyword, index) => {
          const style = keywordStyles[index] ?? keywordStyles[0];
          return (
            <span
              key={`${keyword.rank}-${keyword.keyword}`}
              className={`inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold leading-[21px] ${style.className}`}
            >
              <style.icon className="size-3.5" aria-hidden />
              {keyword.keyword}
            </span>
          );
        })}
      </div>
    ) : report.keywordEmptyState ? (
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_2px_rgba(0,0,0,0.05)]">
        <p className="text-sm font-bold leading-5">
          {report.keywordEmptyState.title}
        </p>
        <p className="mt-2 text-sm leading-5 text-[#7b7b7b]">
          {report.keywordEmptyState.description}
        </p>
      </div>
    ) : null}
  </section>
);

const BestMomentSection = ({
  moments,
}: {
  moments: WeeklyReportDetail["bestMoments"];
}) => {
  const firstMoment = moments[0];

  if (!firstMoment) return null;

  return (
    <ReportSection title="아이의 ‘베스트 모먼트’">
      <div className="flex flex-col items-center gap-3">
        <ReportCard>
          {firstMoment.label ? (
            <p className="text-xs font-medium leading-[17px] text-[#555]">
              {firstMoment.label}
            </p>
          ) : null}
          <h2 className="mt-1 text-base font-bold leading-6">
            {firstMoment.title}
          </h2>
          <p className="mt-[15px] text-sm leading-5 text-[#7b7b7b]">
            {firstMoment.body}
          </p>
        </ReportCard>
        {moments.length > 1 ? (
          <div className="flex h-1.5 items-center gap-1">
            {moments.map((moment, index) => (
              <span
                key={moment.id}
                className={`h-1.5 rounded-full ${
                  index === 0 ? "w-6 bg-black" : "w-1.5 bg-[#d9d9d9]"
                }`}
              />
            ))}
          </div>
        ) : (
          <span className="h-1.5 w-6 rounded-full bg-black" />
        )}
      </div>
    </ReportSection>
  );
};

const InnerStateSection = ({ report }: { report: WeeklyReportDetail }) => (
  <ReportSection title="사용자의 내면 상태">
    <ReportCard>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium leading-[17px] text-[#555]">
          심리적 에너지
        </p>
        <p className="text-base font-bold leading-6">
          {report.innerState.psychologicalEnergy}%
        </p>
      </div>
      <div
        className="mt-[15px] h-5 overflow-hidden rounded-full bg-[rgba(0,0,0,0.03)]"
        role="progressbar"
        aria-valuenow={report.innerState.psychologicalEnergy}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-xs bg-[#9572ff]"
          style={{ width: `${report.innerState.psychologicalEnergy}%` }}
        />
      </div>
      <p className="mt-[15px] text-sm font-medium leading-[22px] text-[#7b7b7b]">
        {report.innerState.tipTitle}
      </p>
      {report.innerState.tipBody ? (
        <p className="mt-2 text-sm leading-5 text-[#7b7b7b]">
          {report.innerState.tipBody}
        </p>
      ) : null}
    </ReportCard>
  </ReportSection>
);

const WeeklyReportEmpty = ({
  emptyState,
  onStartMission,
}: {
  emptyState: WeeklyReportEmptyState | null;
  onStartMission: () => void;
}) => (
  <div className="flex min-h-[720px] flex-1 flex-col items-center justify-center gap-9 px-8 pb-20 text-center">
    <div className="size-[120px] rounded-full bg-[#f2f2f2]" aria-hidden />
    <div className="flex w-full flex-col items-center gap-7">
      <div className="space-y-3">
        <h2 className="text-lg font-bold leading-[25px]">
          {emptyState?.title ?? "아직 주간 리포트가 없습니다"}
        </h2>
        <p className="mx-auto max-w-[260px] whitespace-pre-line text-sm leading-5 text-[#7b7b7b]">
          {emptyState?.description ??
            "미션을 수행하고 아이와의 소중한 순간을 기록해보세요. 일주일 후 첫 리포트를 확인할 수 있습니다."}
        </p>
      </div>
      <button
        type="button"
        onClick={onStartMission}
        className="flex h-12 w-[263px] items-center justify-center rounded-2xl bg-[#9572ff] px-5 text-base font-medium leading-6 text-white"
      >
        {emptyState?.ctaLabel ?? "미션 시작하기"}
      </button>
    </div>
  </div>
);

const WeeklyReportError = ({
  error,
  onRetry,
}: {
  error: NonNullable<WeeklyReportLoadState["error"]>;
  onRetry: () => void;
}) => (
  <div className="flex min-h-[720px] flex-1 flex-col items-center justify-center gap-6 px-8 pb-20 text-center">
    <div className="size-24 rounded-full bg-[#fff1f2]" aria-hidden />
    <div>
      <h2 className="text-lg font-bold leading-[25px]">
        주간 리포트를 불러오지 못했습니다
      </h2>
      <p className="mt-3 text-sm leading-5 text-[#7b7b7b]">{error.message}</p>
    </div>
    <button
      type="button"
      onClick={onRetry}
      className="flex h-12 min-w-[160px] items-center justify-center gap-2 rounded-2xl bg-[#9572ff] px-5 text-base font-medium text-white"
    >
      <RefreshCw className="size-4" aria-hidden />
      다시 시도
    </button>
  </div>
);

const WeeklyReportSkeleton = () => (
  <div className="flex flex-1 flex-col gap-8 px-5 pb-12 pt-5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="space-y-3">
        <div className="h-6 w-40 animate-pulse rounded-full bg-[#eeeeee]" />
        <div className="h-32 animate-pulse rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_2px_rgba(0,0,0,0.05)]" />
      </div>
    ))}
  </div>
);
