import { Mascot } from "@/components/characters/mascot";
import { MarkdownMessage } from "@/components/chat/markdown-message";
import { splitParagraphs, type ChatMessageCard } from "@/lib/chat-data";
import { stripLeakedCardSyntax } from "@/lib/chat-sanitize";
import { openExternalUrl } from "@/lib/native-bridge";

// 챗 응답 출처 (App Store 1.4.1 — 의료/건강 정보 출처 표기)
type ChatSource = {
  id: string;
  url: string;
  domain: string;
  title: string | null;
};

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-9 px-5">
      <Mascot pose="reviewing" className="w-30" />
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
      <div className="max-w-65 break-words [overflow-wrap:anywhere] rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-[1.4] text-gray-800">
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
  // 표시할 텍스트가 없으면(누출 절단으로 비었을 때 등) 빈 말풍선을 그리지 않는다.
  if (!text.trim()) {
    return null;
  }
  return (
    <div className="flex justify-start px-5 py-2.5">
      {/* max-w-full로 좁은 화면에서도 가로 넘침 방지(고정폭이 뷰포트를 넘지 않게) */}
      <div className="w-77.5 max-w-full min-w-0 rounded-2xl bg-[#f5f1ff] px-4 py-3">
        <MarkdownMessage content={text} />
      </div>
    </div>
  );
}

// 완료된 assistant 메시지 — 본문을 단락별 말풍선으로 분할, 카드는 마지막 말풍선에.
export function AssistantMessage({
  content,
  cards,
  sources = [],
}: {
  content: string;
  cards: ChatMessageCard[];
  sources?: ChatSource[];
}) {
  // 단락 분할 전에 누출 블록을 통째로 걷어낸다 — 누출만 든 단락이 빈 말풍선으로
  // 남는 것을 막는다(렌더 통로의 최후 방어는 MarkdownMessage가 한 번 더 수행).
  const paras = splitParagraphs(stripLeakedCardSyntax(content));

  // 내용도 카드도 출처도 없으면 아무것도 그리지 않는다 (빈 말풍선 방지).
  if (paras.length === 0 && cards.length === 0 && sources.length === 0) {
    return null;
  }

  // 본문은 비었지만 카드/출처가 있으면 그것만 담은 말풍선 하나.
  if (paras.length === 0) {
    return <AssistantBubble content="" cards={cards} sources={sources} />;
  }

  return (
    <>
      {paras.map((para, i) => {
        const isLast = i === paras.length - 1;
        return (
          <AssistantBubble
            key={i}
            content={para}
            cards={isLast ? cards : []}
            sources={isLast ? sources : []}
          />
        );
      })}
    </>
  );
}

export function AssistantBubble({
  content,
  cards,
  sources = [],
}: {
  content: string;
  cards: ChatMessageCard[];
  sources?: ChatSource[];
}) {
  const text = stripLeakedCardSyntax(content);
  const hasText = text.trim().length > 0;

  // 최후 방어 — 본문·카드·출처가 모두 없으면 빈 말풍선을 만들지 않는다.
  if (!hasText && cards.length === 0 && sources.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-start px-5 py-2.5">
      <div className="flex w-77.5 max-w-full min-w-0 flex-col gap-5 rounded-2xl bg-[#f5f1ff] px-4 py-3">
        {hasText ? <MarkdownMessage content={text} /> : null}
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
        {sources.length > 0 ? (
          <div className="flex flex-col gap-1.5 border-t border-[#e3d9ff] pt-3">
            <span className="text-xs font-bold leading-[1.4] text-gray-500">
              출처
            </span>
            <ul className="flex flex-col gap-1">
              {sources.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => openExternalUrl(s.url)}
                    className="text-left text-xs leading-[1.4] text-primary-400 underline [overflow-wrap:anywhere]"
                  >
                    {s.title ?? s.domain}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
