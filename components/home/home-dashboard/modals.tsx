import { Pencil, Trash2 } from "lucide-react";
import type { HomeChild, HomeNotification } from "@/lib/home-data";
import { moodIconPath } from "./helpers";
import { MOOD_OPTION_LABELS, type MoodLevel } from "./types";

export const ChildSwitcherSheet = ({
  childItems,
  selectedChildId,
  onClose,
  onSelect,
}: {
  childItems: HomeChild[];
  selectedChildId: string;
  onClose: () => void;
  onSelect: (child: HomeChild) => void;
}) => (
  <div
    className="fixed inset-0 z-40"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div className="relative mx-auto h-full w-full max-w-107.5">
      <div
        className="absolute left-5 top-27 w-65 overflow-hidden rounded-[32px] border border-[#ebecf0] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
        onClick={(event) => event.stopPropagation()}
      >
        {childItems.map((child) => {
          const selected = child.id === selectedChildId;

          return (
            <div
              key={child.id}
              className={`flex items-center justify-between px-6 py-5 ${
                selected ? "bg-primary-50" : "bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(child)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-sm font-bold leading-[1.4] text-[#1f2127]">
                  {child.name}
                </span>
                <span className="block truncate text-xs font-normal leading-[1.4] text-[#6f7885]">
                  {child.ageLabel} ({new Date(child.birthDate).getFullYear()}
                  년생)
                </span>
              </button>
              <div className="ml-4 flex shrink-0 items-center gap-2 text-gray-800">
                <button
                  type="button"
                  className="flex size-5 items-center justify-center"
                  aria-label={`${child.name} 수정`}
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="flex size-5 items-center justify-center"
                  aria-label={`${child.name} 삭제`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export const NotificationModal = ({
  notifications,
  unreadCount,
  onClose,
}: {
  notifications: HomeNotification[];
  unreadCount: number;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-40 bg-[rgba(38,38,38,0.24)]"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div className="relative mx-auto h-full w-full max-w-107.5">
      <div
        className="absolute inset-x-5 top-26 rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold leading-6 text-gray-800">알림</h2>
            <p className="mt-1 text-sm font-medium leading-5 text-gray-500">
              읽지 않은 알림 {unreadCount}개
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium leading-5 text-primary-300"
          >
            닫기
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className="w-full rounded-xl bg-gray-50 p-4 text-left"
              >
                <p className="text-sm font-bold leading-5 text-gray-800">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm leading-5 text-gray-600">
                  {notification.body}
                </p>
              </button>
            ))
          ) : (
            <p className="rounded-xl bg-gray-50 p-5 text-center text-sm font-medium leading-5 text-gray-500">
              아직 새 알림이 없어요
            </p>
          )}
        </div>
      </div>
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
                  <img
                    src={moodIconPath(level)}
                    alt=""
                    className={`size-10 transition ${
                      selected ? "" : "grayscale opacity-45"
                    }`}
                    aria-hidden
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
