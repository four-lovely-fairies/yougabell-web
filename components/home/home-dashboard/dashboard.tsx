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
  ChildSwitcherDropdown,
  NotificationConfiguredModal,
  NotificationModal,
} from "./modals";
import {
  applyNotificationAction,
  type NotificationAction,
} from "./notification-state";
import { TopAppBar } from "./top-app-bar";
import type { Modal } from "./types";
import { WeeklyCalendar } from "./weekly-calendar";

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
          {modal === "children" ? (
            <>
              <button
                type="button"
                aria-label="닫기"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setModal(null)}
              />
              <div className="absolute left-0 top-14 z-50">
                <ChildSwitcherDropdown
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
                />
              </div>
            </>
          ) : null}
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
        <div className="bg-white px-5 pt-4">
          <ReportProgressBanner
            countdown={getWeeklyReportCountdown()}
            streak={data.playStreakDays}
          />
        </div>
        <WeeklyCalendar data={data} />
        <div className="flex flex-col gap-4 px-5 pt-4">
          <TodayMissionCard
            mission={data.recommendedMission}
            loading={Boolean(selectionPending)}
            showNotificationNudge={!data.playNotificationEnabled}
            onStart={startMissionFromHome}
            onNotification={openNotificationNudge}
          />
          <HomeShortcutCards
            roadmapProgress={data.roadmapProgress}
            reportSummary={data.reportSummary}
            reportCountdown={getWeeklyReportCountdown()}
            onRoadmap={() => router.push("/roadmap")}
            onReport={() => router.push("/weekly-report")}
          />
          <AiConsultationCard onClick={() => router.push("/chat")} />
        </div>
      </div>
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
