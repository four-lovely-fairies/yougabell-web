import type { components } from "./generated/api-types";

export type AccountDeletionReasonCode =
  components["schemas"]["AccountDeletionReasonCode"];

// 탈퇴 사유 선택지 — 순서대로 화면에 노출. 문구를 바꿔도 code는 유지할 것 (통계 기준값).
export const ACCOUNT_DELETION_REASONS: ReadonlyArray<{
  code: AccountDeletionReasonCode;
  label: string;
}> = [
  { code: "rarely_use", label: "자주 사용하지 않아요" },
  { code: "not_helpful", label: "육아에 큰 도움이 안 돼요" },
  { code: "hard_to_use", label: "사용하기 불편하거나 오류가 많아요" },
  { code: "privacy", label: "개인정보가 걱정돼요" },
  { code: "other", label: "기타" },
];

export const ACCOUNT_DELETION_DETAIL_MAX = 500;
