// web ↔ mobile WebView 통신.
// 기획: docs/features/20260508-onboarding.md §4.3, §4.4

type NativeMessage =
  | { type: "ONBOARDING_COMPLETE"; payload: { userId: string } }
  | { type: "REQUEST_PUSH_PERMISSION" }
  | { type: "LOGOUT" };

declare global {
  interface Window {
    __YOUGABELL_NATIVE__?: boolean;
    ReactNativeWebView?: {
      postMessage: (data: string) => void;
    };
  }
}

export function isNativeWebView(): boolean {
  return (
    typeof window !== "undefined" &&
    window.__YOUGABELL_NATIVE__ === true &&
    typeof window.ReactNativeWebView?.postMessage === "function"
  );
}

export function notifyMobile(message: NativeMessage): void {
  if (!isNativeWebView()) return;
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}
