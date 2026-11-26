"use client";

import { useEffect, useState } from "react";

type Options = {
  /** false면 애니메이션을 멈추고 null을 돌려준다 (입력 중·답변 중 등) */
  enabled: boolean;
  typeMs?: number;
  holdMs?: number;
};

/**
 * 입력창 placeholder용 타자기 문구.
 * 문구를 한 글자씩 치고 잠깐 멈춘 뒤, 지우는 동작 없이 바로 다음 문구를 처음부터 친다.
 * phrases는 렌더마다 새로 만들지 말고 모듈 상수로 넘길 것 (바뀌면 처음부터 다시 시작).
 */
export function useRotatingPlaceholder(
  phrases: readonly string[],
  { enabled, typeMs = 70, holdMs = 1800 }: Options,
): string | null {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!enabled || phrases.length === 0) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let index = 0;
    let length = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const chars = Array.from(phrases[index]);

      // 움직임 줄이기 설정이면 타이핑 없이 문구만 바꿔 보여준다.
      if (reduceMotion) {
        setText(phrases[index]);
        index = (index + 1) % phrases.length;
        timer = setTimeout(tick, holdMs + 1500);
        return;
      }

      length += 1;
      setText(chars.slice(0, length).join(""));
      if (length >= chars.length) {
        // 다 쳤으면 잠깐 보여준 뒤 다음 문구로 (다음 tick에서 첫 글자부터 다시 친다)
        index = (index + 1) % phrases.length;
        length = 0;
        timer = setTimeout(tick, holdMs);
        return;
      }
      timer = setTimeout(tick, typeMs);
    };

    timer = setTimeout(tick, typeMs);
    return () => {
      clearTimeout(timer);
      setText("");
    };
  }, [enabled, phrases, typeMs, holdMs]);

  return enabled ? text : null;
}
