export const HOME_ICON_PATHS = {
  childSwitcherChevron: "/icons/figma/home/child-switcher-chevron.svg",
  growthStage: "/icons/figma/home/growth-stage.svg",
  headerNotification: "/icons/figma/home/header-notification.svg",
  headerSettings: "/icons/figma/home/header-settings.svg",
  moodPlus: "/icons/figma/home/mood-plus.svg",
  // 마음의 배터리 감정 얼굴 5종 — Figma 실제 일러스트 (level 1~5)
  mood1: "/images/figma/home/mood-1.png",
  mood2: "/images/figma/home/mood-2.png",
  mood3: "/images/figma/home/mood-3.png",
  mood4: "/images/figma/home/mood-4.png",
  mood5: "/images/figma/home/mood-5.png",
} as const;

export const FigmaIcon = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => (
  <img src={src} alt={alt} className={className} aria-hidden={alt === ""} />
);
