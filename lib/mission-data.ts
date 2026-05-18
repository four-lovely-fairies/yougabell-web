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
  },
  activeExecution: null,
});
