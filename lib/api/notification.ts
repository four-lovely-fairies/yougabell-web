import type { components } from "../generated/api-types";
import { ApiError, authHeaders, request } from "./client";

export type NotificationListItem =
  components["schemas"]["NotificationListItemDto"];

export const markNotificationRead = async (
  notificationId: string,
): Promise<NotificationListItem> => {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  return request<NotificationListItem>(
    `/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers,
    },
  );
};

export const markAllNotificationsRead = async (): Promise<{
  updatedCount: number;
}> => {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  return request<{ updatedCount: number }>("/notifications/read-all", {
    method: "PATCH",
    headers,
  });
};
