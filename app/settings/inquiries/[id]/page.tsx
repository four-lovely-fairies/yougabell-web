"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatInquiryDate } from "@/components/settings/inquiry/format-date";
import { InquiryStatusBadge } from "@/components/settings/inquiry/inquiry-status-badge";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { track } from "@/lib/analytics";
import {
  INQUIRY_CATEGORY_LABELS,
  getInquiry,
  type Inquiry,
} from "@/lib/api/inquiry";

/** 문의 상세 — 질문과 답변 (docs/features/20260819-inquiry.md §4.2). */
export default function InquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await getInquiry(params.id);
        setInquiry(res);
        track({ type: "inquiry_detail_view", status: res.status });
      } catch {
        setError("문의를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  return (
    <div className="flex h-dvh flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
      <OnboardingHeader variant="back" />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">
            불러오는 중...
          </p>
        ) : error || !inquiry ? (
          <p className="py-8 text-center text-sm text-error-500">
            {error ?? "문의를 찾을 수 없습니다."}
          </p>
        ) : (
          <>
            <header className="flex flex-col gap-3 py-6">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-[20px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
                  {inquiry.title}
                </h1>
                <InquiryStatusBadge status={inquiry.status} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{formatInquiryDate(inquiry.createdAt)}</span>
                {inquiry.category ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{INQUIRY_CATEGORY_LABELS[inquiry.category]}</span>
                  </>
                ) : null}
              </div>
            </header>

            <section className="rounded-2xl bg-gray-50 px-4 py-3.5">
              <p className="whitespace-pre-wrap text-sm leading-[1.6] text-gray-800">
                {inquiry.body}
              </p>
            </section>

            <section className="pt-6">
              <h2 className="pb-2.5 text-sm font-medium text-gray-600">답변</h2>
              {inquiry.answerBody ? (
                <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3.5">
                  <p className="whitespace-pre-wrap text-sm leading-[1.6] text-gray-800">
                    {inquiry.answerBody}
                  </p>
                  {inquiry.answeredAt ? (
                    <p className="pt-3 text-xs text-gray-500">
                      {formatInquiryDate(inquiry.answeredAt)}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="rounded-2xl border border-gray-100 px-4 py-6 text-center text-sm text-gray-400">
                  답변을 준비하고 있어요. 조금만 기다려 주세요.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
