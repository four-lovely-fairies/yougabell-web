import { cn } from "@/lib/utils";
import { moodIconPath } from "./helpers";
import type { MoodLevel } from "./types";

// 멘탈(마음 배터리) 레벨별 배경 — 디자이너 실측(Figma "Feeling Character Reference"
// 2539:5278). 놀이 피드백 아이콘과 동일 파스텔 팔레트 + 방사형 그라데이션.
// PNG 얼굴 배경이 베이크돼 있어, 그라데이션 원 위에 얼굴을 mix-blend-multiply로 올려 틴트.
export const MOOD_BG: Record<MoodLevel, string> = {
  1: "#addeff", // 라이트블루 (단색)
  2: "radial-gradient(circle at 50% 45%, #749cec, #9ab9f0)", // 블루
  3: "radial-gradient(circle at 50% 45%, #fcf1d0, #f6d264)", // 옐로우
  4: "radial-gradient(circle at 50% 45%, #dbf59f, #cee896)", // 연두
  5: "radial-gradient(circle at 50% 45%, #fda1b4, #ff8ba3)", // 핑크
};

export const MoodFace = ({
  level,
  className,
  dimmed = false,
}: {
  level: MoodLevel;
  className?: string;
  /** 선택 모달에서 미선택 항목을 흐리게 표시 */
  dimmed?: boolean;
}) => (
  <div
    className={cn(
      "relative shrink-0 overflow-hidden rounded-full transition-opacity",
      dimmed && "opacity-45",
      className,
    )}
    style={{ background: MOOD_BG[level] }}
  >
    <img
      src={moodIconPath(level)}
      alt=""
      aria-hidden
      className="size-full mix-blend-multiply"
    />
  </div>
);
