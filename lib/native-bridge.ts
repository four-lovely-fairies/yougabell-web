// web ↔ mobile WebView 통신.
// 기획: docs/features/20260508-onboarding.md §4.3, §4.4

export const NATIVE_WEBVIEW_EVENT_NAME = "yougabell-native-message";

export type WebToNativeMessage =
  | { type: "WEB_READY" }
  | { type: "REQUEST_NATIVE_GOOGLE_SIGN_IN" }
  | { type: "REQUEST_NATIVE_APPLE_SIGN_IN" }
  | { type: "ONBOARDING_COMPLETE"; payload: { userId: string } }
  | { type: "REQUEST_PUSH_PERMISSION" }
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
