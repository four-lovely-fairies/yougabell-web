"use client";

import { Baby, MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getStoredSelectedChildId,
  loadHomeDashboard,
  setStoredSelectedChildId,
  type HomeLoadState,
} from "@/lib/api";
import type {
  HomeChild,
  HomeDashboard as HomeDashboardData,
  HomeNotification,
} from "@/lib/home-data";

type Modal = "children" | "notifications" | null;

const HOME_ICON_PATHS = {
  childSwitcherChevron: "/icons/figma/home/child-switcher-chevron.svg",
  growthStage: "/icons/figma/home/growth-stage.svg",
  headerNotification: "/icons/figma/home/header-notification.svg",
  headerSettings: "/icons/figma/home/header-settings.svg",
  missionIllustration: "/images/figma/home/mission-illustration.svg",
} as const;

const MOOD_STYLES = [
  "bg-[#b7e0ff]",
  "bg-[#ffa0b7]",
  "bg-[#ffe0a3]",
  "bg-[#d9f1b5]",
  "bg-[#dcd6ff]",
] as const;

export const HomeDashboard = () => {
  const [state, setState] = useState<HomeLoadState | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <div className="relative min-h-dvh bg-[#fdfdfe] px-5 pb-9 pt-[47px] text-[#262626]">
        <TopAppBar
          child={selectedChild}
          unreadCount={data.notifications.unreadCount}
          onOpenChildren={() => setModal("children")}
          onOpenNotifications={() => setModal("notifications")}
        />
        <div className="mt-4 flex flex-col gap-5">
          <WeeklyCalendar data={data} />
          <TodayMissionCard
            mission={data.recommendedMission}
            loading={loading}
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
      className="flex items-center gap-1 text-sm font-medium leading-[1.4] text-[#262626]"
      aria-label="아이 목록 열기"
      aria-haspopup="dialog"
    >
      <span className="max-w-[180px] truncate">
        {child.name} ({child.ageLabel})
      </span>
      <FigmaIcon
        src={HOME_ICON_PATHS.childSwitcherChevron}
        alt=""
        className="size-4"
      />
    </button>
    <div className="flex items-center">
      <button
        type="button"
        className="flex size-11 items-center justify-center"
        aria-label="설정"
      >
        <FigmaIcon
          src={HOME_ICON_PATHS.headerSettings}
          alt=""
          className="size-6"
        />
      </button>
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
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#ec003f]" />
        ) : null}
      </button>
    </div>
  </header>
);

const WeeklyCalendar = ({ data }: { data: HomeDashboardData }) => (
  <section>
    <div className="flex items-center justify-between">
      <h1 className="text-[20px] font-extrabold leading-7 tracking-normal text-[#262626]">
        {monthHeadingLabel(data.week)}
      </h1>
      <p className="text-sm font-medium leading-5 text-[#434343]">
        {data.week.weekOfMonthLabel}
      </p>
    </div>
    <div className="mt-5 grid grid-cols-7 gap-[6px]">
      {data.week.days.map((day) => (
        <div
          key={day.date}
          className={`flex flex-col items-center gap-1 rounded-2xl px-2 pb-3 pt-2 ${
            day.isToday ? "bg-[#9572ff] text-white" : ""
          }`}
        >
          <span
            className={`text-[9px] font-bold leading-none ${
              day.isToday ? "text-white" : "text-[#c4c4c4]"
            }`}
          >
            {day.weekdayLabel}
          </span>
          <span
            className={`text-sm font-bold leading-none ${
              day.isToday ? "text-white" : "text-[#262626]"
            }`}
          >
            {day.dayOfMonth}
          </span>
        </div>
      ))}
    </div>
    <div className="mt-[10px] grid grid-cols-7 gap-[8px]">
      {data.week.days.map((day, index) => (
        <div key={`${day.date}-mood`} className="flex justify-center">
          <MoodBadge day={day} index={index} />
        </div>
      ))}
    </div>
  </section>
);

const MoodBadge = ({
  day,
  index,
}: {
  day: HomeDashboardData["week"]["days"][number];
  index: number;
}) => {
  if (day.mood?.emoji) {
    return (
      <div
        className={`flex size-8 items-center justify-center rounded-full text-[17px] ${MOOD_STYLES[index % MOOD_STYLES.length]}`}
      >
        {day.mood.emoji}
      </div>
    );
  }

  if (day.isToday) {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-[#262626] text-[24px] leading-none text-white">
        +
      </div>
    );
  }

  return <div className="size-8 rounded-full bg-[#e9e9e9]" aria-hidden />;
};

const TodayMissionCard = ({
  mission,
  loading,
}: {
  mission: HomeDashboardData["recommendedMission"];
  loading: boolean;
}) => (
  <section className="rounded-[24px] bg-white p-6 shadow-[0_4px_11.5px_rgba(0,0,0,0.05)]">
    <span className="inline-flex rounded-full bg-[#f6f6f6] px-[10px] py-[5px] text-xs font-medium leading-[1.4] text-[#262626]">
      {mission?.subThemeLabel ?? "아이 10분 가까워지기"}
    </span>
    <div className="mt-[13px] flex items-center justify-between gap-4">
      <h2 className="text-[20px] font-bold leading-[1.4] tracking-normal text-[#262626]">
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
        className="h-[60px] w-[84px] shrink-0"
        aria-hidden
      />
    </div>
    <button
      type="button"
      disabled={!mission || loading}
      className="mt-[13px] flex h-12 w-full items-center justify-center rounded-2xl bg-[#9572ff] text-base font-medium leading-6 text-white disabled:bg-[#cfc3ff]"
    >
      미션 시작하기
    </button>
  </section>
);

