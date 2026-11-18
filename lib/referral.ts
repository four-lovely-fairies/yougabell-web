import {
  APP_DOWNLOAD_URL,
  KAKAO_SHARE_IMAGE,
  referralKakaoCard,
  referralShareText,
} from "@/lib/api/referral";
import { shareToKakao } from "@/lib/kakao-share";
import { isNativeWebView, openExternalUrl } from "@/lib/native-bridge";
import { showToast } from "@/lib/toast";

// 친구 초대 — 팝업 노출 횟수 기록과 공유 동작.

// 홈 "친구 초대하고 커피 받아요" 팝업: 앱을 3번 켤 때 1번 (1·4·7…번째 실행).
// 앱 실행 = WebView 세션. sessionStorage는 앱을 껐다 켜면 비워지므로 실행 1번을 한 번만 센다.
const APP_LAUNCH_COUNT_KEY = "yb:app-launch-count";
const LAUNCH_COUNTED_KEY = "yb:app-launch-counted";
const INVITE_POPUP_SHOWN_KEY = "yb:referral-popup-shown";
const INVITE_POPUP_EVERY = 3;

function launchCount(): number {
  try {
    const stored = Number(window.localStorage.getItem(APP_LAUNCH_COUNT_KEY));
    let count = Number.isFinite(stored) ? stored : 0;
    if (window.sessionStorage.getItem(LAUNCH_COUNTED_KEY) === null) {
      count += 1;
      window.localStorage.setItem(APP_LAUNCH_COUNT_KEY, String(count));
      window.sessionStorage.setItem(LAUNCH_COUNTED_KEY, "1");
    }
    return count;
  } catch {
    return 0; // 저장소를 못 쓰면 띄우지 않는다
  }
}

export function shouldShowInvitePopup(): boolean {
  if (typeof window === "undefined") return false;
  const count = launchCount();
  if (count < 1 || count % INVITE_POPUP_EVERY !== 1) return false;
  try {
    // 같은 실행 안에서 홈을 다시 들어와도 한 번만
    return window.sessionStorage.getItem(INVITE_POPUP_SHOWN_KEY) === null;
  } catch {
    return false;
  }
}

export function markInvitePopupSeen(): void {
  try {
    window.sessionStorage.setItem(INVITE_POPUP_SHOWN_KEY, "1");
  } catch {
    // 무시
  }
}
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

/** 다른 앱으로 넘어가 화면이 숨겨지면 true. 데스크톱 팝업(카카오 공유 창)도 포커스를 잃으면 true. */
function leftPageWithin(ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.visibilityState === "hidden") return resolve(true);
    const done = (left: boolean) => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("blur", onHide);
      resolve(left);
    };
    const onHide = () => done(true);
    const timer = window.setTimeout(() => done(false), ms);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("blur", onHide);
  });
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
 * 카카오톡: 카카오 공유로 친구 선택 화면을 바로 연다(메시지 + [앱 다운로드] 버튼).
 *   카카오 공유가 안 되는 환경이면 메시지를 복사하고 카카오톡 앱만 연다.
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
  if (method === "kakao") {
    const opened = await shareToKakao({
      ...referralKakaoCard(code),
      imagePath: KAKAO_SHARE_IMAGE,
      linkUrl: APP_DOWNLOAD_URL,
      buttonTitle: "육아벨 다운로드",
    });
    // 카카오톡이 열리면 화면이 뒤로 숨는다. 2.5초 안에 안 숨으면 못 연 것으로 보고 복사로 대신한다.
    if (opened && (await leftPageWithin(2500))) return;
  }
  const copied = await copyText(method === "copy" ? code : text);
  if (!copied) {
    showToast(`내 초대 코드는 ${code} 예요`);
    return;
  }
  showToast(SHARE_TOASTS[method], { icon: "check" });
  if (method === "kakao") openAppUrl("kakaotalk://launch");
}
