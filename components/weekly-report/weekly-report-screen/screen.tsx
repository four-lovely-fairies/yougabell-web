"use client";

import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { AppHeader, HeaderSpacer } from "@/components/app/app-header";
import { useMainShellReport } from "@/components/app/main-shell-report-context";
import { track } from "@/lib/analytics";
import { useScreenPerformance } from "@/hooks/use-screen-performance";
import {
  getStoredSelectedChildId,
  loadWeeklyReport,
  loadWeeklyReportList,
  markWeeklyReportViewed,
  type WeeklyReportListItem,
  type WeeklyReportLoadState,
} from "@/lib/api";
import {
  type WeeklyReportDetail,
  type WeeklyReportViewData,
} from "@/lib/weekly-report-data";
import {
  BestMomentSection,
  DurationStat,
  InnerStateSection,
  KeywordSection,
  PercentStat,
  ReportCard,
  ReportSection,
} from "./sections";
import {
  WeeklyReportEmpty,
  WeeklyReportError,
  WeeklyReportSkeleton,
} from "./states";

export const WeeklyReportScreen = () => {
  const router = useRouter();
  const [state, setState] = useState<WeeklyReportLoadState | null>(null);
  const [loading, setLoading] = useState(true);
  // 지난 리포트 목록(최신순) — 상단 "N월 N일 발행 ⌄"에서 고른다
  const [reports, setReports] = useState<WeeklyReportListItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { setHasUnviewedWeeklyReport } = useMainShellReport();
  useScreenPerformance(
    "/weekly-report",
    loading
      ? "pending"
      : state?.error
        ? "error"
        : state?.data
          ? "api"
          : "pending",
  );

  const requestReport = useCallback(async (): Promise<{
    next: WeeklyReportLoadState;
    items: WeeklyReportListItem[];
  }> => {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get("reportId");
    const childId = getStoredSelectedChildId();
    const [current, items] = await Promise.all([
      loadWeeklyReport({ childId, reportId }),
      loadWeeklyReportList(childId),
    ]);
    return { next: current, items };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const { next, items } = await requestReport();
    setReports(items);
    setState(next);
    setLoading(false);
    if (next.data?.report) {
      void markWeeklyReportViewed(next.data.report.id)
        .then(() => setHasUnviewedWeeklyReport(false))
        .catch(() => undefined);
    }
  }, [requestReport, setHasUnviewedWeeklyReport]);

  // 드롭다운에서 고른 리포트로 바꾼다. 주소(reportId)도 바꿔서 새로고침해도 같은 리포트가 보이게.
  const selectReport = useCallback(
    async (reportId: string) => {
      setPickerOpen(false);
      const url = new URL(window.location.href);
      url.searchParams.set("reportId", reportId);
      window.history.replaceState(window.history.state, "", url);
      setLoading(true);
      const next = await loadWeeklyReport({ reportId });
      setState(next);
      setLoading(false);
      if (next.data?.report) {
        void markWeeklyReportViewed(next.data.report.id).catch(() => undefined);
        setReports((items) =>
          items.map((item) =>
            item.id === reportId ? { ...item, viewed: true } : item,
          ),
        );
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    void requestReport().then(({ next, items }) => {
      if (!active) return;
      setReports(items);
      setState(next);
      setLoading(false);
      if (next.data?.report) {
        void markWeeklyReportViewed(next.data.report.id)
          .then(() => setHasUnviewedWeeklyReport(false))
          .catch(() => undefined);
      }
      track({
        type: "weekly_report_view",
        hasReport: Boolean(next.data?.report),
      });
    });
    return () => {
      active = false;
    };
  }, [requestReport, setHasUnviewedWeeklyReport]);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  const startMission = () => {
    track({ type: "weekly_report_mission_start" });
    router.push("/mission");
  };

  return (
    // 바탕은 연회색 — 흰 카드가 또렷하게 구분되도록 (Figma 05 주간 리포트)
    <div className="fixed inset-0 z-40 mx-auto flex h-dvh w-full max-w-107.5 flex-col bg-[#F4F4F6] text-gray-800">
      <AppHeader
        fixed
        title="주간 리포트"
        onBack={goBack}
        className="bg-[#F4F4F6]"
      />
      <HeaderSpacer />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        {loading ? (
          <WeeklyReportSkeleton />
        ) : state?.error ? (
          <WeeklyReportError error={state.error} onRetry={load} />
        ) : state?.data ? (
          <WeeklyReportContent
            data={state.data}
            reports={reports}
            onOpenPicker={() => {
              track({ type: "weekly_report_picker_open", reportCount: reports.length });
              setPickerOpen(true);
            }}
            onStartMission={startMission}
          />
        ) : null}
      </div>
      {pickerOpen ? (
        <ReportPickerSheet
          reports={reports}
          currentId={state?.data?.report?.id ?? null}
          onClose={() => setPickerOpen(false)}
          onSelect={(item, index) => {
            track({ type: "weekly_report_select", isLatest: index === 0, position: index });
            void selectReport(item.id);
          }}
        />
      ) : null}
    </div>
  );
};

// ── 발행일 ──
// 리포트는 월요일 아침에 만들어진다. 생성 시각을 한국 날짜로 보여준다.
const seoulParts = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
};
const dateKeyParts = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
};
const issuedLabel = (iso: string) => {
  const { month, day } = seoulParts(iso);
  return `${month}월 ${day}일 발행`;
};
// 저장된 weekStart가 시간대 때문에 하루 앞(일요일)으로 오는 리포트가 있어, 끝(일요일)에서 6일 전을 시작으로 쓴다.
const rangeLabel = (weekEnd: string) => {
  const e = dateKeyParts(weekEnd);
  const startDate = new Date(Date.UTC(e.year, e.month - 1, e.day - 6));
  const s = { month: startDate.getUTCMonth() + 1, day: startDate.getUTCDate() };
  return `${s.month}월 ${s.day}일 – ${e.month}월 ${e.day}일 놀이 기록`;
};

