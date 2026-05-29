"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { SectionInfoCard } from "@/components/ui/section-info-card";
import { StatCard, StatValue } from "@/components/ui/stat-card";
import {
  getStoredSelectedChildId,
  loadHomeDashboard,
  setStoredSelectedChildId,
  submitHomeMoodCheck,
  type HomeLoadState,
} from "@/lib/api";
import type {
  HomeChild,
  HomeDashboard as HomeDashboardData,
  HomeNotification,
} from "@/lib/home-data";

type Modal = "children" | "notifications" | "mood" | null;
type MoodLevel = 1 | 2 | 3 | 4 | 5;
const MOOD_OPTION_LABELS: Record<MoodLevel, string> = {
  1: "나빠요",
  2: "별로에요",
  3: "보통이에요",
  4: "좋아요!",
  5: "최고에요!",
};

const HOME_ICON_PATHS = {
  childSwitcherChevron: "/icons/figma/home/child-switcher-chevron.svg",
  growthStage: "/icons/figma/home/growth-stage.svg",
  headerNotification: "/icons/figma/home/header-notification.svg",
  headerSettings: "/icons/figma/home/header-settings.svg",
  missionIllustration: "/images/figma/home/mission-illustration.svg",
  moodBad: "/icons/figma/mission-feedback/bad.svg",
  moodGood: "/icons/figma/mission-feedback/good.svg",
  moodNeutral: "/icons/figma/mission-feedback/neutral.svg",
  moodPlus: "/icons/figma/home/mood-plus.svg",
  moodVeryBad: "/icons/figma/mission-feedback/very-bad.svg",
  moodVeryGood: "/icons/figma/mission-feedback/very-good.svg",
} as const;

