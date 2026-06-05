import { cn } from "@/lib/utils";
import { moodIconPath } from "./helpers";
import type { MoodLevel } from "./types";

// 멘탈(마음 배터리) 레벨별 배경색 — "낮음=차분한 쿨톤 → 가득=따뜻한 웜톤" 의도.
// PNG 얼굴 배경이 베이크돼 있어, 컬러 원 위에 얼굴을 mix-blend-multiply로 올려 틴트한다.
// (디자이너 정식 에셋이 나오면 이 임시 틴트 대신 PNG 자체 색으로 교체.)
export const MOOD_BG_COLORS: Record<MoodLevel, string> = {
  1: "#A9B4EE", // 쿨 블루바이올렛 — 배터리 거의 없음
  2: "#A6D2EC", // 스카이 블루 — 지침
  3: "#F7E4A3", // 소프트 옐로우 — 보통
  4: "#A9E0B5", // 민트 그린 — 괜찮음
  5: "#FBBF8F", // 웜 피치 — 가득
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
    style={{ backgroundColor: MOOD_BG_COLORS[level] }}
  >
    <img
      src={moodIconPath(level)}
      alt=""
      aria-hidden
      className="size-full mix-blend-multiply"
    />
  </div>
);
