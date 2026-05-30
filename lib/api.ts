import createClient from "openapi-fetch";
import type { paths } from "./generated/api-types";
import type { HomeDashboard } from "./home-data";
import {
  type CurrentMissionResponse,
  type MissionExecutionEffect,
  type MissionFeedbackDraft,
  type MissionExecutionSnapshot,
} from "./mission-data";
import type { components } from "./generated/api-types";
import type { RoadmapResponse } from "./roadmap-data";
import {
  EMPTY_CHAT_RESPONSE,
  type ChatResponse,
  type ChatStreamEvent,
} from "./chat-data";
import { createSupabaseBrowserClient } from "./supabase/client";
import type {
  ApiInterestId,
  CompleteOnboardingPayload,
  MeResponse,
  NotificationPreferenceRow,
  NotificationPreferenceType,
} from "./types";
import type {
  WeeklyReportCurrent,
  WeeklyReportDetail,
  WeeklyReportViewData,
} from "./weekly-report-data";

const BASE_URL = getRequiredPublicApiBaseUrl();
const openApiClient = createClient<paths>({ baseUrl: BASE_URL });
const MISSION_FEEDBACK_DRAFT_STORAGE_KEY = "mission-feedback-draft";

function getRequiredPublicApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!value) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required.");
  }
  return value;
}

/**
 * Supabase 브라우저 세션에서 access_token을 꺼내 Authorization 헤더 구성.
 * 서버 컴포넌트/SSR에서는 호출하지 말 것 — 별도 server helper가 필요.
 */
async function authHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type HomeLoadState = {
  data: HomeDashboard;
  source: "api";
};

export type NotificationListItem =
  components["schemas"]["NotificationListItemDto"];

export type WeeklyReportLoadState =
  | {
      data: WeeklyReportViewData;
      error: null;
    }
  | {
      data: null;
      error: {
        status: number | null;
        message: string;
      };
    };

export type MissionLoadState = {
  data: CurrentMissionResponse;
  source: "api";
};

export type MissionEffectLoadState = {
  data: MissionExecutionEffect;
  source: "api";
};

export type HomeMoodCheck = {
  level: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  checkedAt: string;
};

export type RoadmapLoadState = {
  data: RoadmapResponse;
  source: "api";
};

export type ChatLoadState = {
  data: ChatResponse;
  source: "api" | "empty";
  message?: string;
};

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const auth = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...auth,
      ...(headers as Record<string, string> | undefined),
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`API ${status}`);
  }
}

type MissionExecutionAction =
  | "pause"
  | "resume"
  | "complete"
  | "early_complete";

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

export const loadHomeDashboard = async (
  childId?: string | null,
): Promise<HomeLoadState> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  const { data, error, response } = await openApiClient.GET("/home", {
    params: {
      query: {
        childId: childId ?? undefined,
      },
    },
    headers,
  });
  const status = response.status;

  if (error) {
    throw new ApiError(status, error);
  }
  if (!data) {
    throw new ApiError(status, {});
  }

  return { data, source: "api" };
};

export const submitHomeMoodCheck = async (
  level: 1 | 2 | 3 | 4 | 5,
): Promise<HomeMoodCheck> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 연결되어야 오늘의 기분을 기록할 수 있습니다.",
    });
  }

  return request<HomeMoodCheck>("/home/mood", {
    method: "POST",
    headers,
    json: { level },
  });
};

export const markNotificationRead = async (
  notificationId: string,
): Promise<NotificationListItem> => {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  return request<NotificationListItem>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers,
  });
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

export const loadChat = async (): Promise<ChatLoadState> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    return {
      data: EMPTY_CHAT_RESPONSE,
      source: "empty",
      message: "로그인 세션이 연결되면 이전 대화를 불러옵니다.",
    };
  }

  try {
    const { data, error, response } = await openApiClient.GET("/me/chat", {
      headers,
    });
    if (error || !data) {
      throw new ApiError((response as Response).status, error ?? {});
    }
    return { data, source: "api" };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? `이전 대화를 불러오지 못했어요. (${error.status})`
        : "대화 서버에 연결할 수 없어요.";
    return {
      data: EMPTY_CHAT_RESPONSE,
      source: "empty",
      message,
    };
  }
};

