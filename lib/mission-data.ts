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

export const getDemoCurrentMission = (): CurrentMissionResponse => ({
  selectedChild: {
    id: "demo-child-youse",
    name: "김유스",
    ageLabel: "만3세",
  },
  mission: {
    id: "demo-mission",
    subThemeLabel: "아이와 10분 가까워지기",
    title: "짝짜꿍 노래 게임",
    description:
      '아이와 마주 앉아 "짝짜꿍" 노래를 부르며 손뼉을 마주치는 게임을 3회 반복한다. 아이가 먼저 손을 내밀면 반응을 크게 해준다.',
    durationMinutes: 10,
    durationLabel: "10분",
    categoryLabel: "언어발달",
    sourceLabel: "CDC",
    status: "not_started",
  },
  activeExecution: null,
});

export const getDemoMissionEffect = (): MissionExecutionEffect => ({
  execution: {
    id: "demo-execution-demo-mission",
    status: "completed",
    completedAt: new Date().toISOString(),
    actualDurationSeconds: 600,
    wasEarlyCompleted: false,
  },
  mission: {
    id: "demo-mission",
    title: "짝짜꿍 노래 게임",
    effect:
      "아이와 손을 맞추고 눈을 마주치는 반복이 아이의 정서적 안정감과 상호작용 집중력을 높여줘요.",
    goal: "또래와 함께 놀이하는 초기 사회성",
    subThemeLabel: "아이와 10분 가까워지기",
  },
});
