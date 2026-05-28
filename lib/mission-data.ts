export type MissionSelectedChild = {
  id: string;
  name: string;
  ageLabel: string;
};

export type CurrentMissionDetail = {
  id: string;
  subThemeLabel: string | null;
  title: string;
  description: string;
  durationMinutes: number;
  durationLabel: string;
  categoryLabel: string;
  sourceLabel: string;
  status: "not_started" | "in_progress" | "completed";
};

export type ActiveMissionExecution = {
  id: string;
  status: "in_progress" | "paused";
  startedAt: string;
  activeSegmentStartedAt: string | null;
  pausedAt: string | null;
  durationMinutes: number;
  elapsedSeconds: number;
  remainingSeconds: number;
};

export type CurrentMissionResponse = {
  selectedChild: MissionSelectedChild;
  mission: CurrentMissionDetail;
  activeExecution: ActiveMissionExecution | null;
};

export type MissionExecutionSnapshot = {
  id: string;
  missionId: string;
  childId: string;
  status: "in_progress" | "paused";
  startedAt: string;
  activeSegmentStartedAt: string | null;
  pausedAt: string | null;
  durationMinutes: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  serverNow: string;
};

export type MissionExecutionEffect = {
  execution: {
    id: string;
    status: "completed" | "early_completed";
    completedAt: string;
    actualDurationSeconds: number;
    wasEarlyCompleted: boolean;
  };
  mission: {
    id: string;
    title: string;
    effect: string;
    goal: string | null;
    subThemeLabel: string | null;
  };
};

export type MissionFeedbackDraft = {
  childReaction: number | null;
  parentEnergy: number | null;
  missionSatisfaction: number | null;
  note: string;
};