/**
 * SSE 스트리밍 — POST /me/chat/messages/stream.
 * EventSource는 GET만 지원하므로 fetch + ReadableStream 직접 파싱.
 * 콜백으로 token/done/error를 흘려보낸다.
 */
export const streamChatMessage = async (
  content: string,
  callbacks: {
    onToken: (text: string) => void;
    onDone: (event: Extract<ChatStreamEvent, { type: "done" }>["data"]) => void;
    onError: (message: string, status: number | null) => void;
  },
  signal?: AbortSignal,
): Promise<void> => {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    callbacks.onError("로그인 세션이 연결되어야 메시지를 보낼 수 있어요.", 401);
    return;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/me/chat/messages/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...headers,
      },
      body: JSON.stringify({ content }),
      signal,
    });
  } catch {
    callbacks.onError("대화 서버에 연결할 수 없어요.", null);
    return;
  }

  if (!response.ok || !response.body) {
    callbacks.onError(
      `메시지 전송에 실패했어요. (${response.status})`,
      response.status,
    );
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE 이벤트는 \n\n로 구분
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const raw of events) {
        const parsed = parseSseEvent(raw);
        if (!parsed) continue;
        if (parsed.type === "token") {
          callbacks.onToken((parsed.data as { text: string }).text);
        } else if (parsed.type === "done") {
          callbacks.onDone(
            parsed.data as Extract<ChatStreamEvent, { type: "done" }>["data"],
          );
        } else if (parsed.type === "error") {
          callbacks.onError(
            (parsed.data as { message: string }).message,
            response.status,
          );
        }
      }
    }
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") return;
    callbacks.onError("스트림이 끊겼어요. 다시 시도해 주세요.", null);
  }
};

function parseSseEvent(raw: string): { type: string; data: unknown } | null {
  let type = "message";
  let data = "";
  for (const line of raw.split("\n")) {
    if (line.startsWith("event: ")) {
      type = line.slice(7).trim();
    } else if (line.startsWith("data: ")) {
      // 동일 이벤트에 data 라인이 여러 개일 수도 있으나 우리 서버는 한 줄.
      data = line.slice(6);
    }
  }
  if (!data) return null;
  try {
    return { type, data: JSON.parse(data) };
  } catch {
    return null;
  }
}

export const deleteChat = async (): Promise<{ ok: boolean }> => {
  const headers = await authHeaders();
  if (!headers.Authorization) return { ok: false };
  try {
    const { response } = await openApiClient.DELETE("/me/chat", { headers });
    return { ok: response.ok };
  } catch {
    return { ok: false };
  }
};

export const loadRoadmap = async ({
  childId,
  targetMonth,
}: {
  childId?: string | null;
  targetMonth?: number | null;
} = {}): Promise<RoadmapLoadState> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  const { data, error, response } = await openApiClient.GET("/me/roadmap", {
    params: {
      query: {
        childId: childId ?? undefined,
        targetMonth: targetMonth ?? undefined,
      },
    },
    headers,
  });
  const status = response.status;

  if (error) {
    throw new ApiError(status, error);
  }
  if (!data) {
    throw new ApiError(status, {});
  }

  return { data, source: "api" };
};

export const loadWeeklyReport = async ({
  childId,
  reportId,
}: {
  childId?: string | null;
  reportId?: string | null;
} = {}): Promise<WeeklyReportLoadState> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    return {
      data: null,
      error: {
        status: 401,
        message: "로그인 세션이 연결되어야 주간 리포트를 불러올 수 있습니다.",
      },
    };
  }

  try {
    if (reportId) {
      const { data, error, response } = await openApiClient.GET(
        "/weekly-reports/{id}",
        {
          params: { path: { id: reportId } },
          headers,
        },
      );
      if (error || !data) {
        throw new ApiError((response as Response).status, error ?? {});
      }
      return {
        data: toWeeklyReportViewData(data),
        error: null,
      };
    }

    const { data, error, response } = await openApiClient.GET(
      "/weekly-reports/current",
      {
        params: {
          query: {
            childId: childId ?? undefined,
          },
        },
        headers,
      },
    );
    if (error || !data) {
      throw new ApiError((response as Response).status, error ?? {});
    }
    return {
      data: toWeeklyReportViewData(data),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        status: error instanceof ApiError ? error.status : null,
        message:
          error instanceof ApiError
            ? "주간 리포트를 불러오지 못했습니다."
            : "API 서버에 연결할 수 없습니다.",
      },
    };
  }
};

