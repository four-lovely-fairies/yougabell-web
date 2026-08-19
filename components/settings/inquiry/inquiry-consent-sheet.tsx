"use client";

import { XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { openExternalUrl } from "@/lib/native-bridge";

type Props = {
  onClose: () => void;
  onAgree: () => void;
};

/**
 * 문의 처리 목적의 개인정보 수집·이용 동의 안내
 * (yougabell/docs/features/20260819-inquiry.md §6).
 *
 * 개인정보처리방침의 처리 목적에는 "고충처리"가 있으나 처리하는 항목에
 * 문의 내용이 없다. 문의 본문에는 민감정보가 들어올 수 있으므로 수집 항목·목적·
 * 보유기간을 이 시트에서 명시하고 동의를 받는다.
 */
export function InquiryConsentSheet({ onClose, onAgree }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-consent-title"
    >
      <div
        className="w-full max-w-97.5 rounded-t-3xl bg-white pb-[max(20px,env(safe-area-inset-bottom))] pt-7"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 pb-4">
          <h2
            id="inquiry-consent-title"
            className="text-lg font-bold leading-[1.4] text-gray-800"
          >
            개인정보 수집·이용 동의
          </h2>
          <button type="button" onClick={onClose} aria-label="닫기">
            <XIcon size={24} />
          </button>
        </header>

        <div className="flex flex-col gap-3 px-6 pb-2">
          <p className="text-sm leading-[1.5] text-gray-600">
            문의를 접수하고 답변을 보내드리기 위해 아래 정보를 수집·이용합니다.
          </p>

          <dl className="flex flex-col gap-2.5 rounded-2xl bg-gray-50 p-4">
            <Row label="수집 항목" value="이메일 주소, 문의 내용" />
            <Row
              label="이용 목적"
              value="문의 접수·확인, 사실조사를 위한 연락, 처리결과 통보"
            />
            <Row
              label="보유 기간"
              value="문의 처리 완료 후 3년 (전자상거래법상 소비자 불만·분쟁처리 기록)"
            />
          </dl>

          <p className="text-xs leading-[1.5] text-gray-500">
            동의를 거부하실 수 있으나, 거부 시 문의 접수와 답변이 불가능합니다.
            문의 내용에는 주민등록번호·카드번호 등 민감한 정보를 적지
            말아주세요.
          </p>

          <button
            type="button"
            onClick={() =>
              openExternalUrl(`${window.location.origin}/policy/privacy`)
            }
            className="self-start text-xs text-gray-500 underline"
          >
            개인정보처리방침 전문 보기
          </button>
        </div>

        <div className="flex flex-col gap-2 px-5 pt-4">
          <Button type="button" size="full" onClick={onAgree}>
            동의하고 계속하기
          </Button>
          <Button type="button" size="full" variant="ghost" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-16 shrink-0 text-xs font-medium text-gray-500">
        {label}
      </dt>
      <dd className="flex-1 text-xs leading-[1.5] text-gray-800">{value}</dd>
    </div>
  );
}
