"use client";

import { useEffect, useRef, useState } from "react";
import { truncateAssistantLeak } from "@/lib/chat-sanitize";

// 타자기 노출 속도 (글자당 ms). 네트워크 도착과 분리해 일정 속도로 흘려보낸다.
const REVEAL_MS = 22;
// 단락(\n\n) 사이 "..." 점 말풍선을 보여주는 의도적 딜레이.
const INTERLUDE_MS = 650;

export type LiveRender = {
  // 노출이 끝난 단락들 (각각 말풍선 1개)
  committedParas: string[];
  // 현재 타이핑 중인 단락 텍스트
  typingText: string;
  // loading: 첫 글자 전 / typing: 타이핑 중 / interlude: 단락 사이 점 표시
  phase: "loading" | "typing" | "interlude";
};

type Engine = {
  // raw: 도착한 토큰 누적 원본 / buffer: 누출 절단 후 실제 노출 대상
  raw: string;
  buffer: string;
  cursor: number;
  committedParas: string[];
  typingText: string;
  phase: LiveRender["phase"];
  done: boolean;
};

function freshEngine(): Engine {
  return {
    raw: "",
    buffer: "",
    cursor: 0,
    committedParas: [],
    typingText: "",
    phase: "loading",
    done: false,
  };
}

/**
 * 스트리밍 본문을 타자기처럼 노출하고, 빈 줄(\n\n) 단락 경계마다
 * 말풍선을 분할하며 사이에 "..." 점 + 딜레이를 넣는다.
 * onComplete: 애니메이션이 버퍼 끝까지 따라잡고 done이면 단락 배열로 호출.
 */
export function useChatTypewriter(onComplete: (parts: string[]) => void) {
  const engineRef = useRef<Engine>(freshEngine());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeRef = useRef(onComplete);
  const [live, setLive] = useState<LiveRender | null>(null);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function publish() {
    const e = engineRef.current;
    setLive({
      committedParas: [...e.committedParas],
      typingText: e.typingText,
      phase: e.phase,
    });
  }

  // 한 글자 노출 또는 단락/종료 처리를 1 step 진행 후 다음 step 예약.
  function tick() {
    const e = engineRef.current;

    // 버퍼를 다 따라잡음
    if (e.cursor >= e.buffer.length) {
      if (e.done) {
        const parts = [...e.committedParas];
        if (e.typingText.trim()) parts.push(e.typingText);
        clearTimer();
        engineRef.current = freshEngine();
        setLive(null);
        // 내용이 하나도 없으면 빈 배열로 완료 — 빈 단락([""])을 커밋하지 않는다.
        completeRef.current(parts);
        return;
      }
      // 아직 토큰이 더 올 수 있음 — 잠깐 쉬었다 재확인
      timerRef.current = setTimeout(tick, REVEAL_MS);
      return;
    }

    // 단락 경계(\n\n) — 현재 단락 확정 후 점 딜레이
    const rest = e.buffer.slice(e.cursor);
    const breakMatch = /^\n{2,}/.exec(rest);
    if (breakMatch) {
      e.cursor += breakMatch[0].length;
      if (e.typingText.trim()) e.committedParas.push(e.typingText);
      e.typingText = "";
      e.phase = "interlude";
      publish();
      timerRef.current = setTimeout(() => {
        engineRef.current.phase = "typing";
        publish();
        tick();
      }, INTERLUDE_MS);
      return;
    }

    // 한 글자 노출
    e.typingText += e.buffer[e.cursor];
    e.cursor += 1;
    if (e.phase !== "typing") e.phase = "typing";
    publish();
    timerRef.current = setTimeout(tick, REVEAL_MS);
  }

  function begin() {
    clearTimer();
    engineRef.current = freshEngine();
    setLive({ committedParas: [], typingText: "", phase: "loading" });
  }

  function pushToken(text: string) {
    const e = engineRef.current;
    e.raw += text;
    // 누출 구조(cards:/yaml/코드펜스)는 노출 대상에서 잘라낸다.
    e.buffer = truncateAssistantLeak(e.raw);
    if (e.cursor > e.buffer.length) e.cursor = e.buffer.length;
    // 노출 루프가 멈춰 있고(=타이머 없음) 보여줄 글자가 생겼으면 시작.
    // 스트리밍 중에는 tick이 스스로 재예약하므로 중복 시작되지 않는다.
    if (!timerRef.current && !e.done && e.cursor < e.buffer.length) {
      timerRef.current = setTimeout(tick, REVEAL_MS);
    }
  }

  function end() {
    engineRef.current.done = true;
    // 토큰이 한 번도 안 와 루프가 안 돌고 있으면 직접 마무리 틱을 건다.
    if (!timerRef.current) {
      timerRef.current = setTimeout(tick, REVEAL_MS);
    }
  }

  function cancel() {
    clearTimer();
    engineRef.current = freshEngine();
    setLive(null);
  }

  return { live, begin, pushToken, end, cancel };
}
