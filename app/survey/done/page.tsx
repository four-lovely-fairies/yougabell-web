"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Mascot } from "@/components/characters/mascot";

export default function SatisfactionSurveyDonePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-dvh flex-col bg-linear-to-b from-[#fbf9ff] via-[#f7f3ff] to-white px-5 pb-10 pt-safe text-gray-800">
      <div className="flex h-14 items-center">
        <button
          type="button"
          aria-label="뒤로"
          onClick={() => router.replace("/")}
          className="flex size-10 items-center justify-center text-gray-800"
        >
          <ArrowLeft className="size-6" aria-hidden />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center pb-28 text-center">
        <Mascot pose="spiky" className="size-25" />
        <h1 className="mt-8 text-[20px] font-bold leading-[1.4] text-gray-800">
          제출이 완료되었습니다.
        </h1>
        <p className="mt-5 text-[15px] font-medium leading-[1.55] text-gray-600">
          소중한 사용 경험을 남겨주셔서 감사합니다.
          <br />
          내용 검토 후, 연락처를 남겨주신 경우
          <br />
          영업일 기준 3일 이내에 지급됩니다.
        </p>
      </div>

      <div className="pb-[max(0px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => router.replace("/")}
          className="flex h-15 w-full items-center justify-center rounded-2xl bg-primary-300 text-base font-bold leading-6 text-white"
        >
          홈으로 가기
        </button>
      </div>
    </main>
  );
}
