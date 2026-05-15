"use client";

import { usePathname, useRouter } from "next/navigation";

const NAV_ICON_PATHS = {
  ai: "/icons/figma/home/nav-ai.svg",
  home: "/icons/figma/home/nav-home.svg",
  play: "/icons/figma/home/nav-play.svg",
  roadmap: "/icons/figma/home/nav-roadmap.svg",
  weeklyReport: "/icons/figma/home/nav-weekly-report.svg",
} as const;

type BottomNavItem = {
  label: string;
  href?: string;
  iconSrc: string;
  iconClassName: string;
  matches: (pathname: string) => boolean;
};

const items: BottomNavItem[] = [
  {
    label: "홈",
    href: "/",
    iconSrc: NAV_ICON_PATHS.home,
    iconClassName: "h-[18px] w-4",
    matches: (pathname: string) => pathname === "/",
  },
  {
    label: "10분 놀이",
    iconSrc: NAV_ICON_PATHS.play,
    iconClassName: "h-5 w-[18px]",
    matches: () => false,
  },
  {
    label: "성장 로드맵",
    iconSrc: NAV_ICON_PATHS.roadmap,
    iconClassName: "size-[18px]",
    matches: () => false,
  },
  {
    label: "ai 상담",
    iconSrc: NAV_ICON_PATHS.ai,
    iconClassName: "h-[19px] w-[22px]",
    matches: () => false,
  },
  {
    label: "주간 리포트",
    href: "/weekly-report",
    iconSrc: NAV_ICON_PATHS.weeklyReport,
    iconClassName: "size-[18px]",
    matches: (pathname: string) => pathname.startsWith("/weekly-report"),
  },
] as const;

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 h-[82px] w-full rounded-t-[48px] bg-[rgba(252,247,252,0.9)] pt-[13px] shadow-[0_-4px_40px_rgba(27,28,27,0.04)] backdrop-blur-xl md:left-1/2 md:max-w-[390px] md:-translate-x-1/2">
      <div className="flex w-full items-center justify-center">
        {items.map((item) => {
          const active = item.matches(pathname);

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.href && item.href !== pathname) {
                  router.push(item.href);
                }
              }}
              aria-current={active ? "page" : undefined}
              className={`flex h-[55px] w-[77px] flex-col items-center justify-center px-3 py-2 text-[10px] font-bold leading-[15px] ${
                active
                  ? "rounded-full bg-[#f8dcff] text-[#3c2d46]"
                  : "text-[#a093a1]"
              }`}
            >
              <img
                src={item.iconSrc}
                alt=""
                className={`shrink-0 ${item.iconClassName}`}
                aria-hidden
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
