import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { stripLeakedCardSyntax } from "@/lib/chat-sanitize";
import { cn } from "@/lib/utils";

// 챗봇 본문 = 가벼운 마크다운 (굵게/기울임/짧은 목록/링크). DESIGN 토큰 색·타이포 유지.
// 헤딩·구분선·코드블록은 프롬프트에서 금지하지만, 새어나올 경우 대비해 본문 톤으로 다운그레이드.
const COMPONENTS: Components = {
  p: ({ children }) => <p className="[&+p]:mt-2">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-bold text-gray-800">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-1 list-disc space-y-0.5 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1 list-decimal space-y-0.5 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-[1.4]">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-info-700 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  // 금지 서식이 새어나오면 본문 단락 톤으로 흡수
  h1: ({ children }) => <p className="font-bold">{children}</p>,
  h2: ({ children }) => <p className="font-bold">{children}</p>,
  h3: ({ children }) => <p className="font-bold">{children}</p>,
  hr: () => null,
  code: ({ children }) => (
    <code className="rounded bg-[#ece4ff] px-1 py-0.5 text-[13px]">
      {children}
    </code>
  ),
  // 코드블록이 새어나오면 가로로 넘치지 않게 줄바꿈 허용 (white-space: pre 방지)
  pre: ({ children }) => (
    <pre className="my-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[13px]">
      {children}
    </pre>
  ),
};

export function MarkdownMessage({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  // 최후 방어 — 어시스턴트 본문 렌더의 단일 통로이므로, 여기서 누출 구조
  // 키워드(cards/type/content/items)를 한 번 더 걷어내면 스트리밍·영속·과거
  // 메시지 어떤 경로로 들어와도 화면에 절대 노출되지 않는다.
  const safe = stripLeakedCardSyntax(content);
  return (
    <div
      className={cn(
        "text-sm leading-[1.4] text-[#242b37] break-words [overflow-wrap:anywhere]",
        className,
      )}
    >
      {/* singleTilde:false — "11~14시간" 같은 범위 표기의 단일 ~를 취소선으로
          오인하지 않도록(GFM 기본은 단일 ~도 strikethrough 처리). */}
      <Markdown
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        components={COMPONENTS}
      >
        {safe}
      </Markdown>
    </div>
  );
}
