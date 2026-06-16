import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stripLeakedCardSyntax } from "./chat-sanitize";

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
