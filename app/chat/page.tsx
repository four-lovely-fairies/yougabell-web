"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import {
  AssistantMessage,
  EmptyState,
  LoadingAnswer,
  StreamingAnswer,
  UserBubble,
} from "@/components/chat/message-bubbles";
import { useChatTypewriter } from "@/hooks/use-chat-typewriter";
import { track } from "@/lib/analytics";
import { useScreenPerformance } from "@/hooks/use-screen-performance";
import { api, loadChat, streamChatMessage } from "@/lib/api";
import {
  assistantHasRenderableContent,
  INITIAL_VISIBLE_MESSAGES,
  type ChatMessage as ChatMessageDto,
  type ChatMessageCard,
} from "@/lib/chat-data";

// React Compiler가 컴포넌트 본문 안의 Date.now() 호출을 impure render hazard로 잡아서
// 모듈 스코프 헬퍼로 분리. analytics latency 측정 전용.
function nowMs(): number {
  return Date.now();
}

const GRADIENT_BG =
  "linear-gradient(180deg, rgb(236, 228, 255) 0%, rgb(246, 242, 255) 25%, rgba(253, 253, 254, 0) 55%), linear-gradient(90deg, rgb(253, 253, 254) 0%, rgb(253, 253, 254) 100%)";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [historySource, setHistorySource] = useState<
    "pending" | "api" | "error"
  >("pending");
  useScreenPerformance("/chat", historySource);
  // 콜드 진입 시 접어둔 과거 메시지 (한 번 펼치면 비워짐)
  const hiddenHistoryRef = useRef<ChatMessageDto[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const suppressScrollRef = useRef(false);
  // 사용자가 바닥 근처를 보고 있을 때만 새 글을 따라 내려간다.
  // 답이 나오는 동안 위로 올려 읽으면 따라가기를 멈추고, 다시 바닥으로 내리면 이어서 따라간다.
  const followBottomRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
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
    // 서버 최종 본문이 비었거나 누출뿐이고 카드도 없으면 빈 답변이 되므로 커밋하지 않는다.
    if (
      done &&
      assistantHasRenderableContent(pendingContentRef.current, done.cards)
    ) {
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
      setHistorySource(state.source === "api" ? "api" : "error");
      // 과거에 빈/누출뿐인 채로 저장된 어시스턴트 메시지는 걸러낸다.
      const incoming = state.data.messages.filter(
        (m) =>
          m.role !== "assistant" ||
          assistantHasRenderableContent(m.content, m.cards),
      );
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
    // 인사말 이름 — 실패하면 기본 문구
    void api
      .getMe()
      .then((me) => {
        if (active) setName(me.name ?? "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (suppressScrollRef.current) {
      suppressScrollRef.current = false;
      return;
    }
    const scroller = scrollRef.current;
    if (!scroller || !followBottomRef.current) return;
    // 글자마다 부드러운 스크롤을 걸면 화면이 끌려가 손으로 움직일 수 없어 즉시 이동으로 유지한다.
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: "auto" });
  }, [messages, typewriter.live]);

  const onScroll = () => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    followBottomRef.current = distance < 80;
  };

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
    // 내가 보낸 메시지는 항상 보이도록 바닥 따라가기를 다시 켠다.
    followBottomRef.current = true;
    typewriter.begin();
    pendingContentRef.current = "";
    track({ type: "chat_message_send", length: text.length });

    sentAtRef.current = nowMs();
    let firstTokenLogged = false;
    const controller = new AbortController();
    abortRef.current = controller;

    await streamChatMessage(
      text,
      {
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
          // 서버 최종 본문으로 동기화 (선택지 블록 등이 정리된 본문)
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
      },
      controller.signal,
    );
    if (abortRef.current === controller) abortRef.current = null;
  };

  // 답변 중지 — 받던 연결을 끊고, 지금까지 나온 내용만 남긴다.
  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    const partial = pendingContentRef.current.replace(/\[\[[^\]]*$/, "").trim();
    typewriter.cancel();
    pendingDoneRef.current = null;
    if (partial) {
      setMessages((prev) => [
        ...prev,
        {
          id: `local-a-${++idRef.current}`,
          role: "assistant",
          content: partial,
          sentAt: new Date().toISOString(),
          cards: [],
          sources: [],
        },
      ]);
    }
    setBusy(false);
  };

  const isEmpty =
    messages.length === 0 && !typewriter.live && hiddenCount === 0;

  // 진행 중인 답변 — 노출 끝난 단락 + 타이핑 중 단락을 한 덩어리로
  const live = typewriter.live;
  const liveText = live
    ? [...live.committedParas, live.typingText].filter((p) => p.trim()).join("\n\n")
    : "";
  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <div
      className="flex h-dvh flex-col bg-gray-20"
      style={isEmpty ? { backgroundImage: GRADIENT_BG } : undefined}
    >
      <AppHeader title="Ai 챗봇" onBack={() => router.back()} className="!bg-transparent" />

      {errorBanner ? (
        <div className="shrink-0 px-5 pb-2">
          <p className="rounded-xl bg-error-50 px-4 py-2 text-xs leading-5 text-error-600">
            {errorBanner}
          </p>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto overscroll-contain"
        aria-live="polite"
      >
        {isEmpty ? (
          <EmptyState name={name} onPick={(q) => void send(q)} disabled={busy} />
        ) : (
          <div className="flex flex-col pb-4">
            {hiddenCount > 0 ? (
              <div className="flex justify-center px-5 py-3">
                <button
                  type="button"
                  onClick={revealHistory}
                  className="rounded-full bg-gray-50 px-4 py-2 text-xs font-medium leading-[1.4] text-gray-600"
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
                  messageId={m.id}
                  content={m.content}
                  cards={m.cards}
                  sources={m.sources}
                  // 선택지는 가장 최근 답변에서만 누를 수 있다 (지난 질문의 보기는 비활성)
                  onPickChoice={m.id === lastAssistantId ? (choice) => void send(choice) : undefined}
                  choicesDisabled={busy || m.id !== lastAssistantId}
                />
              ),
            )}

            {live ? (
              live.phase === "loading" && !liveText ? (
                <LoadingAnswer />
              ) : (
                <StreamingAnswer text={liveText} />
              )
            ) : null}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2.5 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex h-13 w-full items-center justify-between gap-2 rounded-[48px] bg-[#f3f3f5] py-2 pl-5 pr-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="궁금한 점을 질문해보세요"
            disabled={busy}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-[16px] leading-[1.4] text-gray-800 placeholder:text-sm placeholder:text-gray-400 focus:outline-none disabled:opacity-60"
          />
          {busy ? (
            <button
              type="button"
              onClick={stop}
              aria-label="답변 멈추기"
              className="flex size-9 shrink-0 items-center justify-center"
            >
              <span
                className="flex size-6 items-center justify-center rounded-full"
                style={{ backgroundImage: "linear-gradient(135deg, rgb(149,114,255) 25%, rgb(110,200,255) 75%)" }}
              >
                <span className="size-2.25 rounded-[2px] bg-white" />
              </span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="전송"
              className="flex size-9 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-40"
              style={{ backgroundImage: "linear-gradient(135deg, rgb(149,114,255) 25%, rgb(110,200,255) 75%)" }}
            >
              <Image src="/icons/figma/chat/arrow-up.svg" alt="" width={31} height={31} />
            </button>
          )}
        </form>
        <p className="text-center text-[11px] leading-[1.4] text-gray-400">
          AI는 실수를 할 수 있어요. 아이 건강은 꼭 전문가와 확인해 주세요.
        </p>
      </div>
    </div>
  );
}
