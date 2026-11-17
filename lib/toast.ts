// 앱 공통 토스트 — 어디서든 showToast("…")를 부르면 화면 아래에 잠깐 떠오른다.
// 화면 이동(router.back/replace) 직전에 불러도 보이도록, 레이아웃에 있는 <ToastHost />가 받아서 그린다.
export const TOAST_EVENT = "yb:toast";

export type ToastIcon = "check";
export type ToastDetail = { message: string; icon?: ToastIcon };

export function showToast(message: string, options?: { icon?: ToastIcon }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, {
      detail: { message, icon: options?.icon },
    }),
  );
}
