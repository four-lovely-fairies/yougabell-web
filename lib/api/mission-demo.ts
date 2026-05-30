import type { MissionExecutionAction } from "./types";
import {
  getDemoMissionEffect,
  type MissionExecutionEffect,
  type MissionExecutionSnapshot,
} from "../mission-data";

const DEMO_MISSION_STORAGE_KEY = "mission:demo-snapshot";
const DEMO_MISSION_EFFECT_STORAGE_KEY = "mission:demo-effect";

export function createDemoMissionExecution({
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

export function readDemoMissionExecution(executionId?: string | null) {
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

export function persistDemoMissionExecution(
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

export function readDemoMissionEffect(executionId: string) {
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

export function persistDemoMissionEffect(
  effect: MissionExecutionEffect | null,
) {
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

export function applyDemoMissionAction(
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