export const HomeDashboard = () => {
  const router = useRouter();
  const [state, setState] = useState<HomeLoadState | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMoodLevel, setSelectedMoodLevel] = useState<MoodLevel | null>(
    null,
  );
  const [moodSubmitting, setMoodSubmitting] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);

  const refresh = useCallback(
    async (childId?: string | null, showLoading = true) => {
      if (showLoading) setLoading(true);
      const next = await loadHomeDashboard(childId);
      setState(next);
      setSelectedChildId(next.data.selectedChild.id);
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    let active = true;
    void loadHomeDashboard(getStoredSelectedChildId()).then((next) => {
      if (!active) return;
      setState(next);
      setSelectedChildId(next.data.selectedChild.id);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const data = state?.data;
  const selectedChild = useMemo(() => {
    if (!data) return null;
    return (
      data.children.find((child) => child.id === selectedChildId) ??
      data.selectedChild
    );
  }, [data, selectedChildId]);

  if (!data || !selectedChild) return <HomeSkeleton />;

  const onSelectChild = (child: HomeChild) => {
    setStoredSelectedChildId(child.id);
    setSelectedChildId(child.id);
    setModal(null);
    void refresh(child.id);
  };

  const openMoodModal = () => {
    setSelectedMoodLevel(null);
    setMoodError(null);
    setModal("mood");
  };

  const closeMoodModal = () => {
    if (moodSubmitting) return;
    setModal(null);
    setSelectedMoodLevel(null);
    setMoodError(null);
  };

  const submitMood = async () => {
    if (!selectedMoodLevel || moodSubmitting) {
      return;
    }

    setMoodSubmitting(true);
    setMoodError(null);

    try {
      await submitHomeMoodCheck(selectedMoodLevel);
      await refresh(selectedChildId, false);
      setModal(null);
      setSelectedMoodLevel(null);
    } catch {
      setMoodError(
        "오늘의 기분을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setMoodSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative min-h-dvh bg-gray-20 px-5 pb-9 pt-11.75 text-gray-800">
        <TopAppBar
          child={selectedChild}
          unreadCount={data.notifications.unreadCount}
          onOpenChildren={() => setModal("children")}
          onOpenNotifications={() => setModal("notifications")}
        />
        <div className="mt-4 flex flex-col gap-5">
          <WeeklyCalendar data={data} onOpenTodayMood={openMoodModal} />
          <TodayMissionCard
            mission={data.recommendedMission}
            loading={loading}
            onStart={() => router.push("/mission")}
          />
          <GrowthStageCard stage={data.growthStage} />
          <ReportSummaryCard summary={data.reportSummary} />
        </div>
      </div>
      {modal === "children" ? (
        <ChildSwitcherSheet
          childItems={data.children}
          selectedChildId={selectedChild.id}
          onClose={() => setModal(null)}
          onSelect={onSelectChild}
        />
      ) : null}
      {modal === "notifications" ? (
        <NotificationModal
          notifications={data.notifications.latest}
          unreadCount={data.notifications.unreadCount}
          onClose={() => setModal(null)}
        />
      ) : null}
      {modal === "mood" ? (
        <MoodCheckModal
          selectedLevel={selectedMoodLevel}
          submitting={moodSubmitting}
          errorMessage={moodError}
          onClose={closeMoodModal}
          onSelectLevel={setSelectedMoodLevel}
          onSubmit={() => void submitMood()}
        />
      ) : null}
    </>
  );
};

const TopAppBar = ({
  child,
  unreadCount,
  onOpenChildren,
  onOpenNotifications,
}: {
  child: HomeChild;
  unreadCount: number;
  onOpenChildren: () => void;
  onOpenNotifications: () => void;
}) => (
  <header className="flex h-14 items-center justify-between">
    <button
      type="button"
      onClick={onOpenChildren}
      className="flex items-center gap-1 text-sm font-medium leading-[1.4] text-gray-800"
      aria-label="아이 목록 열기"
      aria-haspopup="dialog"
    >
      <span className="max-w-45 truncate">
        {child.name} ({child.ageLabel})
      </span>
      <FigmaIcon
        src={HOME_ICON_PATHS.childSwitcherChevron}
        alt=""
        className="size-4"
      />
    </button>
    <div className="flex items-center">
      <a
        href="/settings"
        className="flex size-11 items-center justify-center"
        aria-label="설정"
      >
        <FigmaIcon
          src={HOME_ICON_PATHS.headerSettings}
          alt=""
          className="size-6"
        />
      </a>
      <button
        type="button"
        onClick={onOpenNotifications}
        className="relative flex size-11 items-center justify-center"
        aria-label="알림 열기"
      >
        <FigmaIcon
          src={HOME_ICON_PATHS.headerNotification}
          alt=""
          className="size-6"
        />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-error-600" />
        ) : null}
      </button>
    </div>
  </header>
);

const WeeklyCalendar = ({
  data,
  onOpenTodayMood,
}: {
  data: HomeDashboardData;
  onOpenTodayMood: () => void;
}) => (
  <section>
    <div className="flex items-center justify-between">
      <h1 className="font-suit text-[20px] font-extrabold leading-7 tracking-normal text-gray-800">
        {monthHeadingLabel(data.week)}
      </h1>
      <p className="font-suit text-sm font-medium leading-5 text-gray-700">
        {data.week.weekOfMonthLabel}
      </p>
    </div>
    <div className="mt-5 grid grid-cols-7 gap-1.5">
      {data.week.days.map((day) => (
        <div
          key={day.date}
          className={`flex flex-col items-center gap-1 rounded-2xl px-2 pb-3 pt-2 ${
            day.isToday ? "bg-primary-300 text-white" : ""
          }`}
        >
          <span
            className={`font-suit text-[9px] font-bold leading-none ${
              day.isToday ? "text-white" : "text-gray-300"
            }`}
          >
            {day.weekdayLabel}
          </span>
          <span
            className={`font-suit text-sm font-bold leading-none ${
              day.isToday ? "text-white" : "text-gray-800"
            }`}
          >
            {day.dayOfMonth}
          </span>
        </div>
      ))}
    </div>
    <div className="mt-2.5 grid grid-cols-7 gap-2">
      {data.week.days.map((day) => (
        <div key={`${day.date}-mood`} className="flex justify-center">
          <MoodBadge day={day} onOpenTodayMood={onOpenTodayMood} />
        </div>
      ))}
    </div>
  </section>
);

const MoodBadge = ({
  day,
  onOpenTodayMood,
}: {
  day: HomeDashboardData["week"]["days"][number];
  onOpenTodayMood: () => void;
}) => {
  if (day.mood?.level) {
    return (
      <FigmaIcon
        src={moodIconPath(day.mood.level)}
        alt="today's mood"
        className="size-8 shrink-0"
      />
    );
  }

  if (day.isToday) {
    return (
      <button
        type="button"
        onClick={onOpenTodayMood}
        className="flex size-8 items-center justify-center rounded-full bg-gray-800 leading-none text-white"
        aria-label="오늘의 기분 기록하기"
      >
        <FigmaIcon
          src={HOME_ICON_PATHS.moodPlus}
          alt="today's mood selection"
        />
      </button>
    );
  }

  return <div className="size-8 rounded-full bg-gray-100" aria-hidden />;
};

const TodayMissionCard = ({
  mission,
  loading,
  onStart,
}: {
  mission: HomeDashboardData["recommendedMission"];
  loading: boolean;
  onStart: () => void;
}) => {
  const isCompleted = mission?.status === "completed";
  const buttonLabel = isCompleted ? "오늘의 놀이 완료" : "오늘의 놀이 시작하기";

  return (
    <Card
      radius="xxl"
      shadow="none"
      className="shadow-[0_4px_11.5px_rgba(0,0,0,0.05)]"
    >
      <Chip>아이와 {mission?.durationMinutes ?? 10}분 가까워지기</Chip>
      <div className="mt-3.25 flex items-center justify-between gap-4">
        <h2 className="text-[20px] font-bold leading-[1.4] tracking-normal text-gray-800">
          {splitMissionTitle(
            mission?.title ?? "아이와 눈을 마주치며 이야기를 해보아요",
          ).map((line) => (
            <span key={line} className="block whitespace-pre-wrap">
              {line}
            </span>
          ))}
        </h2>
        <img
          src={HOME_ICON_PATHS.missionIllustration}
          alt=""
          className="h-15 w-21 shrink-0"
          aria-hidden
        />
      </div>
      <button
        type="button"
        onClick={onStart}
        disabled={!mission || loading || isCompleted}
        className="mt-3.25 flex h-12 w-full items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-6 text-white disabled:bg-gray-100 disabled:text-gray-600"
      >
        {buttonLabel}
      </button>
    </Card>
  );
};

const GrowthStageCard = ({
  stage,
}: {
  stage: HomeDashboardData["growthStage"];
}) => (
  <SectionInfoCard
    icon={
      <FigmaIcon
        src={HOME_ICON_PATHS.growthStage}
        alt=""
        className="size-5 shrink-0"
      />
    }
    label={`현재 상황 [ ${stage?.name ?? "확인 중"} ]`}
    body={
      stage?.summary ??
      '아이의 독립심이 싹트고 있어요. "내가 할래!"라는 말은 성장의 건강한 신호입니다.'
    }
  />
);

const ReportSummaryCard = ({
  summary,
}: {
  summary: HomeDashboardData["reportSummary"];
}) => (
  <section className="grid grid-cols-2 gap-2">
    <StatCard label="지난주 놀이 수행시간">
      {summary ? (
        <DurationValue label={summary.totalDurationLabel} />
      ) : (
        <NoRecord />
      )}
    </StatCard>
    <StatCard
      label="아이 반응 긍정률"
      icon={
        summary ? (
          <FigmaIcon
            src="/icons/figma/shared/positive-rate.svg"
            alt=""
            className="size-4.5 self-center"
          />
        ) : undefined
      }
    >
      {summary ? (
        <StatValue value={summary.childPositiveReactionRate} unit="%" />
      ) : (
        <NoRecord />
      )}
    </StatCard>
  </section>
);

const NoRecord = () => (
  <span className="text-sm font-medium leading-5 text-gray-400">기록 없음</span>
);

// "1시간 17분" → StatValue 조합 (숫자는 SUIT)
const DurationValue = ({ label }: { label: string }) => {
  const parts = label.match(/^(?:(\d+)시간)?(?:\s*)?(?:(\d+)분)?$/);

  if (!parts) {
    return <StatValue value={label} />;
  }

  const [, hours, minutes] = parts;
  return (
    <>
      {hours ? <StatValue value={hours} unit="시간" /> : null}
      {minutes ? <StatValue value={minutes} unit="분" /> : null}
    </>
  );
};

const ChildSwitcherSheet = ({
  childItems,
  selectedChildId,
  onClose,
  onSelect,
}: {
  childItems: HomeChild[];
  selectedChildId: string;
  onClose: () => void;
  onSelect: (child: HomeChild) => void;
}) => (
  <div
    className="fixed inset-0 z-40"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div className="relative mx-auto h-full w-full max-w-107.5">
      <div
        className="absolute left-5 top-27 w-65 overflow-hidden rounded-[32px] border border-[#ebecf0] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
        onClick={(event) => event.stopPropagation()}
      >
        {childItems.map((child) => {
          const selected = child.id === selectedChildId;

          return (
            <div
              key={child.id}
              className={`flex items-center justify-between px-6 py-5 ${
                selected ? "bg-primary-50" : "bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(child)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-sm font-bold leading-[1.4] text-[#1f2127]">
                  {child.name}
                </span>
                <span className="block truncate text-xs font-normal leading-[1.4] text-[#6f7885]">
                  {child.ageLabel} ({new Date(child.birthDate).getFullYear()}
                  년생)
                </span>
              </button>
              <div className="ml-4 flex shrink-0 items-center gap-2 text-gray-800">
                <button
                  type="button"
                  className="flex size-5 items-center justify-center"
                  aria-label={`${child.name} 수정`}
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="flex size-5 items-center justify-center"
                  aria-label={`${child.name} 삭제`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const NotificationModal = ({
  notifications,
  unreadCount,
  onClose,
}: {
  notifications: HomeNotification[];
  unreadCount: number;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-40 bg-[rgba(38,38,38,0.24)]"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div className="relative mx-auto h-full w-full max-w-107.5">
      <div
        className="absolute inset-x-5 top-26 rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold leading-6 text-gray-800">알림</h2>
            <p className="mt-1 text-sm font-medium leading-5 text-gray-500">
              읽지 않은 알림 {unreadCount}개
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium leading-5 text-primary-300"
          >
            닫기
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className="w-full rounded-xl bg-gray-50 p-4 text-left"
              >
                <p className="text-sm font-bold leading-5 text-gray-800">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm leading-5 text-gray-600">
                  {notification.body}
                </p>
              </button>
            ))
          ) : (
            <p className="rounded-xl bg-gray-50 p-5 text-center text-sm font-medium leading-5 text-gray-500">
              아직 새 알림이 없어요
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const MoodCheckModal = ({
  selectedLevel,
  submitting,
  errorMessage,
  onClose,
  onSelectLevel,
  onSubmit,
}: {
  selectedLevel: MoodLevel | null;
  submitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSelectLevel: (level: MoodLevel) => void;
  onSubmit: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.2)]"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div className="relative mx-auto flex min-h-dvh w-full max-w-107.5 items-center justify-center px-5">
      <div
        className="w-full max-w-83.5 rounded-xl bg-white px-5 pb-5 pt-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="whitespace-pre-line text-center text-[24px] font-bold leading-[1.35] tracking-[-0.02em] text-gray-800">
          {"지금 마음의 배터리가 \n얼마나 남아있나요?"}
        </h2>
        <p className="mt-2 text-center text-sm font-medium leading-5 text-[#8e8e93]">
          기록을 꾸준히 하면 리포트 작성에 도움이 돼요.
        </p>
        <div className="mt-6 flex items-start justify-between gap-2">
          {(Object.keys(MOOD_OPTION_LABELS) as Array<`${MoodLevel}`>).map(
            (levelKey) => {
              const level = Number(levelKey) as MoodLevel;
              const selected = selectedLevel === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onSelectLevel(level)}
                  className="flex w-13 flex-col items-center gap-1.25"
                  aria-pressed={selected}
                >
                  <img
                    src={moodIconPath(level)}
                    alt=""
                    className={`size-10 transition ${
                      selected ? "" : "grayscale opacity-45"
                    }`}
                    aria-hidden
                  />
                  <span
                    className={`text-center text-[11px] font-medium leading-[1.35] ${
                      selected ? "text-gray-800" : "text-[#8e8e93]"
                    }`}
                  >
                    {MOOD_OPTION_LABELS[level]}
                  </span>
                </button>
              );
            },
          )}
        </div>
        {errorMessage ? (
          <p className="mt-4 text-center text-xs font-medium leading-4 text-error-600">
            {errorMessage}
          </p>
        ) : (
          <div className="mt-4 h-4" aria-hidden />
        )}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#f2f3f5] text-base font-medium leading-6 text-gray-700 disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!selectedLevel || submitting}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary-300 text-base font-medium leading-6 text-white disabled:bg-[#ddd7ff] disabled:text-white"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  </div>
);

const FigmaIcon = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => (
  <img src={src} alt={alt} className={className} aria-hidden={alt === ""} />
);

const HomeSkeleton = () => (
  <div className="flex min-h-dvh items-center justify-center bg-gray-20">
    <MoreHorizontal
      className="size-8 animate-pulse text-primary-300"
      aria-label="홈 불러오는 중"
    />
  </div>
);

function splitMissionTitle(title: string): string[] {
  if (title.includes("\n")) {
    return title.split("\n");
  }

  const parts = title.split(" ");
  if (parts.length <= 3) {
    return [title];
  }

  const pivot = Math.ceil(parts.length / 2);
  return [parts.slice(0, pivot).join(" "), parts.slice(pivot).join(" ")];
}

function monthHeadingLabel(week: HomeDashboardData["week"]): string {
  const baseDate = week.days[0]?.date;
  if (!baseDate) {
    return week.monthLabel;
  }

  const [year] = baseDate.split("-");
  return `${year}년 ${week.monthLabel}`;
}

function moodIconPath(level: 1 | 2 | 3 | 4 | 5): string {
  switch (level) {
    case 1:
      return HOME_ICON_PATHS.moodVeryBad;
    case 2:
      return HOME_ICON_PATHS.moodBad;
    case 3:
      return HOME_ICON_PATHS.moodNeutral;
    case 4:
      return HOME_ICON_PATHS.moodGood;
    case 5:
      return HOME_ICON_PATHS.moodVeryGood;
  }
}
