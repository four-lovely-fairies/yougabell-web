"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import {
  isNativeWebView,
  notifyMobile,
  subscribeToNativeMessages,
} from "@/lib/native-bridge";
import type { NotificationPermission } from "@/lib/types";

/**
 * OS 알림 권한 요청 — 흐름의 분기점.
 * - granted → /onboarding/app-usage (시간대 설정)
 * - denied / 미요청 → /onboarding/children (시간대 skip, notificationSlot=null로 저장)
 *
 * native(WebView): mobile에 REQUEST_PUSH_PERMISSION postMessage 위임.
 * web: Notification.requestPermission() 표준 API.
 */
export default function NotificationPermissionPage() {
  const router = useRouter();
  const { patch } = useOnboardingDraft();
  const [busy, setBusy] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const decide = (result: NotificationPermission) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    patch({ notificationPermission: result, lastStep: "notification" });
    track({ type: "onboarding_step_complete", step: "notification" });
    if (result === "granted") {
      router.push("/onboarding/app-usage");
    } else {
      router.push("/onboarding/children");
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToNativeMessages((message) => {
      if (message.type !== "NATIVE_PUSH_PERMISSION_RESULT") return;
      setBusy(false);
      decide(message.payload.permission);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  });

  const allow = async () => {
    setBusy(true);
    if (isNativeWebView()) {
      notifyMobile({ type: "REQUEST_PUSH_PERMISSION" });
      timeoutRef.current = setTimeout(() => {
        setBusy(false);
        decide("denied");
      }, 15000);
      return;
    }

    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        const perm = await Notification.requestPermission();
        decide(perm === "granted" ? "granted" : "denied");
        return;
      }
      decide("denied");
    } finally {
      setBusy(false);
    }
  };

  const deny = () => decide("denied");

  return (
    <div className="flex flex-1 flex-col">
      <OnboardingHeader variant="back" />

      <header className="flex flex-col gap-2 py-6">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          알림을 받으시겠어요?
        </h1>
        <p className="text-sm text-gray-500">
          맞춤 미션·마일스톤을 적절한 시간대에 알려드릴게요.
        </p>
      </header>

      <div className="min-h-8 flex-1" />

      <div className="flex flex-col gap-2 pt-2">
        <Button size="full" onClick={allow} disabled={busy}>
          {busy ? "요청 중..." : "허용하기"}
        </Button>
        <button
          type="button"
          onClick={deny}
          disabled={busy}
          className="h-12 text-sm font-medium text-gray-500"
        >
          나중에
        </button>
      </div>
    </div>
  );
}
