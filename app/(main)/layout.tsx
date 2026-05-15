import type { ReactNode } from "react";
import { MainAppShell } from "@/components/app/main-app-shell";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <MainAppShell>{children}</MainAppShell>;
}
