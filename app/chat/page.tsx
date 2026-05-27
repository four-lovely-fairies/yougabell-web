"use client";

import { ArrowLeft, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { loadChat, streamChatMessage } from "@/lib/api";
import {
  QUICK_REPLIES,
  type ChatMessage as ChatMessageDto,
  type ChatMessageCard,
} from "@/lib/chat-data";

type LoadingMessage = { kind: "loading"; id: string };
type StreamingMessage = { kind: "streaming"; id: string; text: string };
type RenderedMessage =
  | ({ kind: "message" } & ChatMessageDto)
  | LoadingMessage
  | StreamingMessage;

// React Compiler가 컴포넌트 본문 안의 Date.now() 호출을 impure render hazard로 잡아서
// 모듈 스코프 헬퍼로 분리. analytics latency 측정 전용.
function nowMs(): number {
  return Date.now();
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<RenderedMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    track({ type: "chat_open" });
    let active = true;
    void loadChat().then((state) => {
      if (!active) return;
      const incoming: RenderedMessage[] = state.data.messages.map((m) => ({
        kind: "message",
        ...m,
      }));
      setMessages(incoming);
      if (state.source === "empty" && state.message) {
        setErrorBanner(state.message);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    const optimisticUserId = `local-u-${++idRef.current}`;
    const streamingId = `local-s-${++idRef.current}`;

    setMessages((prev) => [
      ...prev,
      {
        kind: "message",
        id: optimisticUserId,
        role: "user",
        content: text,
        sentAt: new Date().toISOString(),
        cards: [],
        sources: [],
      },
      { kind: "loading", id: streamingId },
    ]);
    setInput("");
    setBusy(true);
    setErrorBanner(null);
    track({ type: "chat_message_send", length: text.length });

    const sentAt = nowMs();
    let firstTokenLogged = false;

    await streamChatMessage(text, {
      onToken: (chunk) => {
        if (!firstTokenLogged) {
          firstTokenLogged = true;
          track({
            type: "chat_response_first_token",
            latencyMs: nowMs() - sentAt,
          });
        }
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== streamingId) return m;
            if (m.kind === "loading") {
              return { kind: "streaming", id: streamingId, text: chunk };
            }
            if (m.kind === "streaming") {
              return { ...m, text: m.text + chunk };
            }
            return m;
          }),
        );
      },
      onDone: (payload) => {
        track({
          type: "chat_response_complete",
          latencyMs: nowMs() - sentAt,
          cardCount: payload.cards.length,
          sourceCount: payload.sources.length,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId
              ? {
                  kind: "message",
                  id: payload.messageId,
                  role: "assistant",
                  content: payload.content,
                  sentAt: new Date().toISOString(),
                  cards: payload.cards,
                  sources: payload.sources,
                }
              : m,
          ),
        );
      },
      onError: (message) => {
        track({ type: "chat_response_error", reason: message });
        setMessages((prev) =>
          prev.filter((m) => m.id !== optimisticUserId && m.id !== streamingId),
        );
        setErrorBanner(message);
      },
    });
    setBusy(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-dvh flex-col bg-[#fdfdfe]">
      <header className="flex h-14 shrink-0 items-center justify-between px-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로"
          className="flex size-11 items-center justify-center text-[#262626]"
        >
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="text-base font-semibold leading-[1.4] text-[#191f28]">
          Ai 챗봇
        </h1>
        {/* Figma: 좌우 균형용 placeholder (close 아이콘은 opacity-0 자리만 차지) */}
        <span aria-hidden className="size-11" />
      </header>

      <p className="shrink-0 px-5 py-3 text-center text-[13px] font-medium leading-[1.4] tracking-[0.2522px] text-[#667080]">
        사용자의 행동 데이터와 패턴을 기반으로 대화합니다.
      </p>

      {errorBanner ? (
        <div className="shrink-0 px-5 pb-2">
          <p className="rounded-xl bg-[#fff1f2] px-4 py-2 text-xs leading-5 text-[#ec003f]">
            {errorBanner}
          </p>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        aria-live="polite"
      >
        {isEmpty ? <EmptyState /> : <MessageList messages={messages} />}
      </div>

      <div className="shrink-0 overflow-x-auto px-5 pt-4">
        <div className="flex gap-3">
          {QUICK_REPLIES.map((label) => (
            <button
              key={label}
              type="button"
              disabled={busy}
              onClick={() => {
                track({ type: "chat_quick_reply_use", label });
                void send(label);
              }}
              className="shrink-0 whitespace-nowrap rounded-full bg-[#f6f6f6] px-6 py-3.5 text-sm font-medium leading-[1.4] text-[#262626] disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center justify-between gap-2 rounded-[48px] bg-white px-5 py-3.5 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.04),0px_4px_24px_0px_rgba(0,0,0,0.04)]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="궁금한 점을 입력해주세요."
            disabled={busy}
            className="flex-1 bg-transparent text-sm leading-[1.4] text-[#262626] placeholder:text-[#9d9d9d] focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="전송"
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black text-white disabled:bg-[#c4c4c4]"
          >
            <ArrowUp className="size-5" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-9 px-5">
      {/* Figma: 1024x837 9등분 sprite에서 1칸만 노출 — w/h/offset은 Figma 절대값 */}
      <div className="relative size-30 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/chat/empty-mascot.png"
          alt=""
          aria-hidden
          className="absolute left-[-125.02%] top-[-220.04%] h-[320.45%] w-[339.56%] max-w-none"
        />
      </div>
      <p className="text-center text-lg font-bold leading-[1.4] text-[#262626]">
        궁금한점을 모두
        <br />
        물어보세요.
      </p>
    </div>
  );
}

function MessageList({ messages }: { messages: RenderedMessage[] }) {
  return (
    <div className="flex flex-col">
      {messages.map((m) => {
        if (m.kind === "loading") {
          return <LoadingBubble key={m.id} />;
        }
        if (m.kind === "streaming") {
          return <StreamingBubble key={m.id} text={m.text} />;
        }
        if (m.role === "user") {
          return <UserBubble key={m.id} content={m.content} />;
        }
        return (
          <AssistantBubble key={m.id} content={m.content} cards={m.cards} />
        );
      })}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end px-5 py-2.5">
      <div className="max-w-[260px] rounded-2xl bg-[#f6f6f6] px-4 py-3 text-sm leading-[1.4] text-[#262626]">
        {content}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex justify-start px-5 py-2.5">
      <div className="rounded-2xl bg-[#f5f1ff] px-4 py-3">
        <div className="flex h-[25px] w-[42px] items-center gap-[5.8px] pl-[5px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-[6.193px] animate-pulse rounded-full bg-[#a483ff]"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start px-5 py-2.5">
      <div className="w-[310px] rounded-2xl bg-[#f5f1ff] px-4 py-3">
        <p className="text-sm leading-[1.4] text-[#242b37]">
          {text}
          <span
            className="ml-0.5 inline-block size-[6.193px] animate-pulse rounded-full bg-[#a483ff] align-middle"
            aria-hidden
          />
        </p>
      </div>
    </div>
  );
}

function AssistantBubble({
  content,
  cards,
}: {
  content: string;
  cards: ChatMessageCard[];
}) {
  return (
    <div className="flex justify-start px-5 py-2.5">
      <div className="flex w-[310px] flex-col gap-5 rounded-2xl bg-[#f5f1ff] px-4 py-3">
        <p className="text-sm leading-[1.4] text-[#242b37]">{content}</p>
        {cards.length > 0 ? (
          <div className="flex flex-col gap-4">
            {cards
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((card) => (
                <div key={card.id} className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold leading-[1.4] text-[#262626]">
                    {card.title}
                  </h4>
                  <p className="text-sm leading-[1.4] text-[#4d4351]">
                    {card.body}
                  </p>
                </div>
              ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
