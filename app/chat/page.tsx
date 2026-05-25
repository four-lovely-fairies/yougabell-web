"use client";

import { ArrowLeft, ArrowUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type AssistantCard = { title: string; body: string };

type ChatMessage =
  | { id: string; role: "user"; content: string }
  | {
      id: string;
      role: "assistant";
      content: string;
      cards?: AssistantCard[];
      trailing?: string;
    }
  | { id: string; role: "assistant"; loading: true };

const QUICK_REPLIES = [
  "떼스는 아이 관리 및 교육법",
  "수면 조언",
  "Morning Routine",
];

// Figma 채팅-03 (2395:12602) 데모 응답.
const DEMO_REPLY: Omit<
  Extract<ChatMessage, { role: "assistant"; content: string }>,
  "id" | "role"
> = {
  content:
    "그 '딱 하나만 더'라는 요청이 얼마나 진을 빼놓는지 저도 잘 알고 있습니다. 이건 아이들이 아주 흔히 겪는 단계이기도 하죠. 지금 아이는 잠들기 전 부모님과 더 연결되고 싶어 하면서, 동시에 규칙의 경계가 어디까지인지 시험해보고 있는 중입니다.",
  cards: [
    {
      title: "잠자리 티켓",
      body: "아이가 마지막으로 물을 마시거나 한 번 더 안아달라고 할 때 쓸 수 있는 '실물 티켓' 한 장을 주세요. 티켓을 사용하고 나면, 그 이후의 규칙은 아주 단호하게 지켜야 합니다.",
    },
    {
      title: "정서적 연결 고리",
      body: "본격적인 잠자리 루틴을 시작하기 전, 아이와 10분 정도 '특별한 시간'을 가져보세요. 아이의 정서적 허기를 미리 채워줌으로써 심리적인 안정감을 주는 방법입니다.",
    },
  ],
  trailing:
    "그 '딱 하나만 더'라는 요청이 얼마나 진을 빼놓는지 저도 잘 알고 있습니다. 이건 아이들이 아주 흔히 겪는 단계이기도 하죠. 지금 아이는 잠들기 전 부모님과 더 연결되고 싶어 하면서, 동시에 규칙의 경계가 어디까지인지 시험해보고 있는 중입니다.",
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    const userId = `u-${++idRef.current}`;
    const loadingId = `l-${++idRef.current}`;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: text },
      { id: loadingId, role: "assistant", loading: true },
    ]);
    setInput("");
    setBusy(true);

    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                id: loadingId,
                role: "assistant",
                content: DEMO_REPLY.content,
                cards: DEMO_REPLY.cards,
                trailing: DEMO_REPLY.trailing,
              }
            : m,
        ),
      );
      setBusy(false);
    }, 1500);
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
              onClick={() => send(label)}
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
            send(input);
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

function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      {messages.map((m) =>
        m.role === "user" ? (
          <UserBubble key={m.id} content={m.content} />
        ) : "loading" in m ? (
          <LoadingBubble key={m.id} />
        ) : (
          <AssistantBubble
            key={m.id}
            content={m.content}
            cards={m.cards}
            trailing={m.trailing}
          />
        ),
      )}
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

function AssistantBubble({
  content,
  cards,
  trailing,
}: {
  content: string;
  cards?: AssistantCard[];
  trailing?: string;
}) {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[310px] flex-col gap-4 rounded-2xl bg-[#f1eaff] px-4 py-3">
        <p className="text-sm leading-[1.5] text-gray-800">{content}</p>
        {cards && cards.length > 0 ? (
          <div className="flex flex-col gap-4 border-l-2 border-[#a483ff] pl-3">
            {cards.map((card) => (
              <div key={card.title} className="flex flex-col gap-1">
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
        {trailing ? (
          <p className="text-sm leading-[1.5] text-gray-800">{trailing}</p>
        ) : null}
      </div>
    </div>
  );
}
