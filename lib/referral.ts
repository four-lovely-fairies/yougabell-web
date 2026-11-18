import { referralShareText } from "@/lib/api/referral";
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

/**
 * 공유 시트에서 고른 방법으로 초대 코드를 보낸다.
 * 카카오톡 SDK가 없어서 카카오톡은 기기 공유창(카카오톡 선택)을 띄우고, 공유창이 없으면 복사로 대신한다.
 */
export async function shareInviteCode(
  method: "kakao" | "copy" | "sms",
  code: string,
): Promise<void> {
  const text = referralShareText(code);
  if (method === "sms") {
    window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
    return;
  }
  if (method === "kakao" && typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      showToast("카카오톡으로 초대 코드를 보냈어요", { icon: "check" });
      return;
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
    }
  }
  const copied = await copyText(method === "copy" ? code : text);
  showToast(
    copied
      ? method === "copy"
        ? "초대 코드를 복사했어요"
        : "초대 메시지를 복사했어요. 카카오톡에 붙여넣어 보내주세요"
      : `내 초대 코드는 ${code} 예요`,
    copied ? { icon: "check" } : undefined,
  );
}
