"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CouponClaimView,
  CouponDoneView,
} from "@/components/referral/referral-views";
import { track } from "@/lib/analytics";
import { claimReferralReward } from "@/lib/api/referral";

const CLAIM_ERRORS = {
  invalid_phone: "휴대폰 번호를 다시 확인해 주세요.",
  not_reached: "아직 친구 4명이 모이지 않았어요.",
  already: "이미 쿠폰을 신청했어요.",
  unknown: "신청하지 못했어요. 잠시 후 다시 시도해 주세요.",
} as const;

// 08 쿠폰 받기(휴대폰 번호) → 09 신청 완료.
export default function ReferralCouponPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [doneFor, setDoneFor] = useState<string | null>(null);

  if (doneFor) {
    return (
      <CouponDoneView phone={doneFor} onConfirm={() => router.replace("/")} />
    );
  }

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const claim = await claimReferralReward(phone);
      track({ type: "referral_reward_claim_submit" });
      setDoneFor(claim.phone);
    } catch (reason) {
      setError(
        CLAIM_ERRORS[reason as keyof typeof CLAIM_ERRORS] ??
          CLAIM_ERRORS.unknown,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CouponClaimView
      phone={phone}
      error={error}
      submitting={submitting}
      onPhoneChange={(next) => {
        setPhone(next);
        setError(null);
      }}
      onSubmit={() => void submit()}
      onBack={() => router.back()}
    />
  );
}
