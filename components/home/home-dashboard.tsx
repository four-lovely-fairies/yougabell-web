"use client";

import { Baby, MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getStoredSelectedChildId,
  loadHomeDashboard,
  setStoredSelectedChildId,
  type HomeLoadState,
} from "@/lib/api";
import type { ReactNode } from "react";
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
  moodPlus: "/icons/figma/home/mood-plus.svg",
  navAi: "/icons/figma/home/nav-ai.svg",
  navHome: "/icons/figma/home/nav-home.svg",
  navPlay: "/icons/figma/home/nav-play.svg",
  navRoadmap: "/icons/figma/home/nav-roadmap.svg",
  navWeeklyReport: "/icons/figma/home/nav-weekly-report.svg",
  reportSummary: "/icons/figma/home/report-summary.svg",
} as const;

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
    <main className="min-h-dvh overflow-x-hidden bg-[#d9c4e3] text-[#1f1a21]">
      <div className="relative mx-auto min-h-dvh w-full max-w-[390px] overflow-hidden bg-[rgba(90,0,132,0.23)] pb-[calc(82px+env(safe-area-inset-bottom))]">
        <div
          className="absolute bottom-0 left-0 top-[165px] w-[391px] rounded-t-[30px] bg-[#fff7fc]"
          aria-hidden
        />
        <TopAppBar
          child={selectedChild}
          unreadCount={data.notifications.unreadCount}
          onOpenChildren={() => setModal("children")}
          onOpenNotifications={() => setModal("notifications")}
        />
        <div className="relative z-10 flex flex-col items-center gap-[31px] px-6 pt-24">
          <WeeklyCalendar data={data} />
          <TodayMissionCard
            mission={data.recommendedMission}
            loading={loading}
          />
          <DashboardCards
            stage={data.growthStage}
            summary={data.reportSummary}
          />
        </div>
        <BottomNav />
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
      </div>
    </main>
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
  <header className="absolute inset-x-0 top-0 z-30 flex h-[72px] items-center justify-between bg-[#d9c4e3] px-6 py-4 shadow-[0_4px_20px_rgba(27,28,27,0.06)] backdrop-blur-xl">
    <button
      type="button"
      onClick={onOpenChildren}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#f5d9ff] p-0.5"
      aria-label="아이 선택"
      aria-haspopup="dialog"
    >
      <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-[#fff7fc] text-sm font-bold text-[#3a0057]">
        {child.name.slice(0, 1)}
      </span>
    </button>
    <button
      type="button"
      onClick={onOpenChildren}
      className="absolute left-1/2 top-6 flex h-6 w-[114px] -translate-x-1/2 items-center justify-center gap-1 rounded-[31px] bg-[#fff7fc] px-2 text-[13px] font-bold leading-[15px] text-black"
      aria-label="아이 목록 열기"
      aria-haspopup="dialog"
    >
      <span className="truncate">
        {child.name} ({child.ageLabel})
      </span>
      <FigmaIcon
        src={HOME_ICON_PATHS.childSwitcherChevron}
        alt=""
        className="size-3 shrink-0"
      />
    </button>
    <div className="flex w-[103px] items-center justify-end gap-4 text-[#3a0057]">
      <button
        type="button"
        onClick={onOpenNotifications}
        className="relative flex h-5 w-[37px] items-center justify-end"
        aria-label="알림 열기"
      >
        <FigmaIcon
          src={HOME_ICON_PATHS.headerNotification}
          alt=""
          className="h-5 w-4"
        />
        {unreadCount > 0 ? (
          <span className="absolute right-0 top-0 size-2 rounded-full bg-[#ec003f]" />
        ) : null}
      </button>
      <button
        type="button"
        className="flex size-6 items-center justify-center"
        aria-label="설정"
      >
        <FigmaIcon
          src={HOME_ICON_PATHS.headerSettings}
          alt=""
          className="size-5"
        />
      </button>
    </div>
  </header>
);

