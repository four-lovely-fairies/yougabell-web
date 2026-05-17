'use client';

import { usePathname, useRouter } from 'next/navigation';

const NAV_ICON_PATHS = {
  ai: '/icons/figma/home/nav-ai.svg',
  home: '/icons/figma/home/nav-home.svg',
  play: '/icons/figma/home/nav-play.svg',
  roadmap: '/icons/figma/home/nav-roadmap.svg',
  weeklyReport: '/icons/figma/home/nav-weekly-report.svg',
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
    label: '홈',
    href: '/',
    iconSrc: NAV_ICON_PATHS.home,
    iconClassName: 'h-[18px] w-4',
    matches: (pathname: string) => pathname === '/',
  },
  {
    label: '10분 놀이',
    iconSrc: NAV_ICON_PATHS.play,
    iconClassName: 'h-5 w-[18px]',
    matches: () => false,
  },
  {
    label: '성장 로드맵',
    iconSrc: NAV_ICON_PATHS.roadmap,
    iconClassName: 'size-[18px]',
    matches: () => false,
  },
  {
    label: 'AI 상담',
    iconSrc: NAV_ICON_PATHS.ai,
    iconClassName: 'h-[19px] w-[22px]',
    matches: () => false,
  },
  {
    label: '리포트',
    href: '/weekly-report',
    iconSrc: NAV_ICON_PATHS.weeklyReport,
    iconClassName: 'size-[18px]',
    matches: (pathname: string) => pathname.startsWith('/weekly-report'),
  },
] as const;

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 w-full px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 md:left-1/2 md:max-w-[390px] md:-translate-x-1/2">
      <div className="rounded-[999px] bg-[#fdfdfe] p-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="flex w-full items-center justify-center gap-1">
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
                aria-current={active ? 'page' : undefined}
                className={`flex h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[999px] py-1 text-xs leading-[1.4] ${
                  active ? 'bg-[#e9e9e9] text-[#262626]' : 'text-[#9d9d9d]'
                }`}
              >
                <img
                  src={item.iconSrc}
                  alt=""
                  className={`shrink-0 ${item.iconClassName}`}
                  aria-hidden
                />
                <span className={active ? 'font-medium' : 'font-normal'}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
