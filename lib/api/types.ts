import type { HomeDashboard } from "../home-data";
import type {
  CurrentMissionResponse,
  MissionExecutionEffect,
} from "../mission-data";
import type { RoadmapResponse } from "../roadmap-data";
import type { ChatResponse } from "../chat-data";
import type { WeeklyReportViewData } from "../weekly-report-data";

export type HomeLoadState = {
  data: HomeDashboard;
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

export type HomeMoodCheck = {
  level: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  checkedAt: string;
};

export type RoadmapLoadState = {
  data: RoadmapResponse;
  source: "api" | "demo";
  message?: string;
};

export type ChatLoadState = {
  data: ChatResponse;
  source: "api" | "empty";
  message?: string;
};

export type MissionExecutionAction =
  | "pause"
  | "resume"
  | "complete"
  | "early_complete";
