// 하단 바 AI 상담 탭의 "새 기능" 빨간 점 — 한 번 채팅 화면에 들어가면 사라진다(기기별).

// 다음 AI 상담 업데이트 때는 날짜만 바꾸면 점이 다시 뜬다.
const CHAT_NEW_KEY = "yb:nav-new:chat:2026-11-18";
export const isChatNew = () => {
  try {
    return window.localStorage.getItem(CHAT_NEW_KEY) === null;
  } catch {
    return false;
  }
};
const CHAT_SEEN_EVENT = "yb:nav-chat-seen";
export const markChatSeen = () => {
  if (!isChatNew()) return;
  try {
    window.localStorage.setItem(CHAT_NEW_KEY, "1");
  } catch {
    // 무시
  }
  window.dispatchEvent(new Event(CHAT_SEEN_EVENT));
};
export const subscribeChatSeen = (onChange: () => void) => {
  window.addEventListener(CHAT_SEEN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHAT_SEEN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};
