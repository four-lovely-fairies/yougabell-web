import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
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
};

export function MarkdownMessage({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-sm leading-[1.4] text-[#242b37] break-words [overflow-wrap:anywhere]",
        className,
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </Markdown>
    </div>
  );
}
