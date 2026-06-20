import { parseClassicMarkdown } from "./classics";

const markdownFiles = import.meta.glob("../../content/classics/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

export const CLASSIC_DOCUMENTS = Object.entries(markdownFiles)
  .map(([path, rawMarkdown]) => parseClassicMarkdown(path, rawMarkdown))
  .sort(
    (left, right) =>
      left.category.localeCompare(right.category, "zh-CN") ||
      left.title.localeCompare(right.title, "zh-CN") ||
      left.chapter.localeCompare(right.chapter, "zh-CN"),
  );