const GrowthStageCard = ({
  stage,
}: {
  stage: HomeDashboardData["growthStage"];
}) => (
  <section className="rounded-[33px] bg-white p-6 shadow-[0_4px_10px_rgba(0,0,0,0.04)]">
    <div className="flex items-center gap-1">
      <FigmaIcon
        src={HOME_ICON_PATHS.growthStage}
        alt=""
        className="size-5 shrink-0"
      />
      <h2 className="text-xs font-bold leading-[1.4] text-[#262626]">
        현재 상황 [ {stage?.name ?? "확인 중"} ]
      </h2>
    </div>
    <p className="mt-3 text-sm font-medium leading-[1.8] text-[#555]">
      {stage?.summary ??
        '아이의 독립심이 싹트고 있어요. "내가 할래!"라는 말은 성장의 건강한 신호입니다.'}
    </p>
  </section>
);

const ReportSummaryCard = ({
  summary,
}: {
  summary: HomeDashboardData["reportSummary"];
}) => (
  <section className="grid grid-cols-2 gap-2">
    <SummaryMetricCard label="지난주 놀이 수행시간">
      {summary ? (
        <DurationValue label={summary.totalDurationLabel} />
      ) : (
        <span className="text-[14px] font-medium leading-5 text-[#9d9d9d]">
          기록 없음
        </span>
      )}
    </SummaryMetricCard>
    <SummaryMetricCard label="아이 반응 긍정률">
      {summary ? (
        <div className="flex items-center justify-center gap-1 text-[#262626]">
          <span className="text-[18px] text-[#9572ff]">◔</span>
          <span className="text-[24px] font-extrabold leading-8">
            {summary.childPositiveReactionRate}
          </span>
          <span className="text-[14px] font-medium leading-5">%</span>
        </div>
      ) : (
        <span className="text-[14px] font-medium leading-5 text-[#9d9d9d]">
          기록 없음
        </span>
      )}
    </SummaryMetricCard>
  </section>
);

const SummaryMetricCard = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[24px] bg-white px-4 py-3 shadow-[0_4px_10px_rgba(0,0,0,0.04)]">
    <p className="text-center text-xs font-medium leading-[1.4] text-[#7b7b7b]">
      {label}
    </p>
    <div className="mt-2">{children}</div>
  </div>
);

const DurationValue = ({ label }: { label: string }) => {
  const parts = label.match(/^(?:(\d+)시간)?(?:\s*)?(?:(\d+)분)?$/);

  if (!parts) {
    return (
      <span className="text-[22px] font-extrabold leading-8">{label}</span>
    );
  }

  const [, hours, minutes] = parts;
  return (
    <div className="flex items-baseline justify-center gap-1 text-[#262626]">
      {hours ? (
        <>
          <span className="text-[22px] font-extrabold leading-8">{hours}</span>
          <span className="text-[14px] font-medium leading-5">시간</span>
        </>
      ) : null}
      {minutes ? (
        <>
          <span className="text-[22px] font-extrabold leading-8">
            {hours ? ` ${minutes}` : minutes}
          </span>
          <span className="text-[14px] font-medium leading-5">분</span>
        </>
      ) : null}
    </div>
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
    className="fixed inset-0 z-40 bg-[rgba(38,38,38,0.24)]"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div className="absolute inset-x-5 top-[104px] rounded-[28px] bg-white p-3 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
      {childItems.map((child) => {
        const selected = child.id === selectedChildId;

        return (
          <button
            key={child.id}
            type="button"
            onClick={() => onSelect(child)}
            className={`flex w-full items-center gap-4 rounded-[20px] px-4 py-3 text-left ${
              selected ? "bg-[#f6f6f6]" : ""
            }`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f3eeff] text-[#9572ff]">
              <Baby className="size-6" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-5 text-[#262626]">
                {child.name}
              </span>
              <span className="block truncate text-xs font-medium leading-[1.4] text-[#7b7b7b]">
                {child.ageLabel} ({new Date(child.birthDate).getFullYear()}년생)
              </span>
            </span>
          </button>
        );
      })}
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
    <div
      className="absolute inset-x-5 top-[104px] rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold leading-6 text-[#262626]">알림</h2>
          <p className="mt-1 text-sm font-medium leading-5 text-[#7b7b7b]">
            읽지 않은 알림 {unreadCount}개
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium leading-5 text-[#9572ff]"
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
              className="w-full rounded-[20px] bg-[#f6f6f6] p-4 text-left"
            >
              <p className="text-sm font-bold leading-5 text-[#262626]">
                {notification.title}
              </p>
              <p className="mt-1 text-sm leading-5 text-[#555]">
                {notification.body}
              </p>
            </button>
          ))
        ) : (
          <p className="rounded-[20px] bg-[#f6f6f6] p-5 text-center text-sm font-medium leading-5 text-[#7b7b7b]">
            아직 새 알림이 없어요
          </p>
        )}
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
  <div className="flex min-h-dvh items-center justify-center bg-[#fdfdfe]">
    <MoreHorizontal
      className="size-8 animate-pulse text-[#9572ff]"
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
