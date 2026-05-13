"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";

export default function IntroPage() {
  const router = useRouter();
  const { isDirty, clear } = useOnboardingDraft();
  const [startFresh, setStartFresh] = useState(false);

  useEffect(() => {
    track({ type: "onboarding_intro_view" });
  }, []);

  if (isDirty && !startFresh) {
    return (
      <div className="flex flex-col flex-1 justify-center gap-4">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          이어서 작성하시겠어요?
        </h1>
        <p className="text-sm text-gray-500">
          이전에 작성하다 만 온보딩이 있습니다.
        </p>
        <div className="flex flex-col gap-3 mt-2">
          <Button size="full" onClick={() => router.push("/onboarding/parent")}>
            이어서 작성하기
          </Button>
          <Button
            size="full"
            variant="outline"
            onClick={() => {
              clear();
              setStartFresh(true);
            }}
          >
            처음부터
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="pt-14 flex flex-col items-center text-center gap-3">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          워킹맘의 하루를
          <br />더 의미있게
        </h1>
        <p className="text-sm text-gray-500 leading-[1.5]">
          바쁜 일상 속에서도
          <br />
          아이와의 소중한 순간을 놓치지 마세요
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="size-40 rounded-full bg-primary-50" aria-hidden />
      </div>

      <Button
        size="full"
        variant="secondary"
        onClick={() => {
          track({ type: "onboarding_skip", from: "intro" });
          router.push("/onboarding/parent");
        }}
      >
        <AppleIcon size={18} />
        Apple로 계속하기
      </Button>
    </div>
  );
}
