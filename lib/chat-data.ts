import type { components } from "./generated/api-types";

export type ChatResponse = components["schemas"]["ChatResponseDto"];
export type ChatMessage = components["schemas"]["ChatMessageDto"];
export type ChatMessageCard = components["schemas"]["ChatMessageCardDto"];
export type ChatMessageSource = components["schemas"]["ChatMessageSourceDto"];
export type ChatSession = components["schemas"]["ChatSessionDto"];
export type SendChatMessageResponse =
  components["schemas"]["SendChatMessageResponseDto"];

export const QUICK_REPLIES = [
  "떼스는 아이 관리 및 교육법",
  "수면 조언",
  "Morning Routine",
] as const;

export const EMPTY_CHAT_RESPONSE: ChatResponse = {
  session: null,
  messages: [],
};

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
