"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  getStoredSelectedChildId,
  loadHomeDashboard,
  markAllNotificationsRead,
  markNotificationRead,
  setStoredSelectedChildId,
  submitHomeMoodCheck,
  type HomeLoadState,
} from "@/lib/api";
import type { HomeChild, HomeNotification } from "@/lib/home-data";
import { GrowthStageCard, ReportSummaryCard, TodayMissionCard } from "./cards";
import {
  ChildSwitcherDropdown,
  MoodCheckModal,
  NotificationModal,
} from "./modals";
import { HomeError, HomeSkeleton } from "./skeleton";
import { TopAppBar } from "./top-app-bar";
import type { Modal, MoodLevel } from "./types";
import { WeeklyCalendar } from "./weekly-calendar";

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
  const [notificationSubmitting, setNotificationSubmitting] = useState(false);

  const refresh = useCallback(
    async (childId?: string | null, showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const next = await loadHomeDashboard(childId);
        setState(next);
        setSelectedChildId(next.data.selectedChild.id);
      } catch {
        // 데이터가 아직 없으면 렌더에서 에러 UI를 노출. 기존 데이터가 있으면 유지한다.
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const next = await loadHomeDashboard(getStoredSelectedChildId());
        if (!active) return;
        setState(next);
        setSelectedChildId(next.data.selectedChild.id);
      } catch {
        // 초기 로드 실패 — 렌더에서 에러 UI 노출
      } finally {
        if (active) setLoading(false);
      }
    })();
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

  if (!data || !selectedChild) {
    return loading ? (
      <HomeSkeleton />
    ) : (
      <HomeError onRetry={() => void refresh(getStoredSelectedChildId())} />
    );
  }

  const onSelectChild = (child: HomeChild) => {
    setStoredSelectedChildId(child.id);
    setSelectedChildId(child.id);
    setModal(null);
    void refresh(child.id);
  };

  const markNotificationReadLocally = (notificationId: string) => {
    setState((current) => {
      if (!current) return current;

      let changed = false;
      const latest = current.data.notifications.latest.map((notification) => {
        if (notification.id !== notificationId || notification.readAt) {
          return notification;
        }

        changed = true;
        return {
          ...notification,
          readAt: new Date().toISOString(),
        };
      });

      if (!changed) {
        return current;
      }

      return {
        ...current,
        data: {
          ...current.data,
          notifications: {
            ...current.data.notifications,
            unreadCount: Math.max(
              0,
              current.data.notifications.unreadCount - 1,
            ),
            latest,
          },
        },
      };
    });
  };

  const markAllNotificationsReadLocally = () => {
    setState((current) => {
      if (!current) return current;

      const latest = current.data.notifications.latest.map((notification) =>
        notification.readAt
          ? notification
          : { ...notification, readAt: new Date().toISOString() },
      );

      return {
        ...current,
        data: {
          ...current.data,
          notifications: {
            ...current.data.notifications,
            unreadCount: 0,
            latest,
          },
        },
      };
    });
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

  const handleNotificationOpen = async (notification: HomeNotification) => {
    if (notificationSubmitting) {
      return;
    }

    setNotificationSubmitting(true);
    try {
      if (!notification.readAt) {
        await markNotificationRead(notification.id);
        markNotificationReadLocally(notification.id);
      }
      setModal(null);
      openNotificationTarget(notification);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/onboarding/intro");
        return;
      }
    } finally {
      setNotificationSubmitting(false);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (notificationSubmitting || data?.notifications.unreadCount === 0) {
      return;
    }

    setNotificationSubmitting(true);
    try {
      await markAllNotificationsRead();
      markAllNotificationsReadLocally();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/onboarding/intro");
        return;
      }
    } finally {
      setNotificationSubmitting(false);
    }
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
      <div className="relative min-h-dvh bg-gray-20 px-5 pb-9 pt-safe text-gray-800">
        <div className="relative z-50">
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
      {modal === "notifications" ? (
        <NotificationModal
          notifications={data.notifications.latest}
          unreadCount={data.notifications.unreadCount}
          submitting={notificationSubmitting}
          onClose={() => setModal(null)}
          onMarkAllRead={() => void handleMarkAllNotificationsRead()}
          onOpenNotification={(notification) =>
            void handleNotificationOpen(notification)
          }
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