export const loadCurrentMission = async (
  childId?: string | null,
): Promise<MissionLoadState> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  const query = childId ? `?childId=${encodeURIComponent(childId)}` : "";
  const data = await request<CurrentMissionResponse>(
    `/missions/current${query}`,
    {
      method: "GET",
      headers,
    },
  );

  return { data, source: "api" };
};

export const startMissionExecution = async ({
  childId,
  missionId,
}: {
  childId: string;
  missionId: string;
}): Promise<{
  execution: MissionExecutionSnapshot;
  source: "api";
}> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  const data = await request<{ execution: MissionExecutionSnapshot }>(
    "/mission-executions",
    {
      method: "POST",
      headers,
      json: { childId, missionId },
    },
  );

  return { execution: data.execution, source: "api" };
};

export const loadMissionExecution = async ({
  childId,
}: {
  childId?: string | null;
  executionId?: string | null;
}): Promise<{
  execution: MissionExecutionSnapshot | null;
  source: "api";
}> => {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  const query = childId ? `?childId=${encodeURIComponent(childId)}` : "";
  const data = await request<{ execution: MissionExecutionSnapshot | null }>(
    `/mission-executions/active${query}`,
    {
      method: "GET",
      headers,
    },
  );

  return { execution: data.execution, source: "api" };
};

export const applyMissionExecutionAction = async ({
  executionId,
  action,
}: {
  executionId: string;
  action: MissionExecutionAction;
}): Promise<{
  execution: MissionExecutionSnapshot | null;
  source: "api";
}> => {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  const data = await request<{ execution: MissionExecutionSnapshot | null }>(
    `/mission-executions/${executionId}/action`,
    {
      method: "POST",
      headers,
      json: { action },
    },
  );

  return { execution: data.execution, source: "api" };
};

export const loadMissionExecutionEffect = async ({
  executionId,
}: {
  executionId: string;
}): Promise<MissionEffectLoadState> => {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  const data = await request<MissionExecutionEffect>(
    `/mission-executions/${executionId}/effect`,
    {
      method: "GET",
      headers,
    },
  );

  return { data, source: "api" };
};

export const submitMissionFeedback = async ({
  executionId,
  draft,
}: {
  executionId: string;
  draft: MissionFeedbackDraft;
}) => {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 필요합니다.",
    });
  }

  const data = await request<{
    feedback: {
      id: string;
      executionId: string;
      childReaction: number;
      parentEnergy: number;
      missionSatisfaction: number;
      note: string | null;
      keywords: string[];
      createdAt: string;
    };
  }>(`/mission-executions/${executionId}/feedback`, {
    method: "PUT",
    headers,
    json: {
      childReaction: draft.childReaction,
      parentEnergy: draft.parentEnergy,
      missionSatisfaction: draft.missionSatisfaction,
      note: draft.note || null,
    },
  });

  clearMissionFeedbackDraft(executionId);
  return { ...data, source: "api" as const };
};

function toWeeklyReportViewData(
  data: WeeklyReportCurrent | WeeklyReportDetail,
): WeeklyReportViewData {
  if ("selectedChild" in data) {
    return data;
  }

  return {
    selectedChild: null,
    report: data,
    emptyState: null,
  };
}

export const getStoredSelectedChildId = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("home:selected-child-id");
};

export const setStoredSelectedChildId = (childId: string) => {
  window.localStorage.setItem("home:selected-child-id", childId);
};

export const clearStoredSelectedChildId = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem("home:selected-child-id");
};

export function getMissionFeedbackDraftStorageKey(executionId: string) {
  return `${MISSION_FEEDBACK_DRAFT_STORAGE_KEY}:${executionId}`;
}

export function readMissionFeedbackDraft(
  executionId: string,
): MissionFeedbackDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(
    getMissionFeedbackDraftStorageKey(executionId),
  );
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MissionFeedbackDraft;
  } catch {
    return null;
  }
}

export function persistMissionFeedbackDraft(
  executionId: string,
  draft: MissionFeedbackDraft,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    getMissionFeedbackDraftStorageKey(executionId),
    JSON.stringify(draft),
  );
}

export function clearMissionFeedbackDraft(executionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(
    getMissionFeedbackDraftStorageKey(executionId),
  );
}
