import { Check, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { XIcon } from "@/components/icons";
import type { HomeChild, HomeNotification } from "@/lib/home-data";
import { MoodFace } from "./mood-face";
import {
  getNotificationKind,
  NOTIFICATION_KIND_LABEL,
  NotificationIcon,
} from "./notification-icon";
import { MOOD_OPTION_LABELS, type MoodLevel } from "./types";

// 자녀 선택 바텀시트 — 공통 BottomSheet + 월 선택 시트와 같은 목록 행.
// 선택된 아이는 보라 이름 + 체크, 오른쪽에 수정·삭제 아이콘.
export const ChildSwitcherSheet = ({
  childItems,
  selectedChildId,
  onSelect,
  onEdit,
  onDelete,
  onClose,
}: {
  childItems: HomeChild[];
  selectedChildId: string;
  onSelect: (child: HomeChild) => void;
  onEdit: (child: HomeChild) => void;
  onDelete: (child: HomeChild) => void;
  onClose: () => void;
}) => (
  <BottomSheet title="아이 선택" onClose={onClose} labelledById="child-switcher-title">
    <ul role="radiogroup" aria-labelledby="child-switcher-title">
      {childItems.map((child) => {
        const selected = child.id === selectedChildId;

        return (
          <li key={child.id} className="flex items-center gap-2 pr-4 active:bg-gray-50">
            <button
              type="button"
              onClick={() => onSelect(child)}
              className="flex min-w-0 flex-1 items-center gap-2 py-3.5 pl-6 text-left"
              role="radio"
              aria-checked={selected}
            >
              <span className="min-w-0">
                <span
                  className={`block truncate text-base font-medium leading-[1.4] ${
                    selected ? "text-primary-300" : "text-gray-800"
                  }`}
                >
                  {child.name}
                </span>
                <span className="block truncate text-sm leading-[1.4] text-gray-500">
                  {child.ageLabel} ({new Date(child.birthDate).getFullYear()}년생)
                </span>
              </span>
              {selected ? (
                <Check className="size-5 shrink-0 text-primary-300" aria-hidden />
              ) : null}
            </button>
            <div className="flex shrink-0 items-center text-gray-500">
              <button
                type="button"
                onClick={() => onEdit(child)}
                className="flex size-10 items-center justify-center"
                aria-label={`${child.name} 수정`}
              >
                <Pencil className="size-4.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onDelete(child)}
                className="flex size-10 items-center justify-center"
                aria-label={`${child.name} 삭제`}
              >
                <Trash2 className="size-4.5" aria-hidden />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  </BottomSheet>
);

// 알림 — 전체 화면. 우측 상단 닫기, 큰 제목 + 모두 읽기, 종류 아이콘 + 라벨/시간 + 내용 목록.
// 읽지 않은 알림은 회색 배경으로 구분하고, 누르면 읽음 처리 후 해당 화면으로 이동한다.
export const NotificationModal = ({
  notifications,
  unreadCount,
  submitting,
  errorMessage,
  onClose,
  onMarkAllRead,
  onOpenNotification,
}: {
  notifications: HomeNotification[];
  unreadCount: number;
  submitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onMarkAllRead: () => void;
  onOpenNotification: (notification: HomeNotification) => void;
}) => (
  <div
    className="fixed inset-0 z-[55] mx-auto flex w-full max-w-107.5 animate-dissolve flex-col bg-white motion-reduce:animate-none"
    role="dialog"
    aria-modal="true"
    aria-labelledby="notification-title"
    style={{ animationDuration: "240ms" }}
  >
    <header className="flex h-14 shrink-0 items-center justify-end px-4 pt-[max(0px,env(safe-area-inset-top))] box-content">
      <button
        type="button"
        onClick={onClose}
        aria-label="알림 닫기"
        className="flex size-11 items-center justify-center text-gray-800"
      >
        <XIcon size={24} />
      </button>
    </header>
    <div className="flex shrink-0 items-center justify-between p-5">
      <h2
        id="notification-title"
        className="text-[24px] font-bold leading-[1.4] text-gray-800"
      >
        알림
      </h2>
      <button
        type="button"
        onClick={onMarkAllRead}
        disabled={unreadCount === 0 || submitting}
        className="-mr-2 px-2 py-2 text-sm font-medium leading-[1.4] text-primary-300 disabled:text-gray-300"
      >
        모두 읽기
      </button>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto pb-[max(20px,env(safe-area-inset-bottom))]">
      {errorMessage ? (
        <p role="alert" className="px-5 pb-2 text-sm text-error-600">
          {errorMessage}
        </p>
      ) : null}
      {notifications.length > 0 ? (
        <ul className="flex flex-col">
          {notifications.map((notification) => {
            const kind = getNotificationKind(notification);
            const message = [notification.title, notification.body]
              .filter(Boolean)
              .join(" ");
            return (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => onOpenNotification(notification)}
                  disabled={submitting}
                  className={`flex w-full gap-1 px-5 py-5 text-left transition-colors disabled:opacity-70 ${
                    notification.readAt ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <NotificationIcon kind={kind} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1 font-medium leading-[1.5]">
                    <span className="flex items-center justify-between gap-3 text-black/40">
                      <span className="text-[13px]">
                        {NOTIFICATION_KIND_LABEL[kind]}
                        {notification.readAt ? null : (
                          <span className="sr-only"> (읽지 않음)</span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </span>
                    <span className="text-[15px] text-black/90">{message}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        // 다른 빈 화면(놀이 내역·관심 놀이·주간 리포트)과 같은 모양: 문서 아이콘 + 굵은 제목 + 회색 설명
        <div
          className="flex h-full animate-dissolve flex-col items-center justify-center px-5 pb-24 text-center leading-[1.4] motion-reduce:animate-none"
          style={{ animationDuration: "300ms" }}
        >
          <Image
            src="/icons/figma/play-category/empty-document.svg"
            alt=""
            width={42}
            height={51}
          />
          <p className="mt-5 text-lg font-bold text-gray-800">
            아직 받은 알림이 없어요
          </p>
          <p className="mt-1.5 text-sm text-gray-500">
            놀이 알림, 주간 리포트 소식이 오면
            <br />
            여기에서 알려드릴게요
          </p>
        </div>
      )}
    </div>
  </div>
);

function formatNotificationTime(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return formatMonthDay(created);
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "방금";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return formatMonthDay(created);
}

function formatMonthDay(date: Date): string {
  const month = `${date.getMonth() + 1}`;
  const day = `${date.getDate()}`;
  return `${month}월${day}일`;
}

export const NotificationConfiguredModal = ({
  onClose,
}: {
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 px-3"
    role="dialog"
    aria-modal="true"
    aria-labelledby="notification-configured-title"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-107.5 rounded-[28px] bg-white px-5 pb-6 pt-20"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-6 top-6 flex size-8 items-center justify-center rounded-full bg-gray-50 text-gray-300"
      >
        <XIcon size={20} />
      </button>
      <h2
        id="notification-configured-title"
        className="text-center text-[20px] font-bold leading-[1.4] text-gray-800"
      >
        이미 알람 설정이 완료되어있어요!
      </h2>
      <p className="mt-4 text-center text-base text-gray-500">
        정해진 시간에 알려드릴게요
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-8 flex h-17 w-full items-center justify-center rounded-2xl bg-primary-300 text-base font-medium text-white"
      >
        좋아요
      </button>
    </div>
  </div>
);

export const MoodCheckModal = ({
  selectedLevel,
  submitting,
  errorMessage,
  onClose,
  onSelectLevel,
  onSubmit,
}: {
  selectedLevel: MoodLevel | null;
  submitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSelectLevel: (level: MoodLevel) => void;
  onSubmit: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.2)]"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div className="relative mx-auto flex min-h-dvh w-full max-w-107.5 items-center justify-center px-5">
      <div
        className="w-full max-w-83.5 rounded-xl bg-white px-5 pb-5 pt-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="whitespace-pre-line text-center text-[24px] font-bold leading-[1.35] tracking-[-0.02em] text-gray-800">
          {"지금 마음의 배터리가 \n얼마나 남아있나요?"}
        </h2>
        <p className="mt-2 text-center text-sm font-medium leading-5 text-[#8e8e93]">
          기록을 꾸준히 하면 리포트 작성에 도움이 돼요.
        </p>
        <div className="mt-6 flex items-start justify-between gap-2">
          {(Object.keys(MOOD_OPTION_LABELS) as Array<`${MoodLevel}`>).map(
            (levelKey) => {
              const level = Number(levelKey) as MoodLevel;
              const selected = selectedLevel === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onSelectLevel(level)}
                  className="flex w-13 flex-col items-center gap-1.25"
                  aria-pressed={selected}
                >
                  <MoodFace
                    level={level}
                    className="size-10"
                    muted={!selected}
                  />
                  <span
                    className={`text-center text-[11px] font-medium leading-[1.35] ${
                      selected ? "text-gray-800" : "text-[#8e8e93]"
                    }`}
                  >
                    {MOOD_OPTION_LABELS[level]}
                  </span>
                </button>
              );
            },
          )}
        </div>
        {errorMessage ? (
          <p className="mt-4 text-center text-xs font-medium leading-4 text-error-600">
            {errorMessage}
          </p>
        ) : (
          <div className="mt-4 h-4" aria-hidden />
        )}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#f2f3f5] text-base font-medium leading-6 text-gray-700 disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!selectedLevel || submitting}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary-300 text-base font-medium leading-6 text-white disabled:bg-[#ddd7ff] disabled:text-white"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  </div>
);

// 오늘의 미션 다시 하기 확인 — 완료된 오늘 기록을 지우고 재진행할지 묻는다.
export const RestartMissionModal = ({
  submitting,
  onConfirm,
  onClose,
}: {
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.2)]"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div className="relative mx-auto flex h-full w-full max-w-107.5 items-center justify-center px-5">
      <div
        className="w-full rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-bold leading-7 text-gray-800">
          오늘의 놀이를 다시 하시겠어요?
        </h2>
        <p className="mt-2 text-sm leading-5 text-gray-500">
          지금까지의 오늘 놀이 기록이 삭제되고 처음부터 다시 진행돼요.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-12 flex-1 rounded-2xl bg-gray-100 text-base font-medium leading-6 text-gray-600 disabled:opacity-70"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="h-12 flex-1 rounded-2xl bg-primary-300 text-base font-medium leading-6 text-white disabled:opacity-70"
          >
            {submitting ? "처리 중..." : "다시 하기"}
          </button>
        </div>
      </div>
    </div>
  </div>
);
