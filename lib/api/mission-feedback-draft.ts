import type { MissionFeedbackDraft } from "../mission-data";

const MISSION_FEEDBACK_DRAFT_STORAGE_KEY = "mission-feedback-draft";

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

export function normalizeDraftKeywords(note: string) {
  return note
    .split(/[\n,\s]+/u)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 10);
}
