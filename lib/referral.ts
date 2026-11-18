import { referralShareText } from "@/lib/api/referral";
import { isNativeWebView, openExternalUrl } from "@/lib/native-bridge";
import { showToast } from "@/lib/toast";

// 친구 초대 — 기기별 1회 노출 기록과 공유 동작.

// 홈 "친구 초대하고 커피 받아요" 팝업: 기존 사용자에게 기기당 1회.
const INVITE_POPUP_KEY = "yb:referral-popup:2026-11-18";
// 4명 달성 "커피 쿠폰이 도착했어요" 모달: 닫으면 다시 안 띄운다(설정·친구 초대 화면에서 계속 받을 수 있음).
const COUPON_MODAL_KEY = "yb:referral-coupon-modal";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return "blocked";
  }
}

function write(key: string) {
  try {
    window.localStorage.setItem(key, new Date().toISOString());
  } catch {
    // 무시
  }
}

export const shouldShowInvitePopup = () =>
  typeof window !== "undefined" && read(INVITE_POPUP_KEY) === null;
export const markInvitePopupSeen = () => write(INVITE_POPUP_KEY);
export const shouldShowCouponModal = () =>
  typeof window !== "undefined" && read(COUPON_MODAL_KEY) === null;
export const markCouponModalSeen = () => write(COUPON_MODAL_KEY);

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const SHARE_TOASTS = {
  copy: "초대 코드를 복사했어요",
  kakao: "초대 메시지를 복사했어요. 카카오톡 대화방에 붙여넣어 주세요",
} as const;

/**
 * 다른 앱(카카오톡·문자)을 연다. 앱(WebView) 안에서는 sms:·kakaotalk: 주소를 WebView가
 * 직접 못 열어서 네이티브(Linking.openURL)에 넘긴다.
 */
function openAppUrl(url: string) {
  if (isNativeWebView()) openExternalUrl(url);
  else window.location.href = url;
}

/**
 * 공유 시트에서 고른 방법으로 초대 코드를 보낸다.
 * 카카오톡: 초대 코드가 담긴 메시지를 복사해 두고 카카오톡을 바로 연다.
 * (메시지가 미리 채워진 친구 선택 화면은 카카오 개발자 앱 키가 있어야 가능하다.)
 */
export async function shareInviteCode(
  method: "kakao" | "copy" | "sms",
  code: string,
): Promise<void> {
  const text = referralShareText(code);
  if (method === "sms") {
    // 문자 앱을 열고 초대 메시지(코드 포함)를 본문에 채운다. 받는 사람은 사용자가 고른다.
    openAppUrl(`sms:?&body=${encodeURIComponent(text)}`);
    return;
  }
  const copied = await copyText(method === "copy" ? code : text);
  if (!copied) {
    showToast(`내 초대 코드는 ${code} 예요`);
    return;
  }
  showToast(SHARE_TOASTS[method], { icon: "check" });
  if (method === "kakao") openAppUrl("kakaotalk://launch");
}
