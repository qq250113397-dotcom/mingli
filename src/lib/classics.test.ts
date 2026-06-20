import { describe, expect, it } from "vitest";
import { parseClassicMarkdown, searchClassics } from "./classics";

const sampleMarkdown = `---
title: 紫微斗数全书
chapter: 卷三·财帛宫论
category: 紫微斗数
source: https://zh.wikisource.org/wiki/紫微斗數全書/卷三
license: CC BY-SA 4.0
status: 已核对来源
keywords: 财帛宫,太阳,天府
---

# 财帛宫论

太阳入财帛宫，主财帛光明磊落。

天府临财帛，财源丰足。
`;

describe("parseClassicMarkdown", () => {
  it("extracts source metadata and searchable body text", () => {
    const document = parseClassicMarkdown(
      "content/classics/ziwei/quan-shu-3.md",
      sampleMarkdown,
    );

    expect(document.title).toBe("紫微斗数全书");
    expect(document.chapter).toBe("卷三·财帛宫论");
    expect(document.keywords).toEqual(["财帛宫", "太阳", "天府"]);
    expect(document.body).toContain("太阳入财帛宫");
    expect(document.source).toContain("zh.wikisource.org");
  });
});

describe("searchClassics", () => {
  it("ranks title and keyword matches ahead of body-only matches", () => {
    const keywordMatch = parseClassicMarkdown("keyword.md", sampleMarkdown);
    const bodyOnlyMatch = parseClassicMarkdown(
      "body.md",
      sampleMarkdown
        .replace("chapter: 卷三·财帛宫论", "chapter: 卷二·杂论")
        .replace("keywords: 财帛宫,太阳,天府", "keywords: 星曜")
        .replace("太阳入财帛宫", "太阳在此仅见于正文"),
    );

    const results = searchClassics([bodyOnlyMatch, keywordMatch], "太阳");

    expect(results).toHaveLength(2);
    expect(results[0].document.chapter).toBe("卷三·财帛宫论");
    expect(results[0].excerpt).toContain("太阳");
  });

  it("returns all documents for an empty query", () => {
    const document = parseClassicMarkdown("sample.md", sampleMarkdown);

    expect(searchClassics([document], "")).toHaveLength(1);
  });
});
