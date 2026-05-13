import type { components } from "./generated/api-types";

export type WeeklyReportCurrent =
  components["schemas"]["WeeklyReportCurrentResponseDto"];
export type WeeklyReportDetail = components["schemas"]["WeeklyReportDetailDto"];
export type WeeklyReportEmptyState =
  components["schemas"]["WeeklyReportEmptyStateDto"];
export type WeeklyReportSelectedChild =
  components["schemas"]["WeeklyReportSelectedChildDto"];

export type WeeklyReportViewData = {
  selectedChild: WeeklyReportSelectedChild | null;
  report: WeeklyReportDetail | null;
  emptyState: WeeklyReportEmptyState | null;
};

export type DurationSegment = {
  value: string;
  unit: string;
};

export function splitDurationLabel(label: string): DurationSegment[] {
  const matches = [...label.matchAll(/(\d+)\s*([^\d\s]+)/g)];
  return matches.map((match) => ({
    value: match[1],
    unit: match[2],
  }));
}

export const getDemoWeeklyReportCurrent = (): WeeklyReportCurrent => ({
  selectedChild: {
    id: "demo-child-youse",
    name: "김유스",
    ageLabel: "만3세",
  },
  report: {
    id: "demo-weekly-report",
    weekStart: "2026-05-04",
    weekEnd: "2026-05-10",
    generatedAt: new Date("2026-05-11T00:05:00+09:00").toISOString(),
    headline: {
      question: "나는 잘하고 있는가?",
      title: "지금 충분히 잘하고 계십니다.",
      body: "워킹맘으로서의 열정적인 모습은 아이에게 자신의 일을 사랑하는 멋진 롤모델이 되어줄 거예요. 오늘 아이와 짧더라도 눈을 맞추고 웃으셨다면, 그것만으로도 아이의 정서적 주머니는 가득 채워졌습니다.",
    },
    missionSummary: {
      days: [
        { weekday: "mon", label: "월", completedCount: 1, completed: true },
        { weekday: "tue", label: "화", completedCount: 0, completed: false },
        { weekday: "wed", label: "수", completedCount: 0, completed: false },
        { weekday: "thu", label: "목", completedCount: 0, completed: false },
        { weekday: "fri", label: "금", completedCount: 0, completed: false },
        { weekday: "sat", label: "토", completedCount: 0, completed: false },
        { weekday: "sun", label: "일", completedCount: 0, completed: false },
      ],
      totalDurationSeconds: 4620,
      totalDurationLabel: "1시간 17분",
      childPositiveReactionRate: 92,
    },
    topKeywords: [
      { rank: 1, keyword: "공룡" },
      { rank: 2, keyword: "우주" },
      { rank: 3, keyword: "아이스크림" },
    ],
    keywordEmptyState: null,
    bestMoments: [
      {
        id: "demo-moment-1",
        order: 1,
        label: "순수한 기쁨",
        title: "10분 눈마주치면서 웃기",
        body: "가장 깊은 대화는 입술이 아니라, 서로의 존재가 맞닿는 고요함 속에서 이루어진다.",
      },
    ],
    innerState: {
      psychologicalEnergy: 75,
      tipTitle: "기분 전환을 위한 팁",
    },
    aiActionSuggestion: {
      title: "미래 행동 제안 (AI 기반)",
      body: "내일 아침 5분 등굣길 대화 주제: 오늘 학교 가는 길에 갑자기 마법이 일어나서, 가방이 풍선처럼 가벼워진다면 어디로 날아가 보고 싶어?",
    },
  },
  emptyState: null,
});
