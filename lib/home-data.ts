export type WeekdayLabel = "월" | "화" | "수" | "목" | "금" | "토" | "일";

export type HomeChild = {
  id: string;
  name: string;
  birthDate: string;
  ageLabel: string;
  displayOrder: number;
};

export type HomeNotification = {
  id: string;
  title: string;
  body: string;
  actionType:
    | "none"
    | "open_home"
    | "open_mission"
    | "open_roadmap"
    | "open_chat"
    | "open_report"
    | "url";
  targetType:
    | "mission"
    | "mission_execution"
    | "weekly_report"
    | "child"
    | "chat_session"
    | "url"
    | null;
  targetId: string | null;
  targetUrl: string | null;
  createdAt: string;
  readAt: string | null;
};

export type HomeDashboard = {
  selectedChild: HomeChild;
  children: HomeChild[];
  week: {
    monthLabel: string;
    weekOfMonthLabel: string;
    days: Array<{
      date: string;
      weekdayLabel: WeekdayLabel;
      dayOfMonth: number;
      isToday: boolean;
      mood?: {
        level: 1 | 2 | 3 | 4 | 5;
        emoji: string;
      };
      missionCompleted?: boolean;
    }>;
  };
  recommendedMission: {
    id: string;
    subThemeLabel: string;
    title: string;
    durationMinutes: number;
    status: "not_started" | "in_progress" | "completed";
  } | null;
  growthStage: {
    id: string;
    name: string;
    summary: string;
  } | null;
  reportSummary: {
    monthTogetherDaysPercent: number;
    completedDays: number;
    elapsedDays: number;
    label: string;
  } | null;
  notifications: {
    unreadCount: number;
    latest: HomeNotification[];
  };
};

export const getDemoHomeDashboard = (): HomeDashboard => ({
  selectedChild: {
    id: "demo-child-youse",
    name: "김유스",
    birthDate: "2023-04-20",
    ageLabel: "만3세",
    displayOrder: 0,
  },
  children: [
    {
      id: "demo-child-youse",
      name: "김유스",
      birthDate: "2023-04-20",
      ageLabel: "만3세",
      displayOrder: 0,
    },
    {
      id: "demo-child-earth",
      name: "김어스",
      birthDate: "2024-02-11",
      ageLabel: "만2세",
      displayOrder: 1,
    },
  ],
  week: {
    monthLabel: "5월",
    weekOfMonthLabel: "2주차",
    days: [
      {
        date: "2026-05-11",
        weekdayLabel: "월",
        dayOfMonth: 11,
        isToday: false,
        mood: { level: 5, emoji: "🥰" },
        missionCompleted: true,
      },
      {
        date: "2026-05-12",
        weekdayLabel: "화",
        dayOfMonth: 12,
        isToday: true,
        mood: { level: 2, emoji: "😕" },
        missionCompleted: false,
      },
      {
        date: "2026-05-13",
        weekdayLabel: "수",
        dayOfMonth: 13,
        isToday: false,
      },
      {
        date: "2026-05-14",
        weekdayLabel: "목",
        dayOfMonth: 14,
        isToday: false,
      },
      {
        date: "2026-05-15",
        weekdayLabel: "금",
        dayOfMonth: 15,
        isToday: false,
      },
      {
        date: "2026-05-16",
        weekdayLabel: "토",
        dayOfMonth: 16,
        isToday: false,
      },
      {
        date: "2026-05-17",
        weekdayLabel: "일",
        dayOfMonth: 17,
        isToday: false,
      },
    ],
  },
  recommendedMission: {
    id: "demo-mission",
    subThemeLabel: "아이 10분 가까워지기",
    title: "아이와 눈을 마주치며 이야기를 해보아요",
    durationMinutes: 10,
    status: "not_started",
  },
  growthStage: {
    id: "self-formation",
    name: "자아 형성기",
    summary:
      "아이의 독립심이 싹트고 있어요. 스스로 선택할 기회를 조금씩 넓혀주세요.",
  },
  reportSummary: {
    monthTogetherDaysPercent: 84,
    completedDays: 10,
    elapsedDays: 12,
    label: "이번 달 함께한 날",
  },
  notifications: {
    unreadCount: 2,
    latest: [
      {
        id: "demo-notification-1",
        title: "오늘의 10분 미션",
        body: "퇴근 후 아이와 눈 맞춤 시간을 가져보세요.",
        actionType: "open_mission",
        targetType: "mission",
        targetId: "demo-mission",
        targetUrl: null,
        createdAt: new Date("2026-05-12T09:00:00+09:00").toISOString(),
        readAt: null,
      },
      {
        id: "demo-notification-2",
        title: "이번 주 리포트 준비 중",
        body: "기록이 쌓이면 함께한 날을 더 정확히 보여드릴게요.",
        actionType: "open_report",
        targetType: "weekly_report",
        targetId: "demo-report",
        targetUrl: null,
        createdAt: new Date("2026-05-11T20:00:00+09:00").toISOString(),
        readAt: null,
      },
    ],
  },
});
