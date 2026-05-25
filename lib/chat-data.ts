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
