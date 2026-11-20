// 오늘의 놀이 상세 — "찜 기능이 추가됐어요!" 툴팁. 닫거나 하트를 한 번 누르면 다시 안 뜬다(기기별).
// 다음 기능 안내 때는 키의 날짜만 바꾸면 다시 뜬다.

const TIP_KEY = "yb:favorite-tip:2026-11-20";
const TIP_EVENT = "yb:favorite-tip-seen";

export const shouldShowFavoriteTip = (): boolean => {
  try {
    return window.localStorage.getItem(TIP_KEY) === null;
  } catch {
    return false;
  }
};

/** 서버 렌더 때는 그리지 않는다. */
export const getServerFavoriteTip = () => false;

export const markFavoriteTipSeen = (): void => {
  try {
    window.localStorage.setItem(TIP_KEY, new Date().toISOString());
  } catch {
    // 무시
  }
  window.dispatchEvent(new Event(TIP_EVENT));
};

export const subscribeFavoriteTip = (onChange: () => void) => {
  window.addEventListener(TIP_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(TIP_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};
