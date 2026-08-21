"use client";

import Image from "next/image";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-7"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-permission-title"
    >
      <div className="relative w-full max-w-[334px] rounded-2xl bg-white px-4 pb-4 pt-14 shadow-xl">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          disabled={busy}
          className="absolute right-6 top-6 inline-flex size-6 items-center justify-center rounded-full bg-gray-100 text-gray-300"
        >
          <XIcon size={16} />
        </button>

        <div className="flex flex-col items-center">
          {!isSettings ? (
            <Image
              src="/images/figma/mission/notification-lead.png"
              alt=""
              aria-hidden
              width={120}
              height={120}
              unoptimized
              className="mb-4 size-30 object-contain"
            />
          ) : null}
          <h2
            id="notification-permission-title"
            className="text-center text-lg font-bold leading-[1.4] text-gray-800"
          >
            {isSettings ? (
              "알림 권한을 확인해주세요"
            ) : (
              <>
                매일 아이와 놀이를 챙길 수 있도록
                <br />
                같은 시간에 알려드릴까요?
              </>
            )}
          </h2>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-md bg-primary-300 px-4 py-3 text-sm font-medium leading-5 text-white disabled:opacity-60"
        >
          {busy ? "확인 중..." : isSettings ? "설정하러 가기" : "알려주세요"}
        </button>
      </div>
    </div>
  );
}
