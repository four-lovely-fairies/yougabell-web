"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { HomeDashboard } from "@/lib/home-data";
import {
  reportStateFromHome,
  type MainShellReportState,
} from "@/lib/main-shell-report-state";

type MainShellReportContextValue = {
  state: MainShellReportState | null;
  replaceFromHome: (data: HomeDashboard) => void;
  replaceForChild: (
    childId: string | null,
    hasUnviewedWeeklyReport: boolean,
  ) => void;
  setHasUnviewedWeeklyReport: (hasUnviewed: boolean) => void;
  clear: () => void;
};

const MainShellReportContext =
  createContext<MainShellReportContextValue | null>(null);

export const MainShellReportProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, setState] = useState<MainShellReportState | null>(null);

  const replaceFromHome = useCallback((data: HomeDashboard) => {
    setState(reportStateFromHome(data));
  }, []);

  const replaceForChild = useCallback(
    (childId: string | null, hasUnviewedWeeklyReport: boolean) => {
      setState({ childId, hasUnviewedWeeklyReport, updatedAt: Date.now() });
    },
    [],
  );

  const setHasUnviewedWeeklyReport = useCallback((hasUnviewed: boolean) => {
    setState((current) =>
      current
        ? {
            ...current,
            hasUnviewedWeeklyReport: hasUnviewed,
            updatedAt: Date.now(),
          }
        : null,
    );
  }, []);

  const clear = useCallback(() => setState(null), []);

  const value = useMemo(
    () => ({
      state,
      replaceFromHome,
      replaceForChild,
      setHasUnviewedWeeklyReport,
      clear,
    }),
    [
      clear,
      replaceForChild,
      replaceFromHome,
      setHasUnviewedWeeklyReport,
      state,
    ],
  );

  return (
    <MainShellReportContext.Provider value={value}>
      {children}
    </MainShellReportContext.Provider>
  );
};

export const useMainShellReport = () => {
  const value = useContext(MainShellReportContext);
  if (!value) {
    throw new Error("useMainShellReport must be used inside MainAppShell");
  }
  return value;
};
