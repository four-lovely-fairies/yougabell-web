import { request } from "./client";
import type {
  ApiInterestId,
  CompleteOnboardingPayload,
  MeResponse,
  NotificationPreferenceRow,
  NotificationPreferenceType,
} from "../types";

export const api = {
  getMe: () => request<MeResponse>("/me"),
  completeOnboarding: (payload: CompleteOnboardingPayload) =>
    request<MeResponse>("/onboarding/complete", {
      method: "POST",
      json: payload,
    }),
  // 설정 화면용 (docs/features/20260519-settings.md)
  updateParent: (body: {
    name?: string;
    birthDate?: string;
    gender?: "female" | "male";
    workStatus?: "working" | "full_time_caregiver" | null;
  }) => request<MeResponse>("/me/parent", { method: "PATCH", json: body }),
  updateInterests: (interests: ApiInterestId[]) =>
    request<MeResponse>("/me/interests", {
      method: "PATCH",
      json: { interests },
    }),
  upsertNotificationPreference: (
    type: NotificationPreferenceType,
    body: { enabled: boolean; time?: string },
  ) =>
    request<NotificationPreferenceRow>(`/me/notifications/${type}`, {
      method: "PATCH",
      json: body,
    }),
  deleteAccount: (reason?: string) =>
    request<void>("/me", { method: "DELETE", json: { reason } }),
  // [임시] 온보딩 재진입 — 회원 정보 초기화 (User row 삭제, cascade)
  resetOnboarding: () =>
    request<void>("/me/reset-onboarding", { method: "POST" }),
  addChild: (body: {
    name: string;
    birthDate: string;
    gender: "female" | "male";
    notes?: string | null;
  }) => request<unknown>("/children", { method: "POST", json: body }),
  updateChild: (
    id: string,
    body: {
      name?: string;
      birthDate?: string;
      gender?: "female" | "male";
      notes?: string | null;
    },
  ) => request<unknown>(`/children/${id}`, { method: "PATCH", json: body }),
  deleteChild: (id: string) =>
    request<void>(`/children/${id}`, { method: "DELETE" }),
};
