import createClient from "openapi-fetch";
import type { paths } from "./generated/api-types";
import { getDemoHomeDashboard, type HomeDashboard } from "./home-data";
import {
  getDemoCurrentMission,
  getDemoMissionEffect,
  type CurrentMissionResponse,
  type MissionExecutionEffect,
  type MissionFeedbackDraft,
  type MissionExecutionSnapshot,
} from "./mission-data";
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

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const openApiClient = createClient<paths>({ baseUrl: BASE_URL });
const DEMO_MISSION_STORAGE_KEY = "mission:demo-snapshot";
const DEMO_MISSION_EFFECT_STORAGE_KEY = "mission:demo-effect";
const MISSION_FEEDBACK_DRAFT_STORAGE_KEY = "mission-feedback-draft";

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
  source: "api" | "demo";
  message?: string;
};

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
  source: "api" | "demo";
  message?: string;
};

export type MissionEffectLoadState = {
  data: MissionExecutionEffect;
  source: "api" | "demo";
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
  return (await res.json()) as T;
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
    return {
      data: getDemoHomeDashboard(),
      source: "demo",
      message: "로그인 세션이 연결되면 실제 홈 데이터를 표시합니다.",
    };
  }

  try {
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

    return {
      data,
      source: "api",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? `API 응답을 가져오지 못해 샘플 데이터를 표시합니다. (${error.status})`
        : "API 서버에 연결할 수 없어 샘플 데이터를 표시합니다.";

    return {
      data: getDemoHomeDashboard(),
      source: "demo",
      message,
    };
  }
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
    return {
      data: getDemoCurrentMission(),
      source: "demo",
      message: "로그인 세션이 연결되면 실제 미션 데이터를 표시합니다.",
    };
  }

  try {
    const query = childId ? `?childId=${encodeURIComponent(childId)}` : "";
    const data = await request<CurrentMissionResponse>(
      `/missions/current${query}`,
      {
        method: "GET",
        headers,
      },
    );

    return {
      data,
      source: "api",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? `API 응답을 가져오지 못해 샘플 미션을 표시합니다. (${error.status})`
        : "API 서버에 연결할 수 없어 샘플 미션을 표시합니다.";

    return {
      data: getDemoCurrentMission(),
      source: "demo",
      message,
    };
  }
};

