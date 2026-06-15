import { cn } from "@/lib/utils";
import type { MoodLevel } from "./types";

// 기분 레벨별 아이콘.
// mood PNG는 "밝은 배경 + 네이비 얼굴"이라 그라데이션 위에 합성하면 표정이 흐려졌다.
// 디자인상 동일한(그라데이션 배경 + 또렷한 표정이 벡터로 baked) 놀이 피드백 아이콘으로 통일.
// 색 매핑 — Figma "Feeling Character Reference"(2539:5278):
//   L1 라이트블루 · L2 블루 · L3 옐로우 · L4 연두 · L5 핑크.
const MOOD_FACE_SRC: Record<MoodLevel, string> = {
  1: "/icons/figma/mission-feedback/very-bad.svg",
  2: "/icons/figma/mission-feedback/bad.svg",
  3: "/icons/figma/mission-feedback/good.svg",
  4: "/icons/figma/mission-feedback/neutral.svg",
  5: "/icons/figma/mission-feedback/very-good.svg",
};

export const MoodFace = ({
  level,
  className,
  muted = false,
}: {
  level: MoodLevel;
  className?: string;
  /** 선택 모달에서 미선택 항목을 회색(grayscale)으로 표시 — 선택 시 원래 컬러 복원 */
  muted?: boolean;
}) => (
  <img
    src={MOOD_FACE_SRC[level]}
    alt=""
    aria-hidden
    className={cn(
      "shrink-0 rounded-full transition",
      muted && "grayscale",
      className,
    )}
  />
);
