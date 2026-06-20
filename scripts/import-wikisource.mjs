import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API_URL = "https://zh.wikisource.org/w/api.php";
const USER_AGENT = "MingliClassics/0.4 (qq250113397@proton.me)";

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

const zhouyiHexagramNames = [
  "乾",
  "坤",
  "屯",
  "蒙",
  "需",
  "訟",
  "師",
  "比",
  "小畜",
  "履",
  "泰",
  "否",
  "同人",
  "大有",
  "謙",
  "豫",
  "隨",
  "蠱",
  "臨",
  "觀",
  "噬嗑",
  "賁",
  "剝",
  "復",
  "无妄",
  "大畜",
  "頤",
  "大過",
  "坎",
  "離",
  "咸",
  "恒",
  "遯",
  "大壯",
  "晉",
  "明夷",
  "家人",
  "睽",
  "蹇",
  "解",
  "損",
  "益",
  "夬",
  "姤",
  "萃",
  "升",
  "困",
  "井",
  "革",
  "鼎",
  "震",
  "艮",
  "漸",
  "歸妹",
  "豐",
  "旅",
  "巽",
  "兌",
  "渙",
  "節",
  "中孚",
  "小過",
  "既濟",
  "未濟",
];

const zhouyiHexagrams = zhouyiHexagramNames.map((name, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    page: `周易/${name}`,
    file: `yixue/zhouyi-${number}.md`,
    title: "周易",
    chapter: `第${index + 1}卦·${name}`,
    category: "易学卜筮",
    keywords: `周易,易经,六十四卦,${name},卦辞,爻辞`,
  };
});

const zhouyiCommentaries = [
  ["周易/彖", "彖传", "彖辞"],
  ["周易/大象", "大象传", "大象"],
  ["周易/小象", "小象传", "小象"],
  ["周易/文言", "文言传", "文言"],
  ["易傳/繫辭上", "系辞上传", "系辞"],
  ["易傳/繫辭下", "系辞下传", "系辞"],
  ["易傳/說卦", "说卦传", "说卦"],
  ["易傳/序卦", "序卦传", "序卦"],
  ["易傳/雜卦", "杂卦传", "杂卦"],
].map(([page, chapter, keyword], index) => ({
  page,
  file: `yixue/zhouyi-commentary-${String(index + 1).padStart(2, "0")}.md`,
  title: "周易",
  chapter,
  category: "易学卜筮",
  keywords: `周易,易传,十翼,${keyword}`,
}));

const zengshanChapterIds = [
  "序",
  ...Array.from({ length: 26 }, (_, index) => String(index + 1)),
  "15又",
  "26又1",
  "26又2",
  "26又3",
  "26又4",
];

const zengshanChapters = zengshanChapterIds.map((id) => ({
  page: `增刪卜易/${id}`,
  file: `yixue/zengshan-buyi-${id === "序" ? "xu" : id}.md`,
  title: "增删卜易",
  chapter: id === "序" ? "序" : `第${id}章`,
  category: "易学卜筮",
  keywords: "六爻,用神,世应,月建,日辰,占卜",
  // The first chapter is an intentionally short mnemonic table.
  minimumLength: id === "1" ? 30 : undefined,
}));

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
  ...zhouyiHexagrams,
  ...zhouyiCommentaries,
  ...zengshanChapters,
  {
    page: "卜筮正宗（河潞武子龄校本）/卷前",
    file: "yixue/bushi-zhengzong-juanqian.md",
    title: "卜筮正宗",
    chapter: "卷前",
    category: "易学卜筮",
    keywords: "六爻,卜筮,八卦,天干,地支,五行",
  },
];

function stripWikiMarkup(wikitext) {
  return wikitext
    .replace(/\{\{Textquality[^}]*\}\}\s*/gi, "")
    .replace(/^\{\{Header2?\b[\s\S]*?^\}\}\s*/gim, "")
    .replace(/<\/?onlyinclude>/gi, "")
    .replace(/<poem[^>]*>/gi, "")
    .replace(/<\/poem>/gi, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<ref[^/>]*\/>/gi, "")
    .replace(/\{\|[\s\S]*?\|\}/g, "")
    .replace(/\[\[(?:File|Image):[^\]]+\]\]/gi, "")
    .replace(/^(?:\*+#?|[:;]+)\s*/gm, "")
    .replace(/^=====\s*(.*?)\s*=====$/gm, "##### $1")
    .replace(/^====\s*(.*?)\s*====$/gm, "#### $1")
    .replace(/^===\s*(.*?)\s*===$/gm, "### $1")
    .replace(/^==\s*(.*?)\s*==$/gm, "## $1")
    .replace(/^=\s*(.*?)\s*=$/gm, "# $1")
    .replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/g, "$1")
    .replace(/-\{T\|[^}]+\}-\s*/g, "")
    .replace(/-\{([^}]+)\}-/g, "$1")
    .replace(/\{\{[^{}|]*\|(?:[^{}|]*\|)*([^{}|]+)\}\}/g, "$1")
    .replace(/\{\{[^{}]+\}\}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/'''([^'\n]+)\n'''/g, "**$1**\n")
    .replace(/'''([^'\n]+)'''/g, "**$1**")
    .replace(/''([^'\n]+)''/g, "*$1*")
    .replace(/'{2,}/g, "")
    .replace(/^Category:.*$/gim, "")
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

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${API_URL}?${params}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(
          `Wikisource returned HTTP ${response.status} for ${pageTitle}`,
        );
      }

      const payload = await response.json();
      const wikitext = payload?.parse?.wikitext;
      if (typeof wikitext !== "string") {
        throw new Error(`No wikitext returned for ${pageTitle}`);
      }
      return wikitext;
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
      console.warn(`Retrying ${pageTitle} after attempt ${attempt}`);
    }
  }

  throw new Error(`Unable to import ${pageTitle}`);
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
