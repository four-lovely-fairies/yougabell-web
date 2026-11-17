"use client";

import { MarkdownMessage } from "@/components/chat/markdown-message";
import { track } from "@/lib/analytics";
import type { ChatMessageCard } from "@/lib/chat-data";
import { stripLeakedCardSyntax } from "@/lib/chat-sanitize";
import { openExternalUrl } from "@/lib/native-bridge";
import { Link2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Figma 채팅 to-be (채팅 - 8 ~ 11).
// - 답변은 말풍선 없이 AI 아이콘 + 본문 한 덩어리 (단락마다 말풍선을 나누지 않는다)
// - 질문이 넓으면 서버가 follow_up 카드로 선택지를 내려주고, 누르면 그 문장으로 다시 질문한다
// - 답변 아래 "도움이 돼요 / 도움이 안돼요"

type ChatSource = {
  id: string;
  url: string;
  domain: string;
  title: string | null;
};

const AI_ICON = "/icons/figma/chat/ai-sparkle.svg";

// 빈 화면 인사말에서 돌아가며 보여 주는 고민 키워드
const GREETING_TOPICS = ["수면 고민", "떼쓰기 고민", "말 늦음 걱정", "식습관 고민"];

// 다른 부모님들이 많이 물어본 질문 (Figma 채팅 - 8)
export const SUGGESTED_QUESTIONS = [
  "밤에 자꾸 깨고, 재우기 힘들어요",
  "떼쓰는 아이, 어떻게 다뤄야 하나요?",
  "말이 늦은 것 같은데 괜찮을까요?",
  "이런 모습, 발달상 괜찮은 건가요?",
];

export function EmptyState({
  name,
  onPick,
  disabled,
}: {
  name: string;
  onPick: (question: string) => void;
  disabled?: boolean;
}) {
  const [topicIndex, setTopicIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setTopicIndex((i) => (i + 1) % GREETING_TOPICS.length),
      2800,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex h-full flex-col justify-end gap-7 px-5 pb-2">
      <div className="flex flex-col gap-1.5">
        <p className="text-xl font-bold leading-[1.4] tracking-[-0.4px] text-[#191f28]">
          안녕하세요, {name || "육아벨"}님!
        </p>
        <p className="flex items-center gap-2 text-xl font-bold leading-[1.4] tracking-[-0.4px] text-[#191f28]">
          <Image src={AI_ICON} alt="" width={24} height={24} />
          <span
            key={topicIndex}
            className="animate-dissolve text-primary-300 motion-reduce:animate-none"
            style={{ animationDuration: "500ms" }}
          >
            {GREETING_TOPICS[topicIndex]}
          </span>
          있으신가요?
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium leading-[1.4] text-[#99999e]">
          다른 부모님들이 많이 물어봤어요
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              disabled={disabled}
              onClick={() => onPick(question)}
              className="rounded-full bg-gray-50 px-4 py-2.5 text-left text-sm leading-[1.4] text-[#191f28] transition-colors active:bg-gray-100 disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end px-4 pb-1.5 pt-3.5">
      <div className="max-w-59 break-words rounded-[20px] bg-primary-300 px-3.5 py-2.5 text-sm leading-[1.4] text-white [overflow-wrap:anywhere]">
        {content}
      </div>
    </div>
  );
}

// 답변 생성 중 (Figma 채팅 - 9)
export function LoadingAnswer() {
  return (
    <div className="flex flex-col gap-3 px-4 pb-1.5 pt-5">
      <p className="flex items-center gap-1.5 text-sm leading-[1.4] text-[#99999e]">
        <Image src="/icons/figma/chat/ai-sparkle-small.svg" alt="" width={20} height={20} />
        우리 아이에게 맞는 방법을 찾고 있어요
      </p>
      <div className="relative flex flex-col gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#f3efff] to-[#eaf6ff] p-5">
        <span className="h-3 w-60 max-w-full rounded-md bg-white/70" />
        <span className="h-3 w-40 rounded-md bg-white/70" />
        <span
          aria-hidden
          className="skeleton pointer-events-none absolute inset-0 bg-transparent"
          style={{ backgroundColor: "transparent" }}
        />
      </div>
    </div>
  );
}

// 타이핑 중인 답변 — 완료 전까지 한 덩어리로 보여 준다.
export function StreamingAnswer({ text }: { text: string }) {
  if (!text.trim()) return <LoadingAnswer />;
  return (
    <div className="flex flex-col gap-3.5 px-4 pb-1.5 pt-5">
      <Image src={AI_ICON} alt="" width={24} height={24} />
      <div className="text-base leading-[1.6] text-gray-800">
        <MarkdownMessage content={text} className="!text-base !leading-[1.6] !text-gray-800" />
      </div>
    </div>
  );
}

// 완료된 답변 — 본문 + 선택지(follow_up) 또는 행동 카드 + 출처 + 피드백
export function AssistantMessage({
  messageId,
  content,
  cards,
  sources = [],
  onPickChoice,
  choicesDisabled,
}: {
  messageId: string;
  content: string;
  cards: ChatMessageCard[];
  sources?: ChatSource[];
  onPickChoice?: (choice: string) => void;
  choicesDisabled?: boolean;
}) {
  const text = stripLeakedCardSyntax(content).trim();
  const sorted = cards.slice().sort((a, b) => a.order - b.order);
  const choices = sorted.filter((card) => card.actionType === "follow_up");
  const actionCards = sorted.filter((card) => card.actionType !== "follow_up");

  if (!text && cards.length === 0 && sources.length === 0) return null;

  return (
    <div className="flex flex-col gap-3.5 px-4 pb-1.5 pt-5">
      <Image src={AI_ICON} alt="" width={24} height={24} />
      {text ? (
        <div className="text-base leading-[1.6] text-gray-800">
          <MarkdownMessage content={text} className="!text-base !leading-[1.6] !text-gray-800" />
        </div>
      ) : null}

      {choices.length > 0 ? (
        <div className="flex flex-col gap-2">
          {choices.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              disabled={choicesDisabled || !onPickChoice}
              onClick={() => onPickChoice?.(choice.title)}
              className="flex w-full items-center gap-2.5 rounded-2xl bg-[#f3f3f5] p-3.5 text-left transition-colors active:bg-[#e9e9ec] disabled:cursor-default"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-medium leading-[1.4] text-primary-300">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium leading-[1.4] text-gray-800">
                {choice.title}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {actionCards.length > 0 ? (
        <div className="flex flex-col gap-2">
          {actionCards.map((card) => (
            <div key={card.id} className="flex flex-col gap-1 rounded-2xl bg-[#f3f3f5] p-3.5">
              <p className="text-sm font-bold leading-[1.4] text-gray-800">{card.title}</p>
              {card.body ? (
                <p className="text-sm leading-[1.4] text-gray-600">{card.body}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {sources.length > 0 ? (
        // 출처는 한 줄 — 사이트 이름만 작은 칩으로, 여러 개면 옆으로 넘겨 본다 (긴 제목은 칩을 길게 눌렀을 때 title로)
        <div className="no-scrollbar -mx-4 flex items-center gap-1.5 overflow-x-auto px-4">
          <span className="shrink-0 text-xs font-medium leading-[1.4] text-gray-400">출처</span>
          {sources.map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.title ?? s.domain}
              aria-label={`출처 열기: ${s.title ?? s.domain}`}
              onClick={() => {
                track({ type: "chat_source_link_open", domain: s.domain });
                openExternalUrl(s.url);
              }}
              className="flex max-w-40 shrink-0 items-center gap-1 rounded-full border border-[#e5e5e7] bg-white px-2.5 py-1 text-xs leading-[1.4] text-gray-600 active:bg-gray-50"
            >
              <Link2 className="size-3 shrink-0 text-gray-400" aria-hidden />
              <span className="truncate">{s.domain.replace(/^www\./, "")}</span>
            </button>
          ))}
        </div>
      ) : null}

      <FeedbackButtons messageId={messageId} />
    </div>
  );
}

const FEEDBACK_KEY = "chat:feedback";

const readFeedback = (messageId: string): "up" | "down" | null => {
  try {
    const all = JSON.parse(window.localStorage.getItem(FEEDBACK_KEY) ?? "{}") as Record<string, "up" | "down">;
    return all[messageId] ?? null;
  } catch {
    return null;
  }
};

const writeFeedback = (messageId: string, value: "up" | "down") => {
  try {
    const all = JSON.parse(window.localStorage.getItem(FEEDBACK_KEY) ?? "{}") as Record<string, "up" | "down">;
    all[messageId] = value;
    window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
  } catch {
    // 저장 실패는 무시 — 다음에 다시 누를 수 있을 뿐
  }
};

// 도움이 돼요 / 안돼요 — 분석 이벤트로 남기고, 고른 값은 이 기기에 기억한다.
function FeedbackButtons({ messageId }: { messageId: string }) {
  const [value, setValue] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    const saved = readFeedback(messageId);
    if (saved) setValue(saved);
  }, [messageId]);

  const choose = (next: "up" | "down") => {
    if (value === next) return;
    setValue(next);
    writeFeedback(messageId, next);
    track({ type: "chat_feedback", helpful: next === "up" });
  };

  const button = (kind: "up" | "down", label: string) => {
    const selected = value === kind;
    return (
      <button
        type="button"
        onClick={() => choose(kind)}
        aria-pressed={selected}
        className={`flex items-center gap-1.5 rounded-full border py-2 pl-3 pr-3.5 text-sm leading-[1.4] transition-colors ${
          selected
            ? "border-primary-300 bg-primary-50 text-primary-400"
            : "border-[#e5e5e7] bg-white text-gray-600"
        }`}
      >
        <Image
          src={kind === "up" ? "/icons/figma/chat/thumb-up.svg" : "/icons/figma/chat/thumb-down.svg"}
          alt=""
          width={16}
          height={16}
        />
        {label}
      </button>
    );
  };

  return (
    <div className="flex gap-2">
      {button("up", "도움이 돼요")}
      {button("down", "도움이 안돼요")}
    </div>
  );
}
