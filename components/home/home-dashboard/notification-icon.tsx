import Image from "next/image";
import type { HomeNotification } from "@/lib/home-data";

export type NotificationKind = "report" | "play" | "etc";

// 알림 종류 — 이동 대상(actionType/targetType)으로 구분한다.
export const getNotificationKind = (
  notification: Pick<HomeNotification, "actionType" | "targetType">,
): NotificationKind => {
  if (
    notification.actionType === "open_report" ||
    notification.targetType === "weekly_report"
  ) {
    return "report";
  }
  if (
    notification.actionType === "open_mission" ||
    notification.targetType === "mission" ||
    notification.targetType === "mission_execution"
  ) {
    return "play";
  }
  return "etc";
};

export const NOTIFICATION_KIND_LABEL: Record<NotificationKind, string> = {
  report: "주간 리포트",
  play: "10분 놀이",
  etc: "알림",
};

// 종류별 24px 아이콘 — 리포트(문서), 놀이(편지), 기타(종).
export const NotificationIcon = ({ kind }: { kind: NotificationKind }) => (
  <span
    aria-hidden
    className="flex size-6 shrink-0 items-center justify-center"
  >
    {kind === "report" ? (
      <span className="relative block size-[18px]">
        <Image
          src="/images/figma/notification/report-doc.png"
          alt=""
          width={18}
          height={18}
          className="size-[18px]"
        />
        <Image
          src="/images/figma/notification/report-corner.svg"
          alt=""
          width={4}
          height={4}
          className="absolute left-[13.5px] top-0 size-[3.4px]"
        />
      </span>
    ) : kind === "play" ? (
      <Image
        src="/images/figma/notification/play-letter.svg"
        alt=""
        width={18}
        height={18}
        className="size-[18px]"
      />
    ) : (
      <Image
        src="/images/figma/notification/etc-bell.png"
        alt=""
        width={16}
        height={16}
        className="size-4"
      />
    )}
  </span>
);
