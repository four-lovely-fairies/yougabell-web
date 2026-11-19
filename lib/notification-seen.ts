// 홈 알림 종의 빨간 점 — 마지막으로 알림 창을 연 뒤에 새 알림이 왔을 때만 뜬다.
// 알림 창을 열기만 해도 사라진다(읽음 처리와는 별개). 하단 바 AI 상담 점과 같은 방식, 기기별.

const SEEN_AT_KEY = "yb:notifications-seen-at";
const SEEN_EVENT = "yb:notifications-seen";

export const getNotificationsSeenAt = (): number => {
  try {
    return Number(window.localStorage.getItem(SEEN_AT_KEY)) || 0;
  } catch {
    return Number.POSITIVE_INFINITY; // 저장소를 못 쓰면 점을 띄우지 않는다
  }
};

/** 서버 렌더 때는 점을 그리지 않는다(브라우저에서 바로 다시 계산). */
export const getServerNotificationsSeenAt = () => Number.POSITIVE_INFINITY;

export const markNotificationsSeen = (): void => {
  try {
    window.localStorage.setItem(SEEN_AT_KEY, String(Date.now()));
  } catch {
    // 무시
  }
  window.dispatchEvent(new Event(SEEN_EVENT));
};

export const subscribeNotificationsSeen = (onChange: () => void) => {
  window.addEventListener(SEEN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SEEN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

/** 마지막으로 알림 창을 연 뒤에 온 알림이 있는지 */
export const hasNewNotification = (
  notifications: ReadonlyArray<{ createdAt: string }>,
  seenAt: number,
): boolean =>
  notifications.some(
    (notification) => Date.parse(notification.createdAt) > seenAt,
  );
