import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stripLeakedCardSyntax, truncateAssistantLeak } from "./chat-sanitize";

void describe("stripLeakedCardSyntax", () => {
  void it("본문 맨 앞에서 시작하는 cards 블록을 통째로 제거한다", () => {
    const raw =
      "cards:\n  - type: info\n    title: 떼쓰는 아이 다루기 원칙\n    items:\n      - 차분하게 반응하기";
    assert.equal(stripLeakedCardSyntax(raw), "");
  });

  void it("본문 끝에 붙은 누출 블록만 제거하고 앞 본문은 남긴다", () => {
    const raw = "차근차근 이야기 나눠볼게요.\n\ntype: info\ntitle: 가이드";
    assert.equal(stripLeakedCardSyntax(raw), "차근차근 이야기 나눠볼게요.");
  });

  void it("items: 로 시작하는 누출 줄도 제거한다", () => {
    const raw = "오늘도 고생하셨어요.\n\nitems:\n  - 충분한 수면";
    assert.equal(stripLeakedCardSyntax(raw), "오늘도 고생하셨어요.");
  });

  void it('리스트 마커가 붙은 "- type:"·"- title:" 누출 줄도 제거한다', () => {
    const raw = "차분히 안아주세요.\n- type: info\n- title: 가이드";
    assert.equal(stripLeakedCardSyntax(raw), "차분히 안아주세요.");
  });

  void it("정상 본문은 그대로 둔다", () => {
    const raw =
      "성진님, 오늘도 차근차근 해봐요.\n\n조용한 공간으로 옮겨주세요.";
    assert.equal(stripLeakedCardSyntax(raw), raw);
  });

  void it("한글 콜론 표현은 그대로 둔다", () => {
    const raw = "정리하면 다음과 같아요: 첫째 차분히, 둘째 일관되게.";
    assert.equal(stripLeakedCardSyntax(raw), raw);
  });
});

// 2026-08-12 사고 회귀 — 모델이 시스템 프롬프트를 답변으로 되뱉어 사용자
// 화면에 3,718자가 노출됐다. 기존 마커(cards/type/content)로는 안 걸렸다.
// 이미 저장된 과거 메시지도 렌더 단계에서 걸러져야 한다.
void describe("stripLeakedCardSyntax — 시스템 프롬프트 되뱉음", () => {
  void it("[본문 작성 규칙] 섹션부터 끝까지 제거한다", () => {
    const raw =
      "오늘도 고생 많으셨어요.\n\n[본문 작성 규칙 — 매우 중요]\n- 본문은 한국어로 작성하며, 가벼운 마크다운을 쓸 수 있습니다.";
    assert.equal(stripLeakedCardSyntax(raw), "오늘도 고생 많으셨어요.");
  });

  void it("맨 앞부터 프롬프트면 빈 문자열이 된다 (말풍선 미표시)", () => {
    const raw = "[본문 작성 규칙 — 매우 중요]\n- 헤딩(#)은 사용하지 마세요.";
    assert.equal(stripLeakedCardSyntax(raw), "");
  });

  void it("[사용자 컨텍스트]·[원칙]·[답변 형식] 누출도 제거한다", () => {
    for (const marker of ["[사용자 컨텍스트]", "[원칙]", "[답변 형식]"]) {
      const raw = `괜찮아요.\n\n${marker}\n- 지시문`;
      assert.equal(stripLeakedCardSyntax(raw), "괜찮아요.", `marker=${marker}`);
    }
  });

  void it("정상 답변의 [참고 자료 N] 인용 표기는 건드리지 않는다", () => {
    const raw = "수면 루틴을 지켜주세요. [참고 자료 1]";
    assert.equal(stripLeakedCardSyntax(raw), raw);
  });
});

void describe("truncateAssistantLeak — 스트리밍 중 프롬프트 누출", () => {
  void it("스트리밍 도중 프롬프트 섹션이 나오면 그 앞까지만 보여준다", () => {
    const raw = "차분히 안아주세요.\n\n[본문 작성 규칙 — 매우 중요]\n- 본문은";
    assert.equal(truncateAssistantLeak(raw), "차분히 안아주세요.\n\n");
  });

  void it("정상 스트리밍 본문은 그대로 흘린다", () => {
    const raw = "오늘도 차근차근 해봐요.";
    assert.equal(truncateAssistantLeak(raw), raw);
  });
});
