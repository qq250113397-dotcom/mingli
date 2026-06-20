export type ClassicCategory = "紫微斗数" | "四柱命理" | "易学卜筮";

export interface ClassicDocument {
  id: string;
  path: string;
  title: string;
  chapter: string;
  category: ClassicCategory;
  source: string;
  license: string;
  status: string;
  keywords: string[];
  body: string;
}

export interface ClassicSearchResult {
  document: ClassicDocument;
  score: number;
  excerpt: string;
}

const FRONTMATTER_PATTERN = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

function parseFrontmatter(rawFrontmatter: string): Record<string, string> {
  return Object.fromEntries(
    rawFrontmatter
      .split("\n")
      .map((line) => {
        const separator = line.indexOf(":");
        if (separator < 0) return null;

        const key = line.slice(0, separator).trim();
        const value = line
          .slice(separator + 1)
          .trim()
          .replace(/^["']|["']$/g, "");

        return key ? [key, value] : null;
      })
      .filter((entry): entry is [string, string] => entry !== null),
  );
}

function requireField(
  metadata: Record<string, string>,
  key: string,
  path: string,
): string {
  const value = metadata[key]?.trim();
  if (!value) {
    throw new Error(`古籍文件 ${path} 缺少 ${key} 信息。`);
  }
  return value;
}

function createExcerpt(body: string, query: string): string {
  const compactBody = body
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  const matchIndex = compactBody.toLocaleLowerCase().indexOf(query);

  if (matchIndex < 0) {
    return compactBody.slice(0, 110);
  }

  const start = Math.max(0, matchIndex - 36);
  const end = Math.min(compactBody.length, matchIndex + query.length + 72);
  return `${start > 0 ? "…" : ""}${compactBody.slice(start, end)}${
    end < compactBody.length ? "…" : ""
  }`;
}

export function parseClassicMarkdown(
  path: string,
  rawMarkdown: string,
): ClassicDocument {
  const frontmatterMatch = rawMarkdown.match(FRONTMATTER_PATTERN);
  if (!frontmatterMatch) {
    throw new Error(`古籍文件 ${path} 缺少开头的来源信息。`);
  }

  const metadata = parseFrontmatter(frontmatterMatch[1]);
  const category = requireField(metadata, "category", path);
  if (!["紫微斗数", "四柱命理", "易学卜筮"].includes(category)) {
    throw new Error(`古籍文件 ${path} 的 category 分类无法识别。`);
  }

  return {
    id: path.replace(/^.*content\/classics\//, "").replace(/\.md$/, ""),
    path,
    title: requireField(metadata, "title", path),
    chapter: requireField(metadata, "chapter", path),
    category: category as ClassicCategory,
    source: requireField(metadata, "source", path),
    license: requireField(metadata, "license", path),
    status: requireField(metadata, "status", path),
    keywords: (metadata.keywords ?? "")
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    body: rawMarkdown.slice(frontmatterMatch[0].length).trim(),
  };
}

export function searchClassics(
  documents: ClassicDocument[],
  rawQuery: string,
): ClassicSearchResult[] {
  const query = rawQuery.trim().toLocaleLowerCase();

  if (!query) {
    return documents
      .map((document) => ({
        document,
        score: 0,
        excerpt: createExcerpt(document.body, ""),
      }))
      .sort((left, right) =>
        `${left.document.title}${left.document.chapter}`.localeCompare(
          `${right.document.title}${right.document.chapter}`,
          "zh-CN",
        ),
      );
  }

  return documents
    .map((document) => {
      const title = document.title.toLocaleLowerCase();
      const chapter = document.chapter.toLocaleLowerCase();
      const keywords = document.keywords.join(" ").toLocaleLowerCase();
      const body = document.body.toLocaleLowerCase();
      let score = 0;

      if (title.includes(query)) score += 10;
      if (chapter.includes(query)) score += 7;
      if (keywords.includes(query)) score += 6;

      const bodyMatches = body.split(query).length - 1;
      score += Math.min(bodyMatches, 5);

      return {
        document,
        score,
        excerpt: createExcerpt(document.body, query),
      };
    })
    .filter((result) => result.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.document.title.localeCompare(right.document.title, "zh-CN"),
    );
}
