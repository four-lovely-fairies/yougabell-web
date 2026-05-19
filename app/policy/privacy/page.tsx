import { OnboardingHeader } from "@/components/onboarding/onboarding-header";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#fdfdfe] text-[#262626]">
      <div className="relative min-h-dvh w-full overflow-hidden md:mx-auto md:max-w-[390px]">
        <OnboardingHeader variant="back" />
        <header className="px-5 py-6">
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
            개인정보 보호정책
          </h1>
        </header>
        <div className="px-5 pb-10 text-sm leading-[1.6] text-gray-700">
          {/* TODO(content): 정식 약관 본문 import. v0.1에선 placeholder. */}
          <p className="text-gray-500">
            (작성 예정) 육아밸의 개인정보 보호정책 본문이 이곳에 노출됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