export const startMissionExecution = async ({
  childId,
  missionId,
  durationMinutes,
}: {
  childId: string;
  missionId: string;
  durationMinutes: number;
}): Promise<{
  execution: MissionExecutionSnapshot;
  source: "api" | "demo";
}> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    const execution = createDemoMissionExecution({
      childId,
      missionId,
      durationMinutes,
    });
    persistDemoMissionExecution(execution);
    return { execution, source: "demo" };
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
  executionId,
  mode,
}: {
  childId?: string | null;
  executionId?: string | null;
  mode?: "api" | "demo" | null;
}): Promise<{
  execution: MissionExecutionSnapshot | null;
  source: "api" | "demo";
}> => {
  if (mode === "demo") {
    return {
      execution: readDemoMissionExecution(executionId),
      source: "demo",
    };
  }

  const headers = await authHeaders();
  if (!headers.Authorization) {
    return {
      execution: readDemoMissionExecution(executionId),
      source: "demo",
    };
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
  mode,
}: {
  executionId: string;
  action: MissionExecutionAction;
  mode?: "api" | "demo" | null;
}): Promise<{
  execution: MissionExecutionSnapshot | null;
  source: "api" | "demo";
}> => {
  if (mode === "demo") {
    const execution = applyDemoMissionAction(executionId, action);
    return { execution, source: "demo" };
  }

  const headers = await authHeaders();
  if (!headers.Authorization) {
    const execution = applyDemoMissionAction(executionId, action);
    return { execution, source: "demo" };
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
  mode,
}: {
  executionId: string;
  mode?: "api" | "demo" | null;
}): Promise<MissionEffectLoadState> => {
  if (mode === "demo") {
    return {
      data: readDemoMissionEffect(executionId) ?? getDemoMissionEffect(),
      source: "demo",
    };
  }

  const headers = await authHeaders();
  if (!headers.Authorization) {
    return {
      data: readDemoMissionEffect(executionId) ?? getDemoMissionEffect(),
      source: "demo",
      message: "로그인 세션이 연결되면 실제 미션 효과 데이터를 표시합니다.",
    };
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
  mode,
}: {
  executionId: string;
  draft: MissionFeedbackDraft;
  mode?: "api" | "demo" | null;
}) => {
  if (mode === "demo") {
    clearMissionFeedbackDraft(executionId);
    return {
      feedback: {
        id: `demo-feedback-${executionId}`,
        executionId,
        childReaction: draft.childReaction ?? 3,
        parentEnergy: draft.parentEnergy ?? 5,
        missionSatisfaction: draft.missionSatisfaction ?? 3,
        note: draft.note || null,
        keywords: normalizeDraftKeywords(draft.note),
        createdAt: new Date().toISOString(),
      },
      source: "demo" as const,
    };
  }

  const headers = await authHeaders();
  if (!headers.Authorization) {
    clearMissionFeedbackDraft(executionId);
    return {
      feedback: {
        id: `demo-feedback-${executionId}`,
        executionId,
        childReaction: draft.childReaction ?? 3,
        parentEnergy: draft.parentEnergy ?? 5,
        missionSatisfaction: draft.missionSatisfaction ?? 3,
        note: draft.note || null,
        keywords: normalizeDraftKeywords(draft.note),
        createdAt: new Date().toISOString(),
      },
      source: "demo" as const,
    };
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

function createDemoMissionExecution({
  childId,
  missionId,
  durationMinutes,
}: {
  childId: string;
  missionId: string;
  durationMinutes: number;
}): MissionExecutionSnapshot {
  const now = new Date();

  return {
    id: `demo-execution-${missionId}`,
    missionId,
    childId,
    status: "in_progress",
    startedAt: now.toISOString(),
    activeSegmentStartedAt: now.toISOString(),
    pausedAt: null,
    durationMinutes,
    elapsedSeconds: 0,
    remainingSeconds: durationMinutes * 60,
    serverNow: now.toISOString(),
  };
}

function readDemoMissionExecution(executionId?: string | null) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(DEMO_MISSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as MissionExecutionSnapshot;
    if (executionId && parsed.id !== executionId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistDemoMissionExecution(
  execution: MissionExecutionSnapshot | null,
) {
  if (typeof window === "undefined") {
    return;
  }

  if (!execution) {
    window.sessionStorage.removeItem(DEMO_MISSION_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(
    DEMO_MISSION_STORAGE_KEY,
    JSON.stringify(execution),
  );
}

function readDemoMissionEffect(executionId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(DEMO_MISSION_EFFECT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as MissionExecutionEffect;
    return parsed.execution.id === executionId ? parsed : null;
  } catch {
    return null;
  }
}

function persistDemoMissionEffect(effect: MissionExecutionEffect | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!effect) {
    window.sessionStorage.removeItem(DEMO_MISSION_EFFECT_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(
    DEMO_MISSION_EFFECT_STORAGE_KEY,
    JSON.stringify(effect),
  );
}

function applyDemoMissionAction(
  executionId: string,
  action: MissionExecutionAction,
) {
  const current = readDemoMissionExecution(executionId);
  if (!current) {
    return null;
  }

  const now = new Date();
  const totalSeconds = current.durationMinutes * 60;
  const elapsedSeconds = getDemoElapsedSeconds(current, now);

  if (action === "pause") {
    const next = {
      ...current,
      status: "paused" as const,
      activeSegmentStartedAt: null,
      pausedAt: now.toISOString(),
      elapsedSeconds,
      remainingSeconds: Math.max(0, totalSeconds - elapsedSeconds),
      serverNow: now.toISOString(),
    };
    persistDemoMissionExecution(next);
    return next;
  }

  if (action === "resume") {
    const next = {
      ...current,
      status: "in_progress" as const,
      activeSegmentStartedAt: now.toISOString(),
      pausedAt: null,
      serverNow: now.toISOString(),
    };
    persistDemoMissionExecution(next);
    return next;
  }

  persistDemoMissionEffect({
    execution: {
      id: current.id,
      status: action === "early_complete" ? "early_completed" : "completed",
      completedAt: now.toISOString(),
      actualDurationSeconds:
        action === "early_complete" ? elapsedSeconds : totalSeconds,
      wasEarlyCompleted: action === "early_complete",
    },
    mission: getDemoMissionEffect().mission,
  });
  persistDemoMissionExecution(null);
  return null;
}

function getDemoElapsedSeconds(execution: MissionExecutionSnapshot, now: Date) {
  if (execution.status !== "in_progress" || !execution.activeSegmentStartedAt) {
    return execution.elapsedSeconds;
  }

  const segmentElapsedSeconds = Math.max(
    0,
    Math.floor(
      (now.getTime() - new Date(execution.activeSegmentStartedAt).getTime()) /
        1000,
    ),
  );

  return execution.elapsedSeconds + segmentElapsedSeconds;
}

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

  window.sessionStorage.removeItem(getMissionFeedbackDraftStorageKey(executionId));
}

function normalizeDraftKeywords(note: string) {
  return note
    .split(/[\n,\s]+/u)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 10);
}
