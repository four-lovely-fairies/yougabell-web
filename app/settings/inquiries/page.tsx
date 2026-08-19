"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatInquiryDate } from "@/components/settings/inquiry/format-date";
import { InquiryStatusBadge } from "@/components/settings/inquiry/inquiry-status-badge";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import {
  INQUIRY_CATEGORY_LABELS,
  type InquiryListItem,
  listInquiries,
} from "@/lib/api/inquiry";

/** 내 문의 목록 (docs/features/20260819-inquiry.md §4.2). */
export default function InquiriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<InquiryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track({ type: "inquiry_list_view" });
    void (async () => {
      try {
        const res = await listInquiries({ limit: 50 });
        setItems(res.items);
      } catch {
        setError("문의 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex h-dvh flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
      <OnboardingHeader variant="back" />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="py-6">
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
            문의하기
          </h1>
          <p className="pt-2 text-sm leading-[1.4] text-gray-500">
            궁금한 점이나 불편한 점을 알려주세요.
          </p>
        </header>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">
            불러오는 중...
          </p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-error-500">{error}</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            아직 남긴 문의가 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/settings/inquiries/${item.id}`)}
                  className="flex w-full flex-col gap-2 rounded-2xl border border-gray-100 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-base font-medium leading-[1.4] text-gray-800">
                      {item.title}
                    </span>
                    <InquiryStatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{formatInquiryDate(item.createdAt)}</span>
                    {item.category ? (
                      <>
                        <span aria-hidden>·</span>
                        <span>{INQUIRY_CATEGORY_LABELS[item.category]}</span>
                      </>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 pt-3">
        <Button
          type="button"
          size="full"
          onClick={() => router.push("/settings/inquiries/new")}
        >
          문의 작성
        </Button>
      </div>
    </div>
  );
}