const WeeklyCalendar = ({ data }: { data: HomeDashboardData }) => (
  <section className="w-[342px]" data-node-id="2169:4436">
    <div className="flex h-7 items-center justify-between pr-4 drop-shadow-[0_0_2.5px_rgba(0,0,0,0.25)]">
      <div>
        <h1 className="text-lg font-bold leading-7 text-[#1f1a21]">
          {data.week.monthLabel}
        </h1>
      </div>
      <p className="text-sm font-medium leading-5 text-[#715380]">
        {data.week.weekOfMonthLabel}
      </p>
    </div>
    <div className="ml-1.5 mt-[13px] flex w-[330px] flex-col gap-0.5">
      <div className="flex h-[68px] items-start overflow-hidden">
        {data.week.days.map((day) => (
          <button
            key={day.date}
            type="button"
            className={`relative mr-[-12px] flex h-[66px] shrink-0 flex-col items-center justify-center rounded-[48px] ${
              day.isToday
                ? "w-[63px] bg-[#3a0057] text-white"
                : "w-14 bg-[#f6eaf5] text-[#4d4351]"
            }`}
          >
            {day.isToday ? (
              <span className="absolute left-1/2 top-1 size-1 -translate-x-1/2 rounded-full bg-white" />
            ) : null}
            <span className="pb-1 text-[10px] font-bold uppercase leading-[15px]">
              {day.weekdayLabel}
            </span>
            <span
              className={`font-bold leading-7 ${day.isToday ? "text-xl" : "text-lg"}`}
            >
              {day.dayOfMonth}
            </span>
          </button>
        ))}
      </div>
      <div className="flex h-8 w-[319px] items-start gap-[13px] px-[11px]">
        {data.week.days.map((day) => (
          <button
            key={`${day.date}-mood`}
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold leading-none text-black shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            aria-label={`${day.weekdayLabel} 마음 체크`}
          >
            {day.mood?.emoji ?? (
              <FigmaIcon
                src={HOME_ICON_PATHS.moodPlus}
                alt=""
                className="size-[10.5px]"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  </section>
);

const TodayMissionCard = ({
  mission,
  loading,
}: {
  mission: HomeDashboardData["recommendedMission"];
  loading: boolean;
}) => (
  <section
    className="flex h-[234px] w-[342px] flex-col items-start rounded-[48px] border border-[rgba(208,194,211,0.1)] bg-[#fcf0fb] px-[25px] pb-1 pt-[7px]"
    data-node-id="2169:4511"
  >
    <div className="flex h-0.5 w-full justify-center">
      <span className="h-0.5 w-8 rounded-full bg-[rgba(58,0,87,0.16)]" />
    </div>
    <div className="mt-4 flex h-[173px] w-full flex-col rounded-[42px] bg-white px-6 pb-6 pt-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="min-w-0">
        <span className="inline-flex h-[23px] items-center rounded-full bg-[#f6eaf5] px-3 text-[10px] font-bold leading-[15px] text-[#3a0057]">
          {mission?.subThemeLabel ?? "아이 10분 가까워지기"}
        </span>
        <h2 className="mt-1 max-w-[300px] text-[20px] font-extrabold leading-[25px] text-[#1f1a21]">
          {mission?.title ?? "오늘은 쉬어가도 좋아요"}
        </h2>
      </div>
      <button
        type="button"
        disabled={!mission || loading}
        className="mt-auto flex h-14 w-full items-center justify-center rounded-[32px] bg-[linear-gradient(167deg,#3a0057_0%,#ce80f8_100%)] text-base font-bold leading-6 text-white disabled:bg-[#cdbbd4]"
      >
        시작하기
      </button>
    </div>
  </section>
);

const DashboardCards = ({
  stage,
  summary,
}: {
  stage: HomeDashboardData["growthStage"];
  summary: HomeDashboardData["reportSummary"];
}) => (
  <section className="flex w-[385px] justify-center" data-node-id="2169:4523">
    <div className="flex w-[343px] flex-col gap-[13px]">
      <GrowthStageCard stage={stage} />
      <ReportSummaryCard summary={summary} />
    </div>
  </section>
);

const GrowthStageCard = ({
  stage,
}: {
  stage: HomeDashboardData["growthStage"];
}) => (
  <section className="h-[108px] w-[343px] rounded-[48px] border border-[rgba(208,194,211,0.1)] bg-[#f5d9ff] px-[15px] pb-[17px] pt-[15px]">
    <div className="flex h-6 items-center gap-[5px]">
      <FigmaIcon src={HOME_ICON_PATHS.growthStage} alt="" className="h-3 w-6" />
      <h2 className="text-base font-bold leading-6 text-[#583b67]">
        현재 상황 [ {stage?.name ?? "확인 중"} ]
      </h2>
    </div>
    <p className="mt-1.5 max-h-12 overflow-hidden text-[12px] font-medium leading-4 text-[#583b67]">
      {stage?.summary ??
        "아이의 독립심이 싹트고 있어요. 따뜻한 인내심이 아이의 자존감을 만듭니다."}
    </p>
  </section>
);

const ReportSummaryCard = ({
  summary,
}: {
  summary: HomeDashboardData["reportSummary"];
}) => {
  return (
    <section className="h-[129px] w-[343px] rounded-[48px] border border-[rgba(208,194,211,0.1)] bg-[#f0e5ef] px-[15px] pb-[17px] pt-[15px]">
      <div className="flex h-6 items-center gap-3">
        <FigmaIcon
          src={HOME_ICON_PATHS.reportSummary}
          alt=""
          className="size-[18px]"
        />
        <div className="flex flex-1 items-center justify-between">
          <h2 className="min-w-0 pr-2 text-[16px] font-bold leading-6 text-[#1f1a21]">
            {summary?.title ?? "지난주 아이와 함께한 놀이 시간"}
          </h2>
          <button
            type="button"
            onClick={() => {
              window.location.href = summary?.reportId
                ? `/weekly-report?reportId=${summary.reportId}`
                : "/weekly-report";
            }}
            className="shrink-0 text-[10px] font-bold leading-[15px] text-[#4d4351]"
          >
            더 알아보기
          </button>
        </div>
      </div>
      {summary ? (
        <div className="mt-[7px] grid h-[68px] grid-cols-2 gap-4">
          <WeeklyReportMetricCard
            label="누적 놀이 수행시간"
            value={<DurationValue label={summary.totalDurationLabel} />}
            tone="purple"
          />
          <WeeklyReportMetricCard
            label="아이 반응 긍정률"
            value={`${summary.childPositiveReactionRate}%`}
            tone="gold"
          />
        </div>
      ) : (
        <div className="mt-[7px] flex h-[68px] items-center rounded-[32px] bg-[#fff7fc] px-4">
          <p className="text-xs font-semibold leading-4 text-[#715380]">
            지난주 리포트가 아직 없어요. 이번 주 미션을 완료하면 다음 리포트에서
            놀이 시간과 아이 반응을 확인할 수 있어요.
          </p>
        </div>
      )}
    </section>
  );
};

const WeeklyReportMetricCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone: "purple" | "gold";
}) => (
  <div className="flex h-[68px] min-w-0 flex-col gap-1 overflow-hidden rounded-[32px] bg-[#fff7fc] px-4 pb-4 pt-[11px]">
    <span className="text-[12px] font-semibold leading-4 text-[#715380]">
      {label}
    </span>
    <span
      className={`flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0 text-[24px] font-bold leading-8 ${
        tone === "purple" ? "text-[#5a0084]" : "text-[#c5995f]"
      }`}
    >
      {value}
    </span>
  </div>
);

const DurationValue = ({ label }: { label: string }) => {
  const parts = label.match(/^(?:(\d+)시간)?(?:\s*)?(?:(\d+)분)?$/);

  if (!parts) {
    return <span className="text-[24px] leading-8">{label}</span>;
  }

  const [, hours, minutes] = parts;
  return (
    <>
      {hours ? (
        <>
          <span>{hours}</span>
          <span className="text-[14px] leading-5">시간</span>
        </>
      ) : null}
      {minutes ? (
        <>
          <span>{minutes}</span>
          <span className="text-[14px] leading-5">분</span>
        </>
      ) : null}
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
    className="fixed inset-0 z-40 bg-[rgba(104,104,104,0.53)]"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div className="relative mx-auto h-[874px] w-full max-w-[390px]">
      <button
        type="button"
        onClick={onClose}
        onMouseDown={(event) => event.stopPropagation()}
        className="absolute left-1/2 top-6 flex h-6 w-[114px] -translate-x-1/2 items-center justify-center gap-1 rounded-[31px] bg-[#fff7fc] px-2 text-[13px] font-bold leading-[15px] text-black"
        aria-label="아이 목록 닫기"
      >
        <span className="truncate">
          {childItems.find((child) => child.id === selectedChildId)?.name ??
            "아이"}{" "}
          (
          {childItems.find((child) => child.id === selectedChildId)?.ageLabel ??
            ""}
          )
        </span>
        <FigmaIcon
          src={HOME_ICON_PATHS.childSwitcherChevron}
          alt=""
          className="size-3 shrink-0"
        />
      </button>
      <div
        className="absolute left-1/2 top-[66px] h-[180px] w-[340px] -translate-x-1/2 overflow-hidden rounded-[50px] bg-white shadow-[0_4px_17.4px_rgba(0,0,0,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        {childItems.map((child, index) => {
          const selected = child.id === selectedChildId;
          return (
            <div
              key={child.id}
              className={`relative flex h-[90px] items-center px-[22px] ${
                selected || index === 0 ? "bg-[#d9c4e3]" : "bg-white"
              } ${index === 0 ? "rounded-t-[50px]" : ""}`}
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-5 text-left"
                onClick={() => onSelect(child)}
              >
                <span className="flex size-[45px] shrink-0 items-center justify-center rounded-full bg-[#fff7fc] text-[#3a0057]">
                  <Baby className="size-7" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-bold leading-[15px] text-black">
                    {child.name}
                  </span>
                  <span className="mt-[7px] block truncate text-xs font-medium leading-[15px] text-black">
                    {child.ageLabel} ({new Date(child.birthDate).getFullYear()}
                    년생)
                  </span>
                </span>
              </button>
              <div className="ml-3 flex shrink-0 items-center gap-4 text-[13px] leading-[13px] text-black">
                <button type="button" className="underline">
                  수정
                </button>
                <button type="button" className="underline">
                  삭제
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
    className="fixed inset-0 z-40 bg-black/30"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div
      className="absolute inset-x-4 top-[calc(72px+env(safe-area-inset-top))] mx-auto max-w-[398px] rounded-[24px] bg-[var(--surface)] p-5 shadow-xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">알림</h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            읽지 않은 알림 {unreadCount}개
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-bold text-[var(--primary)]"
        >
          모두 읽음
        </button>
      </div>
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className="w-full rounded-xl bg-[var(--surface-muted)] p-4 text-left"
            >
              <p className="font-bold">{notification.title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                {notification.body}
              </p>
            </button>
          ))
        ) : (
          <p className="rounded-xl bg-[var(--surface-muted)] p-5 text-center text-sm text-[var(--text-secondary)]">
            아직 새 알림이 없어요
          </p>
        )}
      </div>
    </div>
  </div>
);

const BottomNav = () => {
  const items = [
    {
      label: "홈",
      iconSrc: HOME_ICON_PATHS.navHome,
      iconClassName: "h-[18px] w-4",
      active: true,
      href: "/",
    },
    {
      label: "10분 놀이",
      iconSrc: HOME_ICON_PATHS.navPlay,
      iconClassName: "h-5 w-[18px]",
    },
    {
      label: "성장 로드맵",
      iconSrc: HOME_ICON_PATHS.navRoadmap,
      iconClassName: "size-[18px]",
    },
    {
      label: "ai 상담",
      iconSrc: HOME_ICON_PATHS.navAi,
      iconClassName: "h-[19px] w-[22px]",
    },
    {
      label: "주간 리포트",
      iconSrc: HOME_ICON_PATHS.navWeeklyReport,
      iconClassName: "size-[18px]",
      href: "/weekly-report",
    },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto h-[82px] max-w-[390px] rounded-t-[48px] bg-[rgba(252,247,252,0.9)] pt-[13px] shadow-[0_-4px_40px_rgba(27,28,27,0.04)] backdrop-blur-xl">
      <div className="flex w-full items-center justify-center">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.href && item.href !== window.location.pathname) {
                window.location.href = item.href;
              }
            }}
            aria-current={item.active ? "page" : undefined}
            className={`flex h-[55px] w-[77px] flex-col items-center justify-center px-3 py-2 text-[10px] font-bold leading-[15px] ${
              item.active
                ? "rounded-full bg-[#f8dcff] text-[#3c2d46]"
                : "text-[#a093a1]"
            }`}
          >
            <FigmaIcon
              src={item.iconSrc}
              alt=""
              className={`shrink-0 ${item.iconClassName}`}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

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
  <main className="flex min-h-screen items-center justify-center bg-[var(--surface-muted)]">
    <MoreHorizontal
      className="size-8 animate-pulse text-[var(--primary)]"
      aria-label="홈 불러오는 중"
    />
  </main>
);
