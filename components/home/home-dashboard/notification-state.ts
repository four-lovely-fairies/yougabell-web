import type { HomeDashboard, HomeNotification } from "@/lib/home-data";

export type NotificationAction =
  | { type: "read"; id: string }
  | { type: "read-all" };

export function applyNotificationAction(
  data: HomeDashboard,
  action: NotificationAction,
): HomeDashboard {
  const latest = data.notifications.latest.map((notification) =>
    (action.type === "read-all" || notification.id === action.id) &&
    !notification.readAt
      ? { ...notification, readAt: new Date().toISOString() }
      : notification,
  );
  const newlyRead = data.notifications.latest.filter(
    (notification: HomeNotification) =>
      !notification.readAt &&
      (action.type === "read-all" || notification.id === action.id),
  ).length;
  if (!newlyRead && action.type === "read") return data;
  return {
    ...data,
    notifications: {
      ...data.notifications,
      latest,
      unreadCount:
        action.type === "read-all"
          ? 0
          : Math.max(0, data.notifications.unreadCount - newlyRead),
    },
  };
}
