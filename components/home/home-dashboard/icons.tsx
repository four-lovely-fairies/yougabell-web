export const HOME_ICON_PATHS = {
  childSwitcherChevron: "/icons/figma/home/child-switcher-chevron.svg",
  growthStage: "/icons/figma/home/growth-stage.svg",
  headerNotification: "/icons/figma/home/header-notification.svg",
  headerSettings: "/icons/figma/home/header-settings.svg",
  missionIllustration: "/images/figma/home/mission-illustration.svg",
  moodBad: "/icons/figma/mission-feedback/bad.svg",
  moodGood: "/icons/figma/mission-feedback/good.svg",
  moodNeutral: "/icons/figma/mission-feedback/neutral.svg",
  moodPlus: "/icons/figma/home/mood-plus.svg",
  moodVeryBad: "/icons/figma/mission-feedback/very-bad.svg",
  moodVeryGood: "/icons/figma/mission-feedback/very-good.svg",
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
