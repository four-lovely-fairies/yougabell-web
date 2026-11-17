"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useNotificationSetupFlow } from "@/hooks/use-notification-setup-flow";
import { useMainShellReport } from "@/components/app/main-shell-report-context";
import { track } from "@/lib/analytics";
import { useScreenPerformance } from "@/hooks/use-screen-performance";
import {
  ApiError,
  getStoredSelectedChildId,
  markAllNotificationsRead,
  markNotificationRead,
  setStoredSelectedChildId,
} from "@/lib/api";
import type {
  HomeChild,
  HomeDashboard as HomeDashboardData,
  HomeNotification,
} from "@/lib/home-data";
import { NotificationPermissionModal } from "@/components/mission/notification-permission-modal";
import { NotificationScheduleScreen } from "@/components/mission/notification-schedule-screen";
import { getWeeklyReportCountdown } from "@/lib/report-progress";
import {
  AiConsultationCard,
  HomeShortcutCards,
  ReportProgressBanner,
  TodayMissionCard,
} from "./cards";
import {
  ChildSwitcherSheet,
  NotificationConfiguredModal,
  NotificationModal,
} from "./modals";
import {
  applyNotificationAction,
  type NotificationAction,
} from "./notification-state";
import { TopAppBar } from "./top-app-bar";
import { WhatsNewSheet } from "@/components/home/whats-new-sheet";
import { markWhatsNewSeen, shouldShowWhatsNew } from "@/lib/whats-new";
import type { Modal } from "./types";
import { WeeklyCalendar } from "./weekly-calendar";

// 홈 첫 진입 연출 — 블록이 위에서 아래 순서로 살짝 올라오며 나타난다 (과하지 않게 80ms 간격).
const ENTER = "animate-enter-up motion-reduce:animate-none";
const enterDelay = (ms: number) => ({ animationDelay: `${ms}ms` });

