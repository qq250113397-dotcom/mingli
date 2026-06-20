import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API_URL = "https://zh.wikisource.org/w/api.php";
const USER_AGENT = "MingliClassics/0.3 (qq250113397@proton.me)";

const chineseNumbers = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
];

const sanmingVolumes = chineseNumbers.slice(0, 9).map((number, index) => ({
  page: `三命通會/卷${number}`,
  file: `bazi/sanming-tonghui-${index + 1}.md`,
  title: "三命通会",
  chapter: `卷${number}`,
  category: "四柱命理",
  keywords: "干支,五行,纳音,四柱,命理,格局",
}));

const ditianSuiChapters = chineseNumbers.map((number, index) => {
  const chapter = String(index + 1).padStart(2, "0");
  return {
    page: `滴天髓/${chapter}`,
    file: `bazi/ditiansui-${chapter}.md`,
    title: "滴天髓",
    chapter: `第${number}篇`,
    category: "四柱命理",
    keywords: "天道,地道,人道,干支,阴阳,五行",
  };
});

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
  ...sanmingVolumes,
  {
    page: "淵海子平",
    file: "bazi/yuanhai-ziping.md",
    title: "渊海子平",
    chapter: "全览",
    category: "四柱命理",
    keywords: "子平,十神,格局,五行,四柱,月令",
  },
  ...ditianSuiChapters,
  {
    page: "神峰通考",
    file: "bazi/shenfeng-tongkao.md",
    title: "神峰通考",
    chapter: "全览",
    category: "四柱命理",
    keywords: "子平,格局,病药,动静,六亲,五行",
  },
  {
    page: "五行精紀",
    file: "bazi/wuxing-jingji.md",
    title: "五行精纪",
    chapter: "全览",
    category: "四柱命理",
    keywords: "五行,纳音,禄命,干支,神煞",
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
    page: "梅花易數/卷二",
    file: "yixue/meihua-yishu-2.md",
    title: "梅花易数",
    chapter: "卷二",
    category: "易学卜筮",
    keywords: "八卦,体用,占验,象数,梅花",
  },
  {
    page: "梅花易數/卷三",
    file: "yixue/meihua-yishu-3.md",
    title: "梅花易数",
    chapter: "卷三",
    category: "易学卜筮",
    keywords: "八卦,体用,外应,占验,梅花",
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
    .replace(/\{\{Textquality[^}]*\}\}\s*/gi, "")
    .replace(/\{\{Header2?[\s\S]*?\}\}\s*/gi, "")
    .replace(/\{\{header[\s\S]*?\}\}\s*/gi, "")
    .replace(/<\/?onlyinclude>/gi, "")
    .replace(/<poem[^>]*>/gi, "")
    .replace(/<\/poem>/gi, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<ref[^/>]*\/>/gi, "")
    .replace(/\{\|[\s\S]*?\|\}/g, "")
    .replace(/^=====\s*(.*?)\s*=====$/gm, "##### $1")
    .replace(/^====\s*(.*?)\s*====$/gm, "#### $1")
    .replace(/^===\s*(.*?)\s*===$/gm, "### $1")
    .replace(/^==\s*(.*?)\s*==$/gm, "## $1")
    .replace(/^=\s*(.*?)\s*=$/gm, "# $1")
    .replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\{\{[^{}|]*\|(?:[^{}|]*\|)*([^{}|]+)\}\}/g, "$1")
    .replace(/\{\{[^{}]+\}\}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/'''([^']+)'''/g, "**$1**")
    .replace(/''([^']+)''/g, "*$1*")
    .replace(/^[*:;]+\s?/gm, "")
    .replace(/^notes=.*$/gm, "")
    .replace(/^\d+%\s*$/gm, "")
    .replace(/__TOC__/gi, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function validateBody(item, body) {
  const compactBody = body.replace(/\s+/g, "");
  const minimumLength = item.minimumLength ?? 120;

  if (/^#(?:重定向|redirect)/i.test(compactBody)) {
    throw new Error(`${item.page} is a redirect, not a classical-text body`);
  }

  if (compactBody.length < minimumLength) {
    throw new Error(
      `${item.page} only produced ${compactBody.length} characters; expected at least ${minimumLength}`,
    );
  }
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
  validateBody(item, body);
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
