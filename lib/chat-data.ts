import type { components } from "./generated/api-types";

export type ChatResponse = components["schemas"]["ChatResponseDto"];
export type ChatMessage = components["schemas"]["ChatMessageDto"];
export type ChatMessageCard = components["schemas"]["ChatMessageCardDto"];
export type ChatMessageSource = components["schemas"]["ChatMessageSourceDto"];
export type ChatSession = components["schemas"]["ChatSessionDto"];

export const QUICK_REPLIES = [
  "떼스는 아이 관리 및 교육법",
  "수면 조언",
  "Morning Routine",
] as const;

export const EMPTY_CHAT_RESPONSE: ChatResponse = {
  session: null,
  messages: [],
};

/** 콜드 진입 시 초기에 보여줄 최근 메시지 개수 (나머지는 "이전 대화 더보기"). */
export const INITIAL_VISIBLE_MESSAGES = 4;

/** 본문을 빈 줄(\n\n) 기준 단락으로 분할 — 단락별 말풍선 렌더용. */
export function splitParagraphs(content: string): string[] {
  const parts = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [content];
}

/**
 * SSE 이벤트 — api `ChatStreamEvent`와 형태 일치 (codegen 대상 아님 — text/event-stream).
 */
export type ChatStreamTokenEvent = { type: "token"; data: { text: string } };

export type ChatStreamDoneEvent = {
  type: "done";
  data: {
    messageId: string;
    content: string;
    cards: ChatMessageCard[];
    sources: ChatMessageSource[];
  };
};

export type ChatStreamErrorEvent = {
  type: "error";
  data: { message: string };
};

export type ChatStreamEvent =
  | ChatStreamTokenEvent
  | ChatStreamDoneEvent
  | ChatStreamErrorEvent;
