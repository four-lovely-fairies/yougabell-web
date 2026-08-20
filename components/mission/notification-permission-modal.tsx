"use client";

import { Mascot } from "@/components/characters/mascot";
import { XIcon } from "@/components/icons";

type Props = {
  variant: "request" | "settings";
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function NotificationPermissionModal({
  variant,
  busy = false,
  onClose,
  onConfirm,
}: Props) {
  const isSettings = variant === "settings";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-permission-title"
    >
      <div className="relative w-full max-w-84 rounded-2xl bg-white px-4 pb-4 pt-8 shadow-xl">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          disabled={busy}
          className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-full bg-gray-100 text-gray-300"
        >
          <XIcon size={16} />
        </button>

        <div className="flex flex-col items-center">
          {isSettings ? (
            <Mascot pose="resting" className="mb-4 w-18" />
          ) : (
            <span className="mb-4 text-5xl leading-none" aria-hidden>
              🎉
            </span>
          )}
          <h2
            id="notification-permission-title"
            className="text-center text-sm font-bold leading-[1.55] text-gray-800"
          >
            {isSettings
              ? "알림 권한을 확인해주세요"
              : "매일 아이와 놀이를 챙길 수 있도록\n같은 시간에 알려드릴까요?"}
          </h2>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="mt-5 flex h-10 w-full items-center justify-center rounded-xl bg-primary-300 text-xs font-medium text-white disabled:opacity-60"
        >
          {busy ? "확인 중..." : isSettings ? "설정하러 가기" : "알려주세요"}
        </button>
      </div>
    </div>
  );
}
