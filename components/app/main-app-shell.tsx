import type { ReactNode } from "react";
import { BottomNav } from "@/components/app/bottom-nav";

export const MainAppShell = ({ children }: { children: ReactNode }) => (
  <main className="min-h-dvh overflow-x-hidden bg-[#fdfdfe] text-[#262626]">
    <div className="relative min-h-dvh w-full overflow-hidden pb-[calc(96px+env(safe-area-inset-bottom))] md:mx-auto md:max-w-[390px]">
      {children}
      <BottomNav />
    </div>
  </main>
);
