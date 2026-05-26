"use client";

import { ArrowLeft, ArrowUp, X } from "lucide-react";
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

// React Compiler가 컴포넌트 본문 안의 nowMs() 호출을 impure render hazard로 잡아서
// 모듈 스코프 헬퍼로 분리. analytics latency 측정 전용.
function nowMs(): number {
  return nowMs();
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
            // loading → streaming 으로 전환하며 첫 청크 누적
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
        // streaming bubble을 영속화된 assistant 메시지로 교체.
        // 낙관적 user bubble은 그대로 유지 (서버 user 메시지는 별도 fetch X — 일치 가정).
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
          prev.filter(
            (m) => m.id !== optimisticUserId && m.id !== streamingId,
          ),
        );
        setErrorBanner(message);
      },
    });
    setBusy(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-dvh flex-col">
      {/* Figma 2395:13021 Sub LNB — h-56, px-16 */}
      <header className="flex h-14 shrink-0 items-center px-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로"
          className="flex size-11 items-center justify-center text-gray-700"
        >
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          Ai 챗봇
        </h1>
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="닫기"
          className="flex size-11 items-center justify-center text-gray-700"
        >
          <X className="size-6" />
        </button>
      </header>

      {/* Figma 2395:13019 부제 — h-42, pt-12 */}
      <p className="shrink-0 px-4 py-3 text-center text-sm leading-[1.4] text-gray-500">
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
        className="flex-1 overflow-y-auto px-5"
        aria-live="polite"
      >
        {isEmpty ? <EmptyState /> : <MessageList messages={messages} />}
      </div>

      {/* Quick replies — Figma 2396:4751 */}
      <div className="shrink-0 overflow-x-auto px-5 py-4">
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
              className="h-12 shrink-0 rounded-full border border-gray-200 px-6 text-sm font-medium leading-[1.4] text-gray-800 disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input — Figma 2395:13142 */}
      <div className="shrink-0 px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex h-13 items-center gap-2 rounded-full bg-[#f6f6f6] pl-5 pr-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="궁금한 점을 입력해주세요."
            disabled={busy}
            className="h-full flex-1 bg-transparent text-sm leading-[1.4] text-gray-800 placeholder:text-gray-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="전송"
            className="flex size-9 items-center justify-center rounded-full bg-gray-800 text-white disabled:bg-gray-300"
          >
            <ArrowUp className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 pb-10">
      {/* Figma 2396:5003 — image 599 마스코트 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/chat/empty-mascot.png"
        alt=""
        aria-hidden
        className="h-30 w-30 object-contain"
      />
      <p className="text-center text-lg font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
        궁금한점을 모두
        <br />
        물어보세요.
      </p>
    </div>
  );
}

function MessageList({ messages }: { messages: RenderedMessage[] }) {
  return (
    <div className="flex flex-col gap-4 pb-4">
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
    <div className="flex justify-end">
      <div className="max-w-[260px] rounded-2xl bg-[#f1eaff] px-4 py-3 text-sm leading-[1.5] text-gray-800">
        {content}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl bg-[#f1eaff] px-5 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-pulse rounded-full bg-[#a483ff]"
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
    <div className="flex justify-start">
      <div className="max-w-[310px] rounded-2xl bg-[#f1eaff] px-4 py-3">
        <p className="text-sm leading-[1.5] text-gray-800">
          {text}
          <span
            className="ml-0.5 inline-block size-1.5 animate-pulse rounded-full bg-[#a483ff] align-middle"
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
    <div className="flex justify-start">
      <div className="flex max-w-[310px] flex-col gap-4 rounded-2xl bg-[#f1eaff] px-4 py-3">
        <p className="text-sm leading-[1.5] text-gray-800">{content}</p>
        {cards.length > 0 ? (
          <div className="flex flex-col gap-4 border-l-2 border-[#a483ff] pl-3">
            {cards
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((card) => (
                <div key={card.id} className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold leading-[1.4] text-gray-800">
                    {card.title}
                  </h4>
                  <p className="text-sm leading-[1.5] text-gray-800">
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
