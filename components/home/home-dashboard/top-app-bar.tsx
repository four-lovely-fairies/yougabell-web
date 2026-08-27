import type { HomeChild } from "@/lib/home-data";
import { FigmaIcon, HOME_ICON_PATHS } from "./icons";

export const TopAppBar = ({
  child,
  unreadCount,
  onOpenChildren,
  onOpenNotifications,
}: {
  child: HomeChild;
  unreadCount: number;
  onOpenChildren: () => void;
  onOpenNotifications: () => void;
}) => (
  <header className="flex h-14 items-center justify-between">
    <button
      type="button"
      onClick={onOpenChildren}
      className="flex items-center gap-1 text-sm font-medium leading-[1.4] text-gray-800"
      aria-label="아이 목록 열기"
      aria-haspopup="dialog"
    >
      <span className="max-w-45 truncate text-[17px] font-bold">
        {child.name} ({formatAgeLabel(child.ageLabel)})
      </span>
      <FigmaIcon
        src={HOME_ICON_PATHS.childSwitcherChevron}
        alt=""
        className="size-4"
      />
    </button>
    <div className="flex items-center">
      <a
        href="/settings"
        className="flex size-11 items-center justify-center"
        aria-label="설정"
      >
        <FigmaIcon
          src={HOME_ICON_PATHS.headerSettings}
          alt=""
          className="size-6"
        />
      </a>
      <button
        type="button"
        onClick={onOpenNotifications}
        className="relative flex size-11 items-center justify-center"
        aria-label="알림 열기"
      >
        <FigmaIcon
          src={HOME_ICON_PATHS.headerNotification}
          alt=""
          className="size-6"
        />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-error-600" />
        ) : null}
      </button>
    </div>
  </header>
);

function formatAgeLabel(ageLabel: string): string {
  const months = ageLabel.match(/^(\d+)개월$/)?.[1];
  if (!months) return ageLabel;
  const monthCount = Number(months);
  return monthCount >= 12 ? `만${Math.floor(monthCount / 12)}세` : ageLabel;
}
