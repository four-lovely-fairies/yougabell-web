import { BottomNav } from "@/components/app/bottom-nav";
import { MainShellReportProvider } from "@/components/app/main-shell-report-context";
import type { ReactNode } from "react";

export const MainAppShell = ({ children }: { children: ReactNode }) => (
  <MainShellReportProvider>
    <main className="min-h-dvh overflow-x-clip bg-gray-20 text-gray-800">
      <div className="relative min-h-dvh w-full overflow-x-clip pb-[calc(96px+env(safe-area-inset-bottom))]">
        {children}
        <BottomNav />
      </div>
    </main>
  </MainShellReportProvider>
);
