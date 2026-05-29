"use client";

import { ArrowLeft, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownMessage } from "@/components/chat/markdown-message";
import { useChatTypewriter } from "@/hooks/use-chat-typewriter";
import { track } from "@/lib/analytics";
import { loadChat, streamChatMessage } from "@/lib/api";
import {
  INITIAL_VISIBLE_MESSAGES,
  QUICK_REPLIES,
  splitParagraphs,
  type ChatMessage as ChatMessageDto,
  type ChatMessageCard,
} from "@/lib/chat-data";

// React Compiler가 컴포넌트 본문 안의 Date.now() 호출을 impure render hazard로 잡아서
// 모듈 스코프 헬퍼로 분리. analytics latency 측정 전용.
function nowMs(): number {
  return Date.now();
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  // 콜드 진입 시 접어둔 과거 메시지 (한 번 펼치면 비워짐)
  const hiddenHistoryRef = useRef<ChatMessageDto[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const suppressScrollRef = useRef(false);
  const idRef = useRef(0);
  // onDone에서 받은 최종 메시지 데이터 — 타자기 애니메이션 완료 시 커밋에 사용
  const pendingDoneRef = useRef<{
    messageId: string;
    cards: ChatMessageCard[];
    sources: ChatMessageDto["sources"];
  } | null>(null);
  const sentAtRef = useRef(0);
  const pendingContentRef = useRef("");

  const onTurnComplete = useCallback(() => {
    const done = pendingDoneRef.current;
    pendingDoneRef.current = null;
    if (done) {
      setMessages((prev) => [
        ...prev,
        {
          id: done.messageId,
          role: "assistant",
          content: pendingContentRef.current,
          sentAt: new Date().toISOString(),
          cards: done.cards,
          sources: done.sources,
        },
      ]);
    }
    setBusy(false);
  }, []);

  const typewriter = useChatTypewriter(onTurnComplete);

  useEffect(() => {
    track({ type: "chat_open" });
    let active = true;
    void loadChat().then((state) => {
      if (!active) return;
      const incoming = state.data.messages;
      // 콜드 진입 — 최근 N개만 노출, 나머지는 접어둠 (스크롤 점프 최소화)
      if (incoming.length > INITIAL_VISIBLE_MESSAGES) {
        hiddenHistoryRef.current = incoming.slice(
          0,
          incoming.length - INITIAL_VISIBLE_MESSAGES,
        );
        setHiddenCount(hiddenHistoryRef.current.length);
        setMessages(incoming.slice(-INITIAL_VISIBLE_MESSAGES));
      } else {
        setMessages(incoming);
      }
      if (state.source === "empty" && state.message) {
        setErrorBanner(state.message);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (suppressScrollRef.current) {
      suppressScrollRef.current = false;
      return;
    }
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typewriter.live]);

  const revealHistory = () => {
    suppressScrollRef.current = true; // 과거를 위로 펼칠 때는 바닥으로 점프 X
    setMessages((prev) => [...hiddenHistoryRef.current, ...prev]);
    hiddenHistoryRef.current = [];
    setHiddenCount(0);
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    const optimisticUserId = `local-u-${++idRef.current}`;

    setMessages((prev) => [
      ...prev,
      {
        id: optimisticUserId,
        role: "user",
        content: text,
        sentAt: new Date().toISOString(),
        cards: [],
        sources: [],
      },
    ]);
    setInput("");
    setBusy(true);
    setErrorBanner(null);
    typewriter.begin();
    pendingContentRef.current = "";
    track({ type: "chat_message_send", length: text.length });

    sentAtRef.current = nowMs();
    let firstTokenLogged = false;

    await streamChatMessage(text, {
      onToken: (chunk) => {
        if (!firstTokenLogged) {
          firstTokenLogged = true;
          track({
            type: "chat_response_first_token",
            latencyMs: nowMs() - sentAtRef.current,
          });
        }
        pendingContentRef.current += chunk;
        typewriter.pushToken(chunk);
      },
      onDone: (payload) => {
        track({
          type: "chat_response_complete",
          latencyMs: nowMs() - sentAtRef.current,
          cardCount: payload.cards.length,
          sourceCount: payload.sources.length,
        });
        // 서버 최종 본문으로 동기화 (스트림 청크 합과 동일하지만 안전하게)
        pendingContentRef.current = payload.content;
        pendingDoneRef.current = {
          messageId: payload.messageId,
          cards: payload.cards,
          sources: payload.sources,
        };
        typewriter.end();
      },
      onError: (message) => {
        track({ type: "chat_response_error", reason: message });
        typewriter.cancel();
        pendingDoneRef.current = null;
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUserId));
        setErrorBanner(message);
        setBusy(false);
      },
    });
  };

  const isEmpty =
    messages.length === 0 && !typewriter.live && hiddenCount === 0;

  // 진행 중인 assistant 턴 — 노출 끝난 단락 + (타이핑 | 단락 사이 점)
  const live = typewriter.live;
  const showLiveDots =
    !!live &&
    (live.phase === "loading" ||
      live.phase === "interlude" ||
      (live.phase === "typing" && live.typingText.length === 0));
  const liveBubbles = live ? (
    <>
      {live.committedParas.map((para, i) => (
        <AssistantBubble key={`live-${i}`} content={para} cards={[]} />
      ))}
      {showLiveDots ? (
        <LoadingBubble />
      ) : (
        <StreamingBubble text={live.typingText} />
      )}
    </>
  ) : null;

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
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col">
            {hiddenCount > 0 ? (
              <div className="flex justify-center px-5 py-3">
                <button
                  type="button"
                  onClick={revealHistory}
                  className="rounded-full bg-[#f6f6f6] px-4 py-2 text-xs font-medium leading-[1.4] text-[#555555]"
                >
                  이전 대화 {hiddenCount}개 더보기
                </button>
              </div>
            ) : null}

            {messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} content={m.content} />
              ) : (
                <AssistantMessage
                  key={m.id}
                  content={m.content}
                  cards={m.cards}
                />
              ),
            )}

            {liveBubbles}
          </div>
        )}
      </div>

      <div className="shrink-0 overflow-x-auto px-5 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        <MarkdownMessage content={text} />
      </div>
    </div>
  );
}

// 완료된 assistant 메시지 — 본문을 단락별 말풍선으로 분할, 카드는 마지막 말풍선에.
function AssistantMessage({
  content,
  cards,
}: {
  content: string;
  cards: ChatMessageCard[];
}) {
  const paras = splitParagraphs(content);
  return (
    <>
      {paras.map((para, i) => (
        <AssistantBubble
          key={i}
          content={para}
          cards={i === paras.length - 1 ? cards : []}
        />
      ))}
    </>
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
        <MarkdownMessage content={content} />
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
