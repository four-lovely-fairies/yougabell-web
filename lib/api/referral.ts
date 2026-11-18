import { ApiError, request } from "./client";

// 친구 초대(레퍼럴) API — yougabell-api referral 모듈.

export type ReferralFriend = { name: string; joinedAt: string };

export type ReferralRewardClaim = {
  phone: string;
  createdAt: string;
  sentAt: string | null;
};

export type MyReferral = {
  code: string;
  goal: number;
  joinedCount: number;
  friends: ReferralFriend[];
  /** 4명 달성 + 아직 쿠폰 신청 전 */
  rewardAvailable: boolean;
  rewardClaim: ReferralRewardClaim | null;
};

export type InviteCodeCheck =
  | { valid: true }
  | { valid: false; reason: "not_found" | "self" };

export const checkInviteCode = (code: string) =>
  request<InviteCodeCheck>("/referral/check-code", {
    method: "POST",
    json: { code },
  });

export const getMyReferral = () => request<MyReferral>("/me/referral");

export type ClaimRewardError = "invalid_phone" | "not_reached" | "already" | "unknown";

export const claimReferralReward = async (
  phone: string,
): Promise<ReferralRewardClaim> => {
  try {
    return await request<ReferralRewardClaim>("/me/referral/reward-claim", {
      method: "POST",
      json: { phone },
    });
  } catch (error) {
    throw toClaimError(error);
  }
};

function toClaimError(error: unknown): ClaimRewardError {
  if (!(error instanceof ApiError)) return "unknown";
  const code = (error.body as { code?: string } | undefined)?.code;
  if (error.status === 409) return "already";
  if (code === "INVALID_PHONE") return "invalid_phone";
  if (code === "REFERRAL_GOAL_NOT_REACHED") return "not_reached";
  return "unknown";
}

/** 초대 코드 입력값 정리 — 공백 제거·대문자 */
export const normalizeInviteCode = (raw: string) =>
  raw.replace(/\s+/g, "").toUpperCase();

/** 010-1234-5678 형태로 보이게 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
}

export const isValidPhone = (raw: string) =>
  /^01[016789]\d{7,8}$/.test(raw.replace(/\D/g, ""));

/** 앱 다운로드 링크 (iOS·Android 스토어 링크 모음) */
export const APP_DOWNLOAD_URL = "https://linktr.ee/Yougabell.official";

/** 카카오톡 공유 카드 — 위에 이미지, 아래 제목·설명. 다운로드는 카드 버튼으로 붙는다. */
export const KAKAO_SHARE_IMAGE = "/images/referral/kakao-share.jpg";

export function referralKakaoCard(code: string) {
  return {
    title: "바쁜 부모도 하루 5분이면 충분해요",
    // 카카오 카드 설명은 짧게 잘리므로 초대 코드 한 줄만 둔다.
    description: `📪가입할 때 초대 코드 [${code}]를 입력해 주세요.`,
  };
}

/** 문자·복사용 초대 메시지 — 소개 문구 + 초대 코드 + 다운로드 링크 */
export function referralShareText(code: string) {
  return [
    "바쁜 부모도 하루 5분이면 충분해요",
    "월령별 맞춤 놀이 • 성장 마일스톤 • 주간 리포트",
    "아이와의 5분, 육아벨이 설계해드려요 💜",
    "",
    `📪가입할 때 초대 코드 [${code}]를 입력해 주세요.`,
    `앱 다운로드: ${APP_DOWNLOAD_URL}`,
  ].join("\n");
}

export const INVITE_CODE_ERRORS = {
  not_found: "존재하지 않는 초대 코드예요. 다시 확인해 주세요.",
  self: "내 초대 코드는 입력할 수 없어요.",
  error: "코드를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.",
} as const;

/** 초대 코드 확인 통과 — 온보딩 완료 화면으로 넘어가며 보여주는 토스트 */
export const INVITE_CODE_VERIFIED_TOAST = "초대 코드가 확인됐어요";
