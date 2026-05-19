import type { ReactNode } from "react";

export default function MissionLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#fdfdfe] text-[#262626]">
      <div className="relative min-h-dvh w-full overflow-hidden md:mx-auto md:max-w-[390px]">
        {children}
      </div>
    </main>
  );
}
