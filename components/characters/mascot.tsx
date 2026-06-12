import { cn } from "@/lib/utils";

// 마스코트 캐릭터 일러스트(Figma SVG). 기존 스프라이트 시트(9컷 PNG)를
// CSS offset으로 잘라 쓰던 방식을 대체한다. 포즈별 단일 SVG를 노출.
const MASCOT_SRC = {
  reading: "/images/figma/characters/reading.svg",
  resting: "/images/figma/characters/resting.svg",
  question: "/images/figma/characters/question.svg",
  spiky: "/images/figma/characters/spiky.svg",
  clipboard: "/images/figma/characters/clipboard.svg",
  reviewing: "/images/figma/characters/reviewing.svg",
  "clipboard-stack": "/images/figma/characters/clipboard-stack.svg",
  cheer: "/images/figma/characters/cheer.svg",
} as const;

export type MascotPose = keyof typeof MASCOT_SRC;

export const Mascot = ({
  pose,
  className,
}: {
  pose: MascotPose;
  className?: string;
}) => (
  <img
    src={MASCOT_SRC[pose]}
    alt=""
    aria-hidden
    className={cn("object-contain", className)}
  />
);
