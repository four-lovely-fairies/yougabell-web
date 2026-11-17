"use client";

import { TOAST_EVENT } from "@/lib/toast";
import { useEffect, useRef, useState } from "react";

const VISIBLE_MS = 2000;

// Figma 토스트 (6113:9142) — 어두운 반투명 바, 모서리 16, 흰 글씨 14 Medium.
// 위치는 화면 아래 가운데. 같은 메시지가 연달아 와도 다시 떠오르도록 매번 새 키로 그린다.
export function ToastHost() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onToast = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      if (!message) return;
      idRef.current += 1;
      setToast({ id: idRef.current, message });
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setToast(null), VISIBLE_MS);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[70] mx-auto flex w-[calc(100%-32px)] max-w-89.5 animate-enter-up items-center rounded-2xl bg-[rgba(47,52,59,0.94)] py-4.5 pl-5 pr-3.5 backdrop-blur-[5px] motion-reduce:animate-none"
      style={{ bottom: "calc(24px + env(safe-area-inset-bottom))", animationDuration: "300ms" }}
    >
      <p className="text-sm font-medium leading-[1.4] text-white">{toast.message}</p>
    </div>
  );
}
