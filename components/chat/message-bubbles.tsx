import { MarkdownMessage } from "@/components/chat/markdown-message";
import { splitParagraphs, type ChatMessageCard } from "@/lib/chat-data";

export function EmptyState() {
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
      <p className="text-center text-lg font-bold leading-[1.4] text-gray-800">
        궁금한점을 모두
        <br />
        물어보세요.
      </p>
    </div>
  );
}

export function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end px-5 py-2.5">
      <div className="max-w-65 rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-[1.4] text-gray-800">
        {content}
      </div>
    </div>
  );
}

export function LoadingBubble() {
  return (
    <div className="flex justify-start px-5 py-2.5">
      <div className="rounded-2xl bg-[#f5f1ff] px-4 py-3">
        <div className="flex h-6.25 w-10.5 items-center gap-[5.8px] pl-1.25">
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

export function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start px-5 py-2.5">
      <div className="w-77.5 rounded-2xl bg-[#f5f1ff] px-4 py-3">
        <MarkdownMessage content={text} />
      </div>
    </div>
  );
}

// 완료된 assistant 메시지 — 본문을 단락별 말풍선으로 분할, 카드는 마지막 말풍선에.
export function AssistantMessage({
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

export function AssistantBubble({
  content,
  cards,
}: {
  content: string;
  cards: ChatMessageCard[];
}) {
  return (
    <div className="flex justify-start px-5 py-2.5">
      <div className="flex w-77.5 flex-col gap-5 rounded-2xl bg-[#f5f1ff] px-4 py-3">
        <MarkdownMessage content={content} />
        {cards.length > 0 ? (
          <div className="flex flex-col gap-4">
            {cards
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((card) => (
                <div key={card.id} className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold leading-[1.4] text-gray-800">
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
