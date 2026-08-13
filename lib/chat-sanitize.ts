// 챗 스트리밍 표시용 누출 절단.
//
// 서버는 모델 본문 끝에 가끔 새는 구조(`cards:` YAML, 코드펜스 등)를
// 저장·전송 직전 sanitizeAssistantContent로 제거한다(yougabell-api/chat.service.ts).
// 하지만 스트리밍은 raw 토큰을 그대로 타자기에 흘리므로, 정리 전 누출이
// 생성 중에 잠깐 노출된다(cards:·번호목록·코드블록이 한 줄로 화면을 넘침).
//
// 최종 본문은 done 이벤트의 서버 정리본으로 교체되므로, 여기서는 "표시 중
// 깨짐"만 막으면 된다 — 누출이 시작되는 첫 지점 앞까지만 잘라 보여준다.
// 시스템 프롬프트 섹션 헤더 — 모델이 지시문을 답변으로 되뱉는 사고 대비.
// 2026-08-12 실제 발생 (assistant 3,718자 노출). 구조 키워드 마커로는 안 걸린다.
//
// ⚠️ api `ai/prompts/chat-system.ts`의 `SYSTEM_PROMPT_SECTION_MARKERS`와 동일 목록.
//    레포가 분리돼 import할 수 없으므로 수동 동기화한다 — 프롬프트에 섹션을
//    추가하면 양쪽 모두 갱신할 것.
// ⚠️ `[참고 자료]`는 제외 — 정상 답변의 인용 표기와 충돌해 본문이 통째로 잘린다.
const PROMPT_SECTION_MARKERS: RegExp[] = [
  /\[원칙\]/,
  /\[지식 베이스 인용 규칙\]/,
  /\[건강·의료 정보 규칙/,
  /\[본문 작성 규칙/,
  /\[사용자 컨텍스트\]/,
  /\[답변 형식\]/,
];

const LEAK_MARKERS: RegExp[] = [
  /\n[ \t]*cards[ \t]*:/i,
  /\n[ \t]*type[ \t]*:/i,
  /\n[ \t]*content[ \t]*:/i,
  /```/,
  ...PROMPT_SECTION_MARKERS,
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

/**
 * 렌더 직전 최후 방어. 구조 키워드 누출 + 시스템 프롬프트 되뱉음을 모두 막는다.
 *
 * 프롬프트 절단은 **이미 DB에 저장된 과거 메시지에도 소급 적용**된다 —
 * 2026-08-12에 누출된 채 저장된 메시지도 이 함수를 거치면 화면에 안 나온다.
 */
export function stripLeakedCardSyntax(content: string): string {
  let text = content;

  // 프롬프트 섹션이 시작되는 첫 지점부터 끝까지 제거 (앞의 정상 답변은 보존).
  let cut = text.length;
  for (const re of PROMPT_SECTION_MARKERS) {
    const m = re.exec(text);
    if (m && m.index < cut) cut = m.index;
  }
  text = text.slice(0, cut);

  return text
    .replace(LEAK_BLOCK, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}
