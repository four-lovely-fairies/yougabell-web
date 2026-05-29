import { OnboardingHeader } from "@/components/onboarding/onboarding-header";

export default function TermsPage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-gray-20 text-gray-800">
      <div className="relative min-h-dvh w-full overflow-hidden md:mx-auto md:max-w-97.5">
        <OnboardingHeader variant="back" />
        <header className="px-5 py-6">
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
            서비스 약관
          </h1>
        </header>
        <div className="px-5 pb-10 text-sm leading-[1.6] text-gray-700">
          {/* TODO(content): 정식 약관 본문 import. v0.1에선 placeholder. */}
          <p className="text-gray-500">
            (작성 예정) 육아밸의 서비스 이용약관 본문이 이곳에 노출됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