const ReportIssueHeader = ({
  report,
  canPick,
  onOpenPicker,
}: {
  report: WeeklyReportDetail;
  canPick: boolean;
  onOpenPicker: () => void;
}) => (
  <div className="flex flex-col gap-1">
    {canPick ? (
      // 글자를 눌러도 열린다 — 화살표만으로는 지난 리포트를 고를 수 있다는 걸 놓치기 쉽다
      <button
        type="button"
        onClick={onOpenPicker}
        aria-haspopup="dialog"
        className="flex items-center gap-2 self-start text-left"
      >
        <span className="text-xl font-bold leading-[1.4] text-gray-800">
          {issuedLabel(report.generatedAt)}
        </span>
        <span className="flex size-7 items-center justify-center rounded-full bg-[#EDEDF0] text-gray-700">
          <ChevronDown className="size-4" strokeWidth={2.4} aria-hidden />
        </span>
      </button>
    ) : (
      <p className="text-xl font-bold leading-[1.4] text-gray-800">
        {issuedLabel(report.generatedAt)}
      </p>
    )}
    <p className="text-sm leading-[1.4] text-gray-600">
      {rangeLabel(report.weekEnd)}
    </p>
  </div>
);

// ── 리포트 선택 시트 (Figma 06) — 왼쪽 연도, 오른쪽 발행일 목록 ──
const ReportPickerSheet = ({
  reports,
  currentId,
  onClose,
  onSelect,
}: {
  reports: WeeklyReportListItem[];
  currentId: string | null;
  onClose: () => void;
  onSelect: (item: WeeklyReportListItem, index: number) => void;
}) => (
  <BottomSheet title="리포트 선택" onClose={onClose} labelledById="report-picker-title">
    <ul className="max-h-90 overflow-y-auto overscroll-contain px-6 pb-2">
      {reports.map((item, index) => {
        const { year } = seoulParts(item.generatedAt);
        const prevYear = index > 0 ? seoulParts(reports[index - 1].generatedAt).year : null;
        const selected = item.id === currentId;
        return (
          <li key={item.id} className="flex">
            <span className="w-14 shrink-0 pt-3.5 text-base font-bold leading-[1.4] text-gray-800">
              {year !== prevYear ? year : ""}
            </span>
            <button
              type="button"
              onClick={() => onSelect(item, index)}
              aria-current={selected ? "true" : undefined}
              className={`flex min-w-0 flex-1 items-center justify-between py-3.5 text-left active:bg-gray-50 ${
                index < reports.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`text-base leading-[1.4] text-gray-800 ${selected ? "font-bold" : "font-normal"}`}
                >
                  {issuedLabel(item.generatedAt)}
                </span>
                {index === 0 ? (
                  <span className="text-sm font-medium text-primary-300">최신</span>
                ) : !item.viewed ? (
                  <span aria-label="안 읽음" className="size-1.5 rounded-full bg-error-600" />
                ) : null}
              </span>
              {selected ? <Check className="size-5 text-gray-800" aria-hidden /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  </BottomSheet>
);

// ── 이번 주 리포트 발행 전 (Figma 07) ──
// 리포트는 한 주(월~일) 기록으로 다음 월요일 아침에 나온다.
// - 월요일 아침 생성 중(report_generation_pending): 지난주 기록 → 오늘 발행
// - 그 외(지난주 놀이 없음 등): 이번 주 기록 → 다음 월요일 발행
const DAY_MS = 24 * 60 * 60 * 1000;
const pendingSchedule = (generating: boolean) => {
  const seoulNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const today = Date.UTC(seoulNow.getUTCFullYear(), seoulNow.getUTCMonth(), seoulNow.getUTCDate());
  const thisMonday = today - ((seoulNow.getUTCDay() + 6) % 7) * DAY_MS;
  const start = generating ? thisMonday - 7 * DAY_MS : thisMonday;
  const md = (ms: number) => {
    const d = new Date(ms);
    return { month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  };
  return { start: md(start), end: md(start + 6 * DAY_MS), issue: md(start + 7 * DAY_MS) };
};

const WeeklyReportPendingView = ({
  reason,
  onOpenPicker,
  onStartMission,
}: {
  reason: string | null;
  onOpenPicker: () => void;
  onStartMission: () => void;
}) => {
  const generating = reason === "report_generation_pending";
  const { start, end, issue } = pendingSchedule(generating);
  return (
    <div className="flex flex-1 flex-col px-5 pb-12 pt-5">
      <div className="flex flex-col gap-1">
        {/* 지난 리포트는 여기서 고른다 */}
        <button
          type="button"
          onClick={onOpenPicker}
          aria-haspopup="dialog"
          className="flex items-center gap-2 self-start text-left"
        >
          <span className="text-xl font-bold leading-[1.4] text-gray-800">
            {issue.month}월 {issue.day}일 발행 예정
          </span>
          <span className="flex size-7 items-center justify-center rounded-full bg-[#EDEDF0] text-gray-700">
            <ChevronDown className="size-4" strokeWidth={2.4} aria-hidden />
          </span>
        </button>
        <p className="text-sm leading-[1.4] text-gray-600">
          {start.month}월 {start.day}일 – {end.month}월 {end.day}일 놀이 기록
        </p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 pb-10 pt-16 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/figma/report/report-pending.svg" alt="" className="size-18" aria-hidden />
        <h2 className="mt-2 text-base font-bold leading-[1.4] text-gray-800">
          이번 주 리포트는 아직 발행 전이에요
        </h2>
        <p className="whitespace-pre-line break-keep text-sm leading-[1.6] text-gray-600">
          {generating
            ? "지난주 놀이 기록으로 리포트를 만들고 있어요.\n오늘 아침 중에 도착해요"
            : `이번 주에 놀이를 기록하면\n${issue.month}월 ${issue.day}일 월요일 아침에 리포트가 도착해요`}
        </p>
        <button
          type="button"
          onClick={onStartMission}
          className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-primary-300 px-6 text-base font-medium leading-6 text-white active:scale-[0.98]"
        >
          오늘의 놀이 하러 가기
        </button>
      </div>
    </div>
  );
};

const WeeklyReportContent = ({
  data,
  reports,
  onOpenPicker,
  onStartMission,
}: {
  data: WeeklyReportViewData;
  reports: WeeklyReportListItem[];
  onOpenPicker: () => void;
  onStartMission: () => void;
}) => {
  if (!data.report && reports.length > 0) {
    return (
      <WeeklyReportPendingView
        reason={data.emptyState?.reason ?? null}
        onOpenPicker={onOpenPicker}
        onStartMission={onStartMission}
      />
    );
  }

  if (!data.report) {
    return (
      <WeeklyReportEmpty
        emptyState={data.emptyState}
        onStartMission={onStartMission}
      />
    );
  }

  return (
    <WeeklyReportDetailView
      report={data.report}
      canPick={reports.length > 1}
      onOpenPicker={onOpenPicker}
    />
  );
};

const WeeklyReportDetailView = ({
  report,
  canPick,
  onOpenPicker,
}: {
  report: WeeklyReportDetail;
  canPick: boolean;
  onOpenPicker: () => void;
}) => (
  <div className="flex flex-1 flex-col gap-8 px-5 pb-12 pt-5">
    <ReportIssueHeader report={report} canPick={canPick} onOpenPicker={onOpenPicker} />
    <ReportSection title={report.headline.question}>
      <ReportCard>
        <h2 className="text-base font-bold leading-[22px]">
          {report.headline.title}
        </h2>
        {report.headline.body ? (
          <p className="mt-3.75 text-sm leading-[1.6] text-gray-600">
            {report.headline.body}
          </p>
        ) : null}
      </ReportCard>
    </ReportSection>

    <ReportSection title="이번주 요약">
      <div className="flex flex-col gap-2">
        <ReportCard>
          <p className="text-sm font-bold leading-[1.4]">이번주 미션 현황</p>
          <div className="mt-3.75 flex items-center justify-between">
            {report.missionSummary.days.map((day) => (
              <div
                key={day.weekday}
                className="flex w-8.5 flex-col items-center gap-1"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full ${
                    day.completed
                      ? "bg-primary-300 text-white"
                      : "border border-gray-200 bg-white text-gray-300"
                  }`}
                  aria-label={`${day.label}요일 완료 미션 ${day.completedCount}개`}
                >
                  {day.completed ? (
                    <Check className="size-4.5" aria-hidden />
                  ) : null}
                </span>
                <span className="text-xs leading-[15px] text-gray-500">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </ReportCard>
        <div className="grid grid-cols-2 gap-2">
          <DurationStat
            label="누적 미션 수행시간"
            value={report.missionSummary.totalDurationLabel}
          />
          <PercentStat
            label="아이 반응 긍정률"
            value={report.missionSummary.childPositiveReactionRate}
          />
        </div>
      </div>
    </ReportSection>

    <KeywordSection report={report} />
    <BestMomentSection moments={report.bestMoments} />
    {/* 내면 상태와 AI 제안은 이어지는 내용이라 섹션 간격(32)보다 가깝게 붙인다 */}
    <div className="flex flex-col gap-3">
    <InnerStateSection report={report} />
    <ReportCard>
      <div className="flex items-center gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/figma/report/ai-suggestion.svg"
          alt=""
          className="size-4.5"
          aria-hidden
        />
        <h2 className="text-base font-bold leading-6">
          {report.aiActionSuggestion.title}
        </h2>
      </div>
      <p className="mt-3.75 text-sm leading-[1.6] text-gray-600">
        {report.aiActionSuggestion.body}
      </p>
    </ReportCard>
    </div>
  </div>
);
