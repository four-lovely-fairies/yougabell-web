import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-6">
      <h1 className="text-[24px] font-bold tracking-[-0.2px] text-gray-800">
        육아밸
      </h1>
      <p className="text-sm text-gray-500 max-w-sm leading-[1.5]">
        워킹맘/워킹대디를 위한 육아 정보·기록·AI 챗봇.
        <br />홈 화면은 별도 기획서(`docs/features/20260510-home.md`)에서 구현
        중.
      </p>
      <Link href="/onboarding/intro">
        <Button size="md">온보딩 시작</Button>
      </Link>
    </div>
  );
}
