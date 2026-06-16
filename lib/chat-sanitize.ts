// 챗 스트리밍 표시용 누출 절단.
//
// 서버는 모델 본문 끝에 가끔 새는 구조(`cards:` YAML, 코드펜스 등)를
// 저장·전송 직전 sanitizeAssistantContent로 제거한다(yougabell-api/chat.service.ts).
// 하지만 스트리밍은 raw 토큰을 그대로 타자기에 흘리므로, 정리 전 누출이
// 생성 중에 잠깐 노출된다(cards:·번호목록·코드블록이 한 줄로 화면을 넘침).
//
// 최종 본문은 done 이벤트의 서버 정리본으로 교체되므로, 여기서는 "표시 중
// 깨짐"만 막으면 된다 — 누출이 시작되는 첫 지점 앞까지만 잘라 보여준다.
const LEAK_MARKERS: RegExp[] = [
  /\n[ \t]*cards[ \t]*:/i,
  /\n[ \t]*type[ \t]*:/i,
  /\n[ \t]*content[ \t]*:/i,
  /```/,
];

/** 누출 구조가 시작되는 첫 지점 앞까지만 남긴다 (스트리밍 표시 전용). */
export function truncateAssistantLeak(raw: string): string {
  let cut = raw.length;
  for (const re of LEAK_MARKERS) {
    const m = re.exec(raw);
    if (m && m.index < cut) cut = m.index;
  }
  return raw.slice(0, cut);
}

// 렌더 직전 "최후 방어" — 실제 대화엔 절대 등장하지 않는 구조 키워드
// (cards/type/content/items)로 시작하는 줄부터 끝까지 제거한다.
// 서버 정리(yougabell-api sanitizeAssistantContent)가 누락하거나, 과거에 이미
// 누출된 채 저장된 메시지까지 표시 단계에서 한 번 더 막는다. 본문 맨 앞에서
// 시작하는 경우(^)도 포함.
const LEAK_BLOCK =
  /(?:^|\n)[ \t]*-?[ \t]*(?:cards|type|title|content|items)[ \t]*:[\s\S]*$/i;

export function stripLeakedCardSyntax(content: string): string {
  return content
    .replace(LEAK_BLOCK, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}