export const HomeDashboard = ({
  initialHome,
  selectionResetRequired,
}: {
  initialHome: HomeDashboardData;
  selectionResetRequired: boolean;
}) => {
  const router = useRouter();
  // Confirmed client-only patches belong to this server payload, not future RSC props.
  const [confirmed, setConfirmed] = useState<{
    source: HomeDashboardData;
    data: HomeDashboardData;
  } | null>(null);
  const base = confirmed?.source === initialHome ? confirmed.data : initialHome;
  const [data, applyOptimistic] = useOptimistic(base, applyNotificationAction);
  const [pendingSelection, setPendingSelection] = useState<{
    source: HomeDashboardData;
    id: string;
  } | null>(null);
  const [refreshPending, startRefresh] = useTransition();
  const selectionPending =
    pendingSelection?.source === initialHome && refreshPending
      ? pendingSelection.id
      : null;
  const [modal, setModal] = useState<Modal>(null);
  const [notificationSubmitting, setNotificationSubmitting] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );
  const notificationSetup = useNotificationSetupFlow();
  const { clear: clearReportState, replaceFromHome } = useMainShellReport();
  useScreenPerformance("/", "api");

  useEffect(() => {
    // A stale/deleted cookie is repaired from the server-selected default child.
    if (
      selectionResetRequired ||
      getStoredSelectedChildId() !== initialHome.selectedChild.id
    ) {
      setStoredSelectedChildId(initialHome.selectedChild.id);
    }
    replaceFromHome(initialHome);
  }, [initialHome, replaceFromHome, selectionResetRequired]);

  const refresh = useCallback(() => {
    if (refreshPending) return;
    startRefresh(() => router.refresh());
  }, [refreshPending, router]);

  const onPullRefresh = useCallback(() => refresh(), [refresh]);
  const { distance: pullDistance, refreshing: pullRefreshing } =
    usePullToRefresh(onPullRefresh, !refreshPending);

  useEffect(() => {
    track({ type: "home_view" });
  }, []);

  // 업데이트 안내 — 기존 사용자에게 기기당 1회. 홈 진입 연출이 끝난 뒤 띄우고, 띄우는 순간 본 것으로 기록.
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  useEffect(() => {
    if (!shouldShowWhatsNew()) return;
    const timer = window.setTimeout(() => {
      markWhatsNewSeen();
      setWhatsNewOpen(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedChild = data.selectedChild;

  const onSelectChild = (child: HomeChild) => {
    if (child.id === selectedChild.id || selectionPending || refreshPending) {
      return;
    }
    track({ type: "home_child_switch" });
    setStoredSelectedChildId(child.id);
    setPendingSelection({ source: initialHome, id: child.id });
    clearReportState();
    setModal(null);
    refresh();
  };

  const confirmNotification = (action: NotificationAction) => {
    setConfirmed((current) => ({
      source: initialHome,
      data: applyNotificationAction(
        current?.source === initialHome ? current.data : initialHome,
        action,
      ),
    }));

    // 읽음 처리는 이 화면 상태에만 반영되므로, 다른 화면에 다녀오면 브라우저에 남아 있던
    // 예전 홈 데이터(읽지 않은 알림 있음)가 다시 쓰여 빨간 점이 되살아난다.
    // 서버에서 홈을 다시 받아 저장된 화면 데이터도 최신으로 바꾼다.
    router.refresh();
  };

  const openNotificationTarget = (notification: HomeNotification) => {
    if (notification.targetType === "child" && notification.targetId) {
      setStoredSelectedChildId(notification.targetId);
    }

    switch (notification.actionType) {
      case "open_home":
        if (notification.targetType === "child") {
          router.push("/mission");
          return;
        }
        router.push("/");
        return;
      case "open_mission":
        router.push("/mission");
        return;
      case "open_roadmap":
        router.push("/roadmap");
        return;
      case "open_chat":
        router.push("/chat");
        return;
      case "open_report":
        router.push(
          notification.targetId
            ? `/weekly-report?reportId=${encodeURIComponent(notification.targetId)}`
            : "/weekly-report",
        );
        return;
      case "url":
        if (notification.targetUrl) {
          window.location.href = notification.targetUrl;
        }
        return;
      default:
        return;
    }
  };

  const handleNotificationOpen = (notification: HomeNotification) => {
    if (notificationSubmitting) {
      return;
    }

    const action: NotificationAction = { type: "read", id: notification.id };
    setNotificationSubmitting(true);
    setNotificationError(null);
    startTransition(async () => {
      try {
        if (!notification.readAt) {
          applyOptimistic(action);
          await markNotificationRead(notification.id);
          confirmNotification(action);
        }
        setModal(null);
        track({ type: "home_notification_open" });
        openNotificationTarget(notification);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/onboarding/intro");
        } else {
          setNotificationError("알림을 처리하지 못했어요. 다시 시도해 주세요.");
        }
      } finally {
        setNotificationSubmitting(false);
      }
    });
  };

  const handleMarkAllNotificationsRead = () => {
    if (notificationSubmitting || data.notifications.unreadCount === 0) {
      return;
    }

    setNotificationSubmitting(true);
    setNotificationError(null);
    startTransition(async () => {
      try {
        const action: NotificationAction = { type: "read-all" };
        applyOptimistic(action);
        await markAllNotificationsRead();
        confirmNotification(action);
        track({ type: "home_notifications_mark_all_read" });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/onboarding/intro");
        } else {
          setNotificationError("알림을 처리하지 못했어요. 다시 시도해 주세요.");
        }
      } finally {
        setNotificationSubmitting(false);
      }
    });
  };

  const startMissionFromHome = () => {
    track({ type: "home_mission_start_click" });
    router.push("/mission");
  };

  const openNotificationNudge = () => {
    track({ type: "home_play_notification_nudge_click" });
    if (data.playNotificationEnabled) {
      setModal("notification-configured");
      return;
    }

    notificationSetup.start();
  };

  return (
    <>
      {/* 인스타그램식 고정 헤더 — 스크롤·당겨서새로고침(overscroll)에도 상단 고정.
          sticky는 iOS 러버밴드 때 함께 움직여 fixed로 처리. */}
      <div className="fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-107.5 bg-white px-5 pt-safe">
        <div className="relative">
          <TopAppBar
            child={selectedChild}
            unreadCount={data.notifications.unreadCount}
            onOpenChildren={() => setModal("children")}
            onOpenNotifications={() => setModal("notifications")}
          />
        </div>
      </div>
      {/* 당겨서새로고침 스피너 — 고정 헤더 바로 아래(z-40 < 헤더 z-50)에 표시 */}
      {pullDistance > 0 || pullRefreshing || refreshPending ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto w-full max-w-107.5 pt-safe"
        >
          <div className="h-14" />
          <div className="flex justify-center">
            <div
              className={`mt-2 size-6 rounded-full border-2 border-gray-200 border-t-primary-300 ${
                pullRefreshing || refreshPending ? "animate-spin" : ""
              }`}
              style={{
                transform:
                  pullRefreshing || refreshPending
                    ? undefined
                    : `translateY(${pullDistance}px) rotate(${pullDistance * 3}deg)`,
                opacity:
                  pullRefreshing || refreshPending
                    ? 1
                    : Math.min(1, pullDistance / 40),
              }}
            />
          </div>
        </div>
      ) : null}
      <div className="relative bg-gray-20 pb-9 text-gray-800">
        {/* 고정 헤더(safe-area + 56px) 높이만큼 콘텐츠 하강 */}
        <div aria-hidden className="pt-safe">
          <div className="h-14" />
        </div>
        <div className={`bg-white px-5 pt-4 ${ENTER}`} style={enterDelay(0)}>
          <ReportProgressBanner
            countdown={getWeeklyReportCountdown()}
            streak={data.playStreakDays}
          />
        </div>
        <div className={ENTER} style={enterDelay(80)}>
          <WeeklyCalendar data={data} />
        </div>
        <div className="flex flex-col gap-4 px-5 pt-4">
          <div className={ENTER} style={enterDelay(160)}>
            <TodayMissionCard
              mission={data.recommendedMission}
              loading={Boolean(selectionPending)}
              showNotificationNudge={!data.playNotificationEnabled}
              onStart={startMissionFromHome}
              onNotification={openNotificationNudge}
            />
          </div>
          <div className={ENTER} style={enterDelay(240)}>
            <HomeShortcutCards
              roadmapProgress={data.roadmapProgress}
              reportSummary={data.reportSummary}
              onRoadmap={() => router.push("/roadmap")}
              onReport={() => router.push("/weekly-report")}
            />
          </div>
          <div className={ENTER} style={enterDelay(320)}>
            <AiConsultationCard onClick={() => router.push("/chat")} />
          </div>
        </div>
      </div>
      {whatsNewOpen && modal === null && notificationSetup.view === null ? (
        <WhatsNewSheet onClose={() => setWhatsNewOpen(false)} />
      ) : null}
      {modal === "children" ? (
        <ChildSwitcherSheet
          childItems={data.children}
          selectedChildId={selectedChild.id}
          onSelect={onSelectChild}
          onEdit={(child) => {
            setModal(null);
            router.push(`/settings/children/${child.id}`);
          }}
          onDelete={() => {
            setModal(null);
            router.push("/settings/children");
          }}
          onClose={() => setModal(null)}
        />
      ) : null}
      {modal === "notifications" ? (
        <NotificationModal
          notifications={data.notifications.latest}
          unreadCount={data.notifications.unreadCount}
          submitting={notificationSubmitting}
          errorMessage={notificationError}
          onClose={() => setModal(null)}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onOpenNotification={handleNotificationOpen}
        />
      ) : null}
      {modal === "notification-configured" ? (
        <NotificationConfiguredModal onClose={() => setModal(null)} />
      ) : null}
      {notificationSetup.view === "schedule" ? (
        <div className="fixed inset-0 z-60 mx-auto w-full max-w-107.5">
          <NotificationScheduleScreen
            onClose={notificationSetup.close}
            onComplete={() => {
              setConfirmed((current) => ({
                source: initialHome,
                data: {
                  ...(current?.source === initialHome
                    ? current.data
                    : initialHome),
                  playNotificationEnabled: true,
                },
              }));
              notificationSetup.close();
              setModal("notification-configured");
            }}
          />
        </div>
      ) : null}
      {notificationSetup.view === "permission-prompt" ||
      notificationSetup.view === "system-settings-prompt" ? (
        <NotificationPermissionModal
          variant={
            notificationSetup.view === "permission-prompt"
              ? "request"
              : "settings"
          }
          busy={notificationSetup.busy}
          onClose={notificationSetup.close}
          onConfirm={() => void notificationSetup.confirmPermission()}
        />
      ) : null}
    </>
  );
};
