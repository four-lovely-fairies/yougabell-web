"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { OnboardingDraft } from "@/lib/types";

const STORAGE_KEY = "onboarding:draft:v3";

type Patch = Partial<Omit<OnboardingDraft, "schemaVersion" | "updatedAt">>;

function readDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingDraft;
    if (parsed.schemaVersion !== 3) return null;
    return parsed;
  } catch {
    return null;
  }
}

let cachedRaw: string | null = null;
let cachedDraft: OnboardingDraft | null = null;

function getSnapshot(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedDraft;
  cachedRaw = raw;
  cachedDraft = readDraft();
  return cachedDraft;
}

function getServerSnapshot(): OnboardingDraft | null {
  return null;
}

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function useOnboardingDraft() {
  const draft = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const patch = useCallback((next: Patch) => {
    const prev = readDraft();
    const merged: OnboardingDraft = {
      schemaVersion: 3,
      lastStep: next.lastStep ?? prev?.lastStep ?? "intro",
      parent: next.parent ?? prev?.parent,
      children: next.children ?? prev?.children,
      notification: next.notification ?? prev?.notification,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    emit();
  }, []);

  const clear = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    emit();
  }, []);

  return {
    draft,
    isDirty: draft !== null,
    patch,
    clear,
  };
}
