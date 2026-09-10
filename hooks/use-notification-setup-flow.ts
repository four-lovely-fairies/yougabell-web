"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isNativeWebView,
  openNativeNotificationSettings,
  requestNativePushPermission,
  requestNativePushPermissionStatus,
} from "@/lib/native-bridge";

export type NotificationSetupView =
  | "permission-prompt"
  | "system-settings-prompt"
  | "schedule"
  | null;

export function getNotificationSetupEntryView(
  native: boolean,
): Exclude<NotificationSetupView, "system-settings-prompt" | null> {
  return native ? "permission-prompt" : "schedule";
}

export function getViewAfterPermissionRequest(
  permission: "granted" | "denied" | null,
): Exclude<NotificationSetupView, "permission-prompt" | null> {
  return permission === "granted" ? "schedule" : "system-settings-prompt";
}

export function useNotificationSetupFlow() {
  const [view, setView] = useState<NotificationSetupView>(null);
  const [busy, setBusy] = useState(false);
  const recoveryInFlight = useRef(false);

  const start = useCallback(
    ({ forceNative = false }: { forceNative?: boolean } = {}) => {
      setView(getNotificationSetupEntryView(isNativeWebView() || forceNative));
    },
    [],
  );

  const close = useCallback(() => {
    setView(null);
  }, []);

  const confirmPermission = useCallback(async () => {
    if (view === "system-settings-prompt") {
      openNativeNotificationSettings();
      return;
    }

    if (view !== "permission-prompt" || busy) return;

    setBusy(true);
    try {
      // 이미 허용된 경우에도 이 호출이 현재 기기의 Expo push token을
      // 서버에 (재)등록한다.
      const permission = await requestNativePushPermission();
      setView(getViewAfterPermissionRequest(permission));
    } finally {
      setBusy(false);
    }
  }, [busy, view]);

  useEffect(() => {
    if (view !== "system-settings-prompt") return;

    const resumeFromSystemSettings = () => {
      if (document.visibilityState === "hidden" || recoveryInFlight.current) {
        return;
      }

      recoveryInFlight.current = true;
      setBusy(true);
      void requestNativePushPermissionStatus()
        .then(async (permission) => {
          if (permission !== "granted") return;

          const registeredPermission = await requestNativePushPermission();
          if (registeredPermission === "granted") {
            setView("schedule");
          }
        })
        .catch(() => undefined)
        .finally(() => {
          recoveryInFlight.current = false;
          setBusy(false);
        });
    };

    window.addEventListener("focus", resumeFromSystemSettings);
    document.addEventListener("visibilitychange", resumeFromSystemSettings);
    return () => {
      window.removeEventListener("focus", resumeFromSystemSettings);
      document.removeEventListener(
        "visibilitychange",
        resumeFromSystemSettings,
      );
    };
  }, [view]);

  return {
    view,
    busy,
    start,
    close,
    confirmPermission,
  };
}
