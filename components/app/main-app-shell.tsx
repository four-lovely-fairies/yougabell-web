import type { ReactNode } from "react";
import { BottomNav } from "@/components/app/bottom-nav";

export const MainAppShell = ({ children }: { children: ReactNode }) => (
  <main className="min-h-dvh overflow-x-hidden bg-[#d9c4e3] text-[#1f1a21]">
    <div className="relative min-h-dvh w-full overflow-hidden bg-[rgba(90,0,132,0.23)] pb-[calc(82px+env(safe-area-inset-bottom))] md:mx-auto md:max-w-[390px]">
      {children}
      <BottomNav />
    </div>
  </main>
);
