import { ApiError, authHeaders, request } from "./client";
import { clearStoredSelectedChildId } from "./storage";
import type {
  MissionEffectLoadState,
  MissionExecutionAction,
  MissionLoadState,
} from "./types";
import {
  applyDemoMissionAction,
  createDemoMissionExecution,
  persistDemoMissionExecution,
  readDemoMissionEffect,
  readDemoMissionExecution,
} from "./mission-demo";
import {
  clearMissionFeedbackDraft,
  normalizeDraftKeywords,
} from "./mission-feedback-draft";
import {
  getDemoCurrentMission,
  getDemoMissionEffect,
  type CurrentMissionResponse,
  type MissionExecutionEffect,
  type MissionFeedbackDraft,
  type MissionExecutionSnapshot,
} from "../mission-data";

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
    // 저장된 자녀 id가 더 이상 유효하지 않으면(삭제됐거나 과거 잔재) 404가 난다.
    // home과 동일하게 저장값을 비우고 기본 자녀로 1회 재시도해 자가 치유한다.
    // (재시도는 childId=null이라 이 분기로 다시 들어오지 않는다.)
    if (
      childId &&
      error instanceof ApiError &&
      error.status === 404 &&
      (error.body as { code?: string } | null)?.code === "CHILD_NOT_FOUND"
    ) {
      clearStoredSelectedChildId();
      return loadCurrentMission(null);
    }

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

// 오늘의 미션 다시 하기 — 오늘(서울) 해당 아이의 실행 기록 삭제 후 처음부터 재진행.
export const resetTodayMission = async ({
  childId,
}: {
  childId: string;
}): Promise<{ deletedCount: number }> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    return { deletedCount: 0 };
  }

  return request<{ deletedCount: number }>("/mission-executions/reset", {
    method: "POST",
    headers,
    json: { childId },
  });
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
