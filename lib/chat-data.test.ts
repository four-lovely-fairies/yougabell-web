import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assistantHasRenderableContent, splitParagraphs } from "./chat-data";

void describe("splitParagraphs", () => {
  void it("빈 문자열은 빈 배열을 반환한다 (빈 말풍선 방지)", () => {
    assert.deepEqual(splitParagraphs(""), []);
  });

  void it("공백·개행뿐인 본문도 빈 배열", () => {
    assert.deepEqual(splitParagraphs("   \n\n  \n "), []);
  });

  void it("단일 단락은 트림해 1개로", () => {
    assert.deepEqual(splitParagraphs("  안녕하세요  "), ["안녕하세요"]);
  });

  void it("빈 줄 경계로 단락을 나누고 빈 단락은 제거한다", () => {
    assert.deepEqual(splitParagraphs("첫째.\n\n\n둘째.\n\n"), [
      "첫째.",
      "둘째.",
    ]);
  });
});

void describe("assistantHasRenderableContent", () => {
  void it("본문이 있으면 true", () => {
    assert.equal(assistantHasRenderableContent("도움이 될게요.", []), true);
  });

  void it("본문이 비면 false", () => {
    assert.equal(assistantHasRenderableContent("", []), false);
    assert.equal(assistantHasRenderableContent("   \n ", []), false);
  });

  void it("누출뿐인 본문은 제거 후 false", () => {
    assert.equal(
      assistantHasRenderableContent("cards:\n  - type: info", []),
      false,
    );
  });

  void it("본문은 없어도 카드가 있으면 true", () => {
    assert.equal(
      assistantHasRenderableContent("", [
        { id: "c1", order: 0, title: "제목", body: "내용" },
      ] as never),
      true,
    );
  });
});
