export type Modal =
  | "children"
  | "notifications"
  | "mood"
  | "restart-mission"
  | null;
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export const MOOD_OPTION_LABELS: Record<MoodLevel, string> = {
  1: "나빠요",
  2: "별로에요",
  3: "보통이에요",
  4: "좋아요!",
  5: "최고에요!",
};
