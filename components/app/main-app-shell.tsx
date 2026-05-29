import { BottomNav } from "@/components/app/bottom-nav";
import type { ReactNode } from "react";

export const MainAppShell = ({ children }: { children: ReactNode }) => (
  <main className="min-h-dvh overflow-x-hidden bg-gray-20 text-gray-800">
    <div className="relative min-h-dvh w-full overflow-hidden pb-[calc(96px+env(safe-area-inset-bottom))] md:mx-auto md:max-w-97.5">
      {children}
      <BottomNav />
    </div>
  </main>
);
