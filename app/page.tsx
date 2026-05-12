import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-6">
      <h1 className="text-3xl font-semibold">육아밸</h1>
      <p className="text-zinc-600 max-w-sm">
        워킹맘/워킹대디를 위한 육아 정보·기록·AI 챗봇.
        <br />홈 화면은 별도 기획서(`docs/features/20260510-home.md`)에서 구현 중.
      </p>
      <Link
        href="/onboarding/intro"
        className="h-12 px-6 rounded-xl bg-zinc-900 text-white font-medium inline-flex items-center"
      >
        온보딩 시작
      </Link>
    </div>
  );
}
