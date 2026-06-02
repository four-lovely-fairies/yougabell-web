// web ↔ mobile WebView 통신.
// 기획: docs/features/20260508-onboarding.md §4.3, §4.4

export const NATIVE_WEBVIEW_EVENT_NAME = "yougabell-native-message";

export type WebToNativeMessage =
  | { type: "WEB_READY" }
  | { type: "REQUEST_NATIVE_GOOGLE_SIGN_IN" }
  | { type: "REQUEST_NATIVE_APPLE_SIGN_IN" }
  | { type: "ONBOARDING_COMPLETE"; payload: { userId: string } }
  | { type: "REQUEST_PUSH_PERMISSION" }
  | { type: "REQUEST_PUSH_PERMISSION_STATUS" }
  | { type: "OPEN_SYSTEM_NOTIFICATION_SETTINGS" }
  | { type: "OPEN_EXTERNAL_URL"; payload: { url: string } }
  | { type: "LOGOUT" };

export type NativeToWebMessage =
  | {
      type: "SUPABASE_SESSION_SYNC";
      payload: { accessToken: string; refreshToken: string };
    }
  | { type: "SUPABASE_SESSION_CLEARED" }
  | { type: "NATIVE_GOOGLE_SIGN_IN_CANCELLED" }
  | { type: "NATIVE_GOOGLE_SIGN_IN_ERROR"; payload: { message: string } }
  | { type: "NATIVE_APPLE_SIGN_IN_CANCELLED" }
  | { type: "NATIVE_APPLE_SIGN_IN_ERROR"; payload: { message: string } }
  | {
      type: "NATIVE_PUSH_PERMISSION_RESULT";
      payload: { permission: "granted" | "denied" };
    }
  | {
      type: "NATIVE_PUSH_PERMISSION_STATUS";
      payload: { permission: "granted" | "denied" };
    };

declare global {
  interface Window {
    __YOUGABELL_NATIVE__?: boolean;
    ReactNativeWebView?: {
      postMessage: (data: string) => void;
    };
  }
}

export function isNativeWebView(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    typeof window.ReactNativeWebView?.postMessage === "function" ||
    window.__YOUGABELL_NATIVE__ === true
  );
}

export function notifyMobile(message: WebToNativeMessage): void {
  if (!isNativeWebView()) return;
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}

export function parseNativeMessage(
  rawMessage: unknown,
): NativeToWebMessage | null {
  if (!rawMessage || typeof rawMessage !== "object") {
    return null;
  }

  const candidate = rawMessage as Partial<NativeToWebMessage>;

  switch (candidate.type) {
    case "SUPABASE_SESSION_CLEARED":
    case "NATIVE_GOOGLE_SIGN_IN_CANCELLED":
    case "NATIVE_APPLE_SIGN_IN_CANCELLED":
      return candidate as NativeToWebMessage;
    case "SUPABASE_SESSION_SYNC":
      if (
        candidate.payload &&
        typeof candidate.payload === "object" &&
        typeof candidate.payload.accessToken === "string" &&
        typeof candidate.payload.refreshToken === "string"
      ) {
        return candidate as NativeToWebMessage;
      }
      return null;
    case "NATIVE_GOOGLE_SIGN_IN_ERROR":
    case "NATIVE_APPLE_SIGN_IN_ERROR":
      if (
        candidate.payload &&
        typeof candidate.payload === "object" &&
        typeof candidate.payload.message === "string"
      ) {
        return candidate as NativeToWebMessage;
      }
      return null;
    case "NATIVE_PUSH_PERMISSION_RESULT":
    case "NATIVE_PUSH_PERMISSION_STATUS":
      if (
        candidate.payload &&
        typeof candidate.payload === "object" &&
        (candidate.payload.permission === "granted" ||
          candidate.payload.permission === "denied")
      ) {
        return candidate as NativeToWebMessage;
      }
      return null;
    default:
      return null;
  }
}

export function subscribeToNativeMessages(
  listener: (message: NativeToWebMessage) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleEvent = (event: Event) => {
    const customEvent = event as CustomEvent<unknown>;
    const parsed = parseNativeMessage(customEvent.detail);

    if (parsed) {
      listener(parsed);
    }
  };

  window.addEventListener(NATIVE_WEBVIEW_EVENT_NAME, handleEvent);

  return () => {
    window.removeEventListener(NATIVE_WEBVIEW_EVENT_NAME, handleEvent);
  };
}

export async function requestNativePushPermissionStatus(): Promise<
  "granted" | "denied" | null
> {
  if (!isNativeWebView()) {
    return null;
  }

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 5000);

    const unsubscribe = subscribeToNativeMessages((message) => {
      if (message.type !== "NATIVE_PUSH_PERMISSION_STATUS") {
        return;
      }

      window.clearTimeout(timeoutId);
      unsubscribe();
      resolve(message.payload.permission);
    });

    notifyMobile({ type: "REQUEST_PUSH_PERMISSION_STATUS" });
  });
}

export function openNativeNotificationSettings(): void {
  notifyMobile({ type: "OPEN_SYSTEM_NOTIFICATION_SETTINGS" });
}

/**
 * 외부 페이지(처리방침·약관 등)를 연다.
 * WebView 안에서는 네이티브에 위임해 시스템 브라우저로 열어 WebView에 갇히지 않게 하고,
 * 일반 브라우저에서는 새 탭으로 연다.
 */
export function openExternalUrl(url: string): void {
  if (isNativeWebView()) {
    notifyMobile({ type: "OPEN_EXTERNAL_URL", payload: { url } });
    return;
  }
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
