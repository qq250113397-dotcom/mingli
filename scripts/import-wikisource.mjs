import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API_URL = "https://zh.wikisource.org/w/api.php";
const USER_AGENT = "MingliClassics/0.1 (qq250113397@proton.me)";

const pages = [
  {
    page: "紫微斗數全書/卷一",
    file: "ziwei/ziwei-doushu-quanshu-1.md",
    title: "紫微斗数全书",
    chapter: "卷一",
    category: "紫微斗数",
    keywords: "紫微,天府,太微赋,形性赋,斗数准绳,斗数发微论",
  },
  {
    page: "紫微斗數全書/卷二",
    file: "ziwei/ziwei-doushu-quanshu-2.md",
    title: "紫微斗数全书",
    chapter: "卷二",
    category: "紫微斗数",
    keywords: "十二宫,命宫,兄弟宫,夫妻宫,子女宫,财帛宫,疾厄宫",
  },
  {
    page: "紫微斗數全書/卷三",
    file: "ziwei/ziwei-doushu-quanshu-3.md",
    title: "紫微斗数全书",
    chapter: "卷三",
    category: "紫微斗数",
    keywords: "星曜,紫微,天机,太阳,武曲,天同,廉贞,天府",
  },
  {
    page: "三命通會/卷一",
    file: "bazi/sanming-tonghui-1.md",
    title: "三命通会",
    chapter: "卷一",
    category: "四柱命理",
    keywords: "干支,五行,纳音,四柱,命理",
  },
  {
    page: "淵海子平",
    file: "bazi/yuanhai-ziping.md",
    title: "渊海子平",
    chapter: "全览",
    category: "四柱命理",
    keywords: "子平,十神,格局,五行,四柱,月令",
  },
  {
    page: "滴天髓/01",
    file: "bazi/ditiansui-01.md",
    title: "滴天髓",
    chapter: "第一篇",
    category: "四柱命理",
    keywords: "天道,地道,人道,干支,阴阳",
  },
  {
    page: "梅花易數/卷一",
    file: "yixue/meihua-yishu-1.md",
    title: "梅花易数",
    chapter: "卷一",
    category: "易学卜筮",
    keywords: "八卦,体用,起卦,象数,梅花",
  },
  {
    page: "增刪卜易/3",
    file: "yixue/zengshan-buyi-3.md",
    title: "增删卜易",
    chapter: "卷三",
    category: "易学卜筮",
    keywords: "六爻,用神,世应,月建,日辰",
  },
];

function stripWikiMarkup(wikitext) {
  return wikitext
    .replace(/\{\{Header2[\s\S]*?\}\}\s*/gi, "")
    .replace(/<\/?onlyinclude>/gi, "")
    .replace(/<poem[^>]*>/gi, "")
    .replace(/<\/poem>/gi, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<ref[^/>]*\/>/gi, "")
    .replace(/^=====\s*(.*?)\s*=====$/gm, "##### $1")
    .replace(/^====\s*(.*?)\s*====$/gm, "#### $1")
    .replace(/^===\s*(.*?)\s*===$/gm, "### $1")
    .replace(/^==\s*(.*?)\s*==$/gm, "## $1")
    .replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\{\{[^{}|]*\|(?:[^{}|]*\|)*([^{}|]+)\}\}/g, "$1")
    .replace(/\{\{[^{}]+\}\}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/'''([^']+)'''/g, "**$1**")
    .replace(/''([^']+)''/g, "*$1*")
    .replace(/^[*:;]+\s?/gm, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sourceUrl(pageTitle) {
  return `https://zh.wikisource.org/wiki/${encodeURIComponent(pageTitle).replaceAll("%2F", "/")}`;
}

async function fetchWikitext(pageTitle) {
  const params = new URLSearchParams({
    action: "parse",
    page: pageTitle,
    prop: "wikitext",
    format: "json",
    formatversion: "2",
  });
  const response = await fetch(`${API_URL}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Wikisource returned HTTP ${response.status} for ${pageTitle}`);
  }

  const payload = await response.json();
  const wikitext = payload?.parse?.wikitext;
  if (typeof wikitext !== "string") {
    throw new Error(`No wikitext returned for ${pageTitle}`);
  }
  return wikitext;
}

for (const item of pages) {
  const outputPath = path.resolve("content/classics", item.file);
  const body = stripWikiMarkup(await fetchWikitext(item.page));
  const markdown = `---
title: ${item.title}
chapter: ${item.chapter}
category: ${item.category}
source: ${sourceUrl(item.page)}
license: CC BY-SA 4.0
status: 维基文库版本，待逐字校勘
keywords: ${item.keywords}
---

> 文本来源：维基文库。原始古籍属于公有领域；本数字文本依维基文库 CC BY-SA 4.0 条款署名与同方式共享。

${body}
`;

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, markdown, "utf8");
  console.log(`Imported ${item.page} -> ${outputPath}`);
}
