"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { useMainShellReport } from "@/components/app/main-shell-report-context";
import {
  getStoredSelectedChildId,
  loadWeeklyReportUnviewedStatus,
} from "@/lib/api";
import { track } from "@/lib/analytics";
import { beginScreen } from "@/lib/performance";
import { reportStateForChild } from "@/lib/main-shell-report-state";
import { createSingleFlight } from "@/lib/single-flight";
import type { NavigationEvent } from "@/lib/analytics";

// 다음 AI 상담 업데이트 때는 날짜만 바꾸면 점이 다시 뜬다.
const CHAT_NEW_KEY = "yb:nav-new:chat:2026-11-18";
const isChatNew = () => {
  try {
    return window.localStorage.getItem(CHAT_NEW_KEY) === null;
  } catch {
    return false;
  }
};
const CHAT_SEEN_EVENT = "yb:nav-chat-seen";
const markChatSeen = () => {
  if (!isChatNew()) return;
  try {
    window.localStorage.setItem(CHAT_NEW_KEY, "1");
  } catch {
    // 무시
  }
  window.dispatchEvent(new Event(CHAT_SEEN_EVENT));
};
const subscribeChatSeen = (onChange: () => void) => {
  window.addEventListener(CHAT_SEEN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHAT_SEEN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const NAV_ICON_PATHS = {
  home: "/icons/figma/nav/home.svg",
  play: "/icons/figma/nav/play.svg",
  roadmap: "/icons/figma/nav/roadmap.svg",
  ai: "/icons/figma/nav/ai.svg",
  report: "/icons/figma/nav/report.svg",
} as const;

type BottomNavItem = {
  label: string;
  href: string;
  /** 분석용 탭 식별자. 라벨은 바뀔 수 있으므로 지표는 이 값으로 고정한다. */
  tab: NavigationEvent["tab"];
  iconSrc: string;
  iconClassName: string;
  matches: (pathname: string) => boolean;
};

// Figma 6113:9267 — 홈 / 놀이 / 로드맵 / AI 상담 / 리포트
const items: BottomNavItem[] = [
  {
    label: "홈",
    href: "/",
    tab: "home",
    iconSrc: NAV_ICON_PATHS.home,
    iconClassName: "size-6",
    matches: (pathname: string) => pathname === "/",
  },
  {
    label: "놀이",
    href: "/mission",
    tab: "play",
    iconSrc: NAV_ICON_PATHS.play,
    iconClassName: "size-6",
    matches: (pathname: string) => pathname.startsWith("/mission"),
  },
  {
    label: "로드맵",
    href: "/roadmap",
    tab: "roadmap",
    iconSrc: NAV_ICON_PATHS.roadmap,
    iconClassName: "size-6",
    matches: (pathname: string) => pathname.startsWith("/roadmap"),
  },
  {
    label: "AI 상담",
    href: "/chat",
    tab: "chat",
    iconSrc: NAV_ICON_PATHS.ai,
    iconClassName: "size-5",
    matches: (pathname: string) => pathname.startsWith("/chat"),
  },
  {
    label: "리포트",
    href: "/weekly-report",
    tab: "report",
    iconSrc: NAV_ICON_PATHS.report,
    iconClassName: "size-5",
    matches: (pathname: string) => pathname.startsWith("/weekly-report"),
  },
];

// 단색 SVG를 mask로 써서 currentColor로 칠한다 → 활성/비활성 색 전환이 라벨 색과 함께 동작.
const maskStyle = (src: string): CSSProperties => ({
  backgroundColor: "currentColor",
  maskImage: `url(${src})`,
  WebkitMaskImage: `url(${src})`,
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
  maskSize: "contain",
  WebkitMaskSize: "contain",
});

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { state, replaceForChild } = useMainShellReport();
  const selectedChildId = getStoredSelectedChildId();
  const selectedChildState = reportStateForChild(state, selectedChildId);
  const showReportTooltip =
    selectedChildState?.hasUnviewedWeeklyReport ?? false;
  const runStatusRequest = useMemo(() => createSingleFlight<boolean>(), []);
  // AI 상담 "새 기능" 점 — 업데이트된 AI 상담을 한 번 열면 사라진다(기기 기준).
  const chatNew = useSyncExternalStore(subscribeChatSeen, isChatNew, () => false);
  useEffect(() => {
    if (pathname.startsWith("/chat")) markChatSeen();
  }, [pathname]);
  // 누른 즉시 활성 알약을 옮긴다 — 화면 전환(서버 응답)을 기다리지 않아 눌렸다는 게 바로 보인다.
  // 경로가 바뀌면 실제 경로 기준으로 되돌아간다.
  const [pending, setPending] = useState<{ index: number; from: string } | null>(null);
  const routeIndex = items.findIndex((item) => item.matches(pathname));
  const activeIndex = pending && pending.from === pathname ? pending.index : routeIndex;

  useEffect(() => {
    if (pathname.startsWith("/weekly-report")) {
      return;
    }

    let active = true;
    const checkUnviewedReport = () => {
      const childId = getStoredSelectedChildId();

      void runStatusRequest(() => loadWeeklyReportUnviewedStatus(childId))
        .then((hasUnviewedReport) => {
          if (active && getStoredSelectedChildId() === childId) {
            replaceForChild(childId, hasUnviewedReport);
          }
        })
        .catch(() => undefined);
    };

    // 홈에서는 HomeDashboard가 같은 /home 응답으로 context를 채운다.
    // 비홈 직접 진입 또는 다른 자녀의 상태만 있을 때 fallback을 사용한다.
    if (pathname !== "/" && !selectedChildState) checkUnviewedReport();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") checkUnviewedReport();
    };
    window.addEventListener("focus", checkUnviewedReport);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      active = false;
      window.removeEventListener("focus", checkUnviewedReport);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, replaceForChild, runStatusRequest, selectedChildState]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 w-full px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 md:left-1/2 md:max-w-97.5 md:-translate-x-1/2">
      {/* Figma 6113:9267 — 글래스: 반투명 흰 그라데이션 + 배경 흐림 + 흰 테두리 + 옅은 그림자 */}
      <div
        className="relative rounded-full border border-white/95 p-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-[12px]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%), linear-gradient(90deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.55) 100%)",
        }}
      >
        {showReportTooltip && !pathname.startsWith("/weekly-report") ? (
          <div
            role="status"
            className="pointer-events-none absolute bottom-[calc(100%+18px)] left-[90%] z-10 -translate-x-1/2"
          >
            <div className="report-tooltip-bounce">
              <div className="relative whitespace-nowrap rounded-full bg-gray-700 px-5 py-3 text-sm font-medium text-white shadow-2">
                생성된 리포트가 있어요!
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-gray-700"
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="relative flex items-center gap-1">
          {/* 활성 탭 알약 — 탭 사이를 살짝 튕기듯(오버슈트) 미끄러진다 */}
          {activeIndex >= 0 ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 motion-reduce:transition-none"
              style={{
                width: `calc((100% - ${(items.length - 1) * 4}px) / ${items.length})`,
                transform: `translateX(calc(${activeIndex} * (100% + 4px)))`,
                transition: "transform 560ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {/* 이동할 때마다 한 번 말랑하게 눌렸다 펴진다 */}
              <span
                key={activeIndex}
                className="block size-full animate-nav-squish rounded-full bg-[rgba(120,120,128,0.14)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] motion-reduce:animate-none"
              />
            </span>
          ) : null}

          {items.map((item, index) => {
            const active = index === activeIndex;
            // 알림 벨과 같은 빨간 점(숫자 없음)
            // - 리포트: 안 본 주간 리포트가 있을 때
            // - AI 상담: 업데이트 후 아직 안 열어봤을 때
            const showDot =
              (item.tab === "report" &&
                showReportTooltip &&
                !pathname.startsWith("/weekly-report")) ||
              (item.tab === "chat" && chatNew && !pathname.startsWith("/chat"));

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  // 이미 열려 있는 탭이면 화면 전환이 없으므로 유입으로 세지 않는다.
                  if (item.href === pathname) return;
                  setPending({ index, from: pathname });
                  track({ type: "bottom_nav_tap", tab: item.tab });
                  beginScreen(item.href);
                  router.push(item.href);
                }}
                aria-current={active ? "page" : undefined}
                aria-label={showDot ? `${item.label}, 새 소식 있음` : undefined}
                className={`relative z-10 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full py-1 text-xs leading-[1.4] transition-[color,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.9] motion-reduce:transition-none ${
                  active ? "font-medium text-gray-800" : "font-normal text-gray-400"
                }`}
              >
                <span className="relative flex size-6 items-center justify-center">
                  <span
                    aria-hidden
                    className={`shrink-0 ${item.iconClassName}`}
                    style={maskStyle(item.iconSrc)}
                  />
                  {showDot ? (
                    <span
                      aria-hidden
                      className="absolute -right-0.5 top-0 size-2 rounded-full bg-error-600"
                    />
                  ) : null}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
