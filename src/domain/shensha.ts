const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];
const PILLAR_LABELS = ["年柱", "月柱", "日柱", "时柱"] as const;
const SIXTY_PILLARS = Array.from(
  { length: 60 },
  (_, index) => `${STEMS[index % 10]}${BRANCHES[index % 12]}`,
);

export type ShenshaGender = "男" | "女";
export type ShenshaCategory =
  | "贵人与文教"
  | "月令德曜"
  | "行旅与年神"
  | "日时专煞"
  | "刑冲杂煞";

export const SHENSHA_CATEGORY_ORDER: ShenshaCategory[] = [
  "贵人与文教",
  "月令德曜",
  "行旅与年神",
  "日时专煞",
  "刑冲杂煞",
];

export interface ShenshaPillar {
  label: (typeof PILLAR_LABELS)[number];
  value: string;
  stem: string;
  branch: string;
}

export interface ShenshaSource {
  title: "三命通会" | "渊海子平" | "五行精纪";
  chapter: string;
  url: string;
  documentId: string;
}

export interface ShenshaHit {
  name: string;
  category: ShenshaCategory;
  targetValues: string[];
  matches: string[];
  basis: string[];
  source: ShenshaSource;
  commentary: ShenshaCommentary;
}

export interface ShenshaResult {
  pillars: ShenshaPillar[];
  hits: ShenshaHit[];
  voidBranches: [string, string];
  checkedRuleCount: number;
}

const SANMING_VOLUME_2 =
  "https://zh.wikisource.org/wiki/三命通會/卷二";
const SANMING_VOLUME_3 =
  "https://zh.wikisource.org/wiki/三命通會/卷三";
const YUANHAI_ZIPING = "https://zh.wikisource.org/wiki/淵海子平";
const WUXING_JINGJI = "https://zh.wikisource.org/wiki/五行精紀";

const DAY_STEM_BRANCH_RULES: Array<{
  name: string;
  targets: Record<string, string[]>;
  chapter: string;
  category: ShenshaCategory;
}> = [
  {
    name: "天乙贵人",
    targets: {
      甲: ["丑", "未"],
      乙: ["子", "申"],
      丙: ["酉", "亥"],
      丁: ["酉", "亥"],
      戊: ["丑", "未"],
      己: ["子", "申"],
      庚: ["丑", "未"],
      辛: ["寅", "午"],
      壬: ["卯", "巳"],
      癸: ["卯", "巳"],
    },
    chapter: "论天乙贵人",
    category: "贵人与文教",
  },
  {
    name: "文昌贵",
    targets: {
      甲: ["巳"],
      乙: ["亥"],
      丙: ["戌"],
      丁: ["辰"],
      戊: ["申"],
      己: ["午"],
      庚: ["寅"],
      辛: ["未"],
      壬: ["卯"],
      癸: ["丑"],
    },
    chapter: "论太极贵·文昌贵",
    category: "贵人与文教",
  },
  {
    name: "禄神",
    targets: {
      甲: ["寅"],
      乙: ["卯"],
      丙: ["巳"],
      丁: ["午"],
      戊: ["巳"],
      己: ["午"],
      庚: ["申"],
      辛: ["酉"],
      壬: ["亥"],
      癸: ["子"],
    },
    chapter: "论十干禄",
    category: "贵人与文教",
  },
  {
    name: "金舆",
    targets: {
      甲: ["辰"],
      乙: ["巳"],
      丙: ["未"],
      丁: ["申"],
      戊: ["未"],
      己: ["申"],
      庚: ["戌"],
      辛: ["亥"],
      壬: ["丑"],
      癸: ["寅"],
    },
    chapter: "论金舆",
    category: "贵人与文教",
  },
  {
    name: "太极贵人",
    targets: {
      甲: ["子", "午"],
      乙: ["子", "午"],
      丙: ["卯", "酉"],
      丁: ["卯", "酉"],
      戊: ["辰", "戌", "丑", "未"],
      己: ["辰", "戌", "丑", "未"],
      庚: ["寅", "亥"],
      辛: ["寅", "亥"],
      壬: ["巳", "申"],
      癸: ["巳", "申"],
    },
    chapter: "论太极贵",
    category: "贵人与文教",
  },
  {
    name: "文星贵",
    targets: {
      甲: ["午"],
      乙: ["巳"],
      丙: ["申"],
      丁: ["酉"],
      戊: ["申"],
      己: ["酉"],
      庚: ["戌"],
      辛: ["亥"],
      壬: ["寅"],
      癸: ["卯"],
    },
    chapter: "论太极贵·文星贵",
    category: "贵人与文教",
  },
  {
    name: "天印贵",
    targets: {
      甲: ["寅"],
      乙: ["亥"],
      丙: ["戌"],
      丁: ["酉"],
      戊: ["申"],
      己: ["未"],
      庚: ["午"],
      辛: ["巳"],
      壬: ["辰"],
      癸: ["卯"],
    },
    chapter: "论太极贵·天印贵",
    category: "贵人与文教",
  },
  {
    name: "学堂",
    targets: {
      甲: ["亥"],
      乙: ["亥"],
      丙: ["寅"],
      丁: ["寅"],
      戊: ["申"],
      己: ["申"],
      庚: ["巳"],
      辛: ["巳"],
      壬: ["申"],
      癸: ["申"],
    },
    chapter: "论学堂词馆",
    category: "贵人与文教",
  },
  {
    name: "词馆",
    targets: {
      甲: ["寅"],
      乙: ["寅"],
      丙: ["巳"],
      丁: ["巳"],
      戊: ["亥"],
      己: ["亥"],
      庚: ["申"],
      辛: ["申"],
      壬: ["亥"],
      癸: ["亥"],
    },
    chapter: "论学堂词馆",
    category: "贵人与文教",
  },
  {
    name: "红艳煞",
    targets: {
      甲: ["午"],
      乙: ["午"],
      丙: ["寅"],
      丁: ["未"],
      戊: ["子"],
      己: ["辰"],
      庚: ["戌"],
      辛: ["酉"],
      壬: ["巳"],
      癸: ["申"],
    },
    chapter: "总论诸神煞·桃花红艳煞",
    category: "刑冲杂煞",
  },
  {
    name: "飞刃",
    targets: {
      甲: ["酉"],
      乙: ["戌"],
      丙: ["子"],
      丁: ["丑"],
      戊: ["子"],
      己: ["丑"],
      庚: ["卯"],
      辛: ["辰"],
      壬: ["午"],
      癸: ["未"],
    },
    chapter: "论羊刃·飞刃",
    category: "刑冲杂煞",
  },
];

const YANG_BLADE_TARGETS: Record<string, string[]> = {
  甲: ["卯"],
  丙: ["午"],
  戊: ["午"],
  庚: ["酉"],
  壬: ["子"],
};

const THREE_HARMONY_RULES: Array<{
  name: string;
  targets: Record<string, string>;
  chapter: string;
  category: ShenshaCategory;
  sourceVolume: 2 | 3;
}> = [
  {
    name: "驿马",
    targets: { 寅午戌: "申", 申子辰: "寅", 巳酉丑: "亥", 亥卯未: "巳" },
    chapter: "论驿马",
    category: "行旅与年神",
    sourceVolume: 3,
  },
  {
    name: "咸池",
    targets: { 寅午戌: "卯", 巳酉丑: "午", 申子辰: "酉", 亥卯未: "子" },
    chapter: "论咸池",
    category: "刑冲杂煞",
    sourceVolume: 2,
  },
  {
    name: "将星",
    targets: { 寅午戌: "午", 申子辰: "子", 巳酉丑: "酉", 亥卯未: "卯" },
    chapter: "论将星华盖",
    category: "贵人与文教",
    sourceVolume: 2,
  },
  {
    name: "华盖",
    targets: { 寅午戌: "戌", 申子辰: "辰", 巳酉丑: "丑", 亥卯未: "未" },
    chapter: "论将星华盖",
    category: "贵人与文教",
    sourceVolume: 2,
  },
  {
    name: "劫煞",
    targets: { 申子辰: "巳", 寅午戌: "亥", 巳酉丑: "寅", 亥卯未: "申" },
    chapter: "论劫煞亡神",
    category: "刑冲杂煞",
    sourceVolume: 3,
  },
  {
    name: "亡神",
    targets: { 申子辰: "亥", 寅午戌: "巳", 巳酉丑: "申", 亥卯未: "寅" },
    chapter: "论劫煞亡神",
    category: "刑冲杂煞",
    sourceVolume: 3,
  },
  {
    name: "灾煞",
    targets: { 申子辰: "午", 寅午戌: "子", 巳酉丑: "卯", 亥卯未: "酉" },
    chapter: "论灾煞",
    category: "刑冲杂煞",
    sourceVolume: 3,
  },
  {
    name: "六厄",
    targets: { 申子辰: "卯", 寅午戌: "酉", 巳酉丑: "子", 亥卯未: "午" },
    chapter: "论六厄",
    category: "刑冲杂煞",
    sourceVolume: 3,
  },
  {
    name: "攀鞍",
    targets: { 申子辰: "丑", 寅午戌: "未", 巳酉丑: "戌", 亥卯未: "辰" },
    chapter: "十二宫驿马例·攀鞍",
    category: "行旅与年神",
    sourceVolume: 3,
  },
];

const MONTH_TIAN_DE = [
  "丁",
  "申",
  "壬",
  "辛",
  "亥",
  "甲",
  "癸",
  "寅",
  "丙",
  "乙",
  "巳",
  "庚",
];
const MONTH_YAN = [
  "戌",
  "酉",
  "申",
  "未",
  "午",
  "巳",
  "辰",
  "卯",
  "寅",
  "丑",
  "子",
  "亥",
];
const TEN_EVIL_DAYS = [
  "甲辰",
  "乙巳",
  "壬申",
  "丙申",
  "丁亥",
  "庚辰",
  "戊戌",
  "癸亥",
  "辛巳",
  "己丑",
];
const EIGHT_EXCLUSIVE_DAYS = [
  "甲寅",
  "乙卯",
  "己未",
  "丁未",
  "庚申",
  "辛酉",
  "戊戌",
  "癸丑",
];
const NINE_UGLY_DAYS = [
  "壬子",
  "壬午",
  "戊子",
  "戊午",
  "己酉",
  "己卯",
  "乙卯",
  "辛酉",
  "辛卯",
];
const LONELY_PHOENIX_DAYS = [
  "乙巳",
  "丁巳",
  "辛亥",
  "戊申",
  "甲寅",
  "丙午",
  "戊午",
  "壬子",
];
const YIN_YANG_ERROR_DAYS = [
  "丙子",
  "丁丑",
  "戊寅",
  "辛卯",
  "壬辰",
  "癸巳",
  "丙午",
  "丁未",
  "戊申",
  "辛酉",
  "壬戌",
  "癸亥",
];
const SELF_BLADE_DAYS = ["丙午", "丁未", "戊午", "己未", "壬子", "癸丑"];

function parsePillars(chineseDate: string): ShenshaPillar[] {
  const values = chineseDate.trim().split(/\s+/);
  const pillarPattern = new RegExp(`^[${STEMS.join("")}][${BRANCHES.join("")}]$`);

  if (
    values.length !== 4 ||
    values.some((pillar) => !pillarPattern.test(pillar))
  ) {
    throw new Error("四柱格式不正确，暂时无法计算神煞。");
  }

  return values.map((value, index) => ({
    label: PILLAR_LABELS[index],
    value,
    stem: value[0],
    branch: value[1],
  }));
}

function source(
  title: ShenshaSource["title"],
  chapter: string,
  url: string,
  documentId: string,
): ShenshaSource {
  return { title, chapter, url, documentId };
}

function sanmingSource(chapter: string, volume: 2 | 3 = 3) {
  return source(
    "三命通会",
    chapter,
    volume === 2 ? SANMING_VOLUME_2 : SANMING_VOLUME_3,
    `bazi/sanming-tonghui-${volume}`,
  );
}

function yuanhaiSource(chapter: string) {
  return source(
    "渊海子平",
    chapter,
    YUANHAI_ZIPING,
    "bazi/yuanhai-ziping",
  );
}

function wuxingSource(chapter: string) {
  return source(
    "五行精纪",
    chapter,
    WUXING_JINGJI,
    "bazi/wuxing-jingji",
  );
}

function findBranchMatches(
  pillars: ShenshaPillar[],
  targets: readonly string[],
  startIndex = 0,
) {
  return pillars
    .slice(startIndex)
    .filter((pillar) => targets.includes(pillar.branch))
    .map((pillar) => `${pillar.label}·${pillar.branch}`);
}

function findStemMatches(
  pillars: ShenshaPillar[],
  targets: readonly string[],
  startIndex = 0,
) {
  return pillars
    .slice(startIndex)
    .filter((pillar) => targets.includes(pillar.stem))
    .map((pillar) => `${pillar.label}·${pillar.stem}`);
}

function findMixedMatches(
  pillars: ShenshaPillar[],
  targets: readonly string[],
) {
  return pillars
    .filter(
      (pillar) =>
        targets.includes(pillar.stem) || targets.includes(pillar.branch),
    )
    .map((pillar) => {
      const value = targets.includes(pillar.stem)
        ? pillar.stem
        : pillar.branch;
      return `${pillar.label}·${value}`;
    });
}

function addHit(
  hits: ShenshaHit[],
  hit: Omit<ShenshaHit, "targetValues" | "commentary"> & {
    targetValues?: string[];
  },
) {
  if (hit.matches.length === 0) {
    return;
  }
  hits.push({
    ...hit,
    targetValues: hit.targetValues ?? [],
    commentary: getShenshaCommentary(hit.name, hit.matches, hit.basis),
  });
}

function findThreeHarmonyTarget(
  branch: string,
  targets: Record<string, string>,
) {
  const group = Object.keys(targets).find((candidate) =>
    candidate.includes(branch),
  );
  return group ? { group, target: targets[group] } : undefined;
}

function groupOf(branch: string) {
  return ["寅午戌", "申子辰", "巳酉丑", "亥卯未"].find((group) =>
    group.includes(branch),
  );
}

function branchOffset(branch: string, offset: number) {
  const index = BRANCHES.indexOf(branch);
  return BRANCHES[(index + offset + 12) % 12];
}

function monthIndex(monthBranch: string) {
  const order = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
  const index = order.indexOf(monthBranch);
  if (index < 0) {
    throw new Error("月柱地支不正确，暂时无法计算月令神煞。");
  }
  return index;
}

function seasonOf(monthBranch: string) {
  if ("寅卯辰".includes(monthBranch)) return "春";
  if ("巳午未".includes(monthBranch)) return "夏";
  if ("申酉戌".includes(monthBranch)) return "秋";
  return "冬";
}

function pairedValue(value: string) {
  const pairs = [
    "甲己",
    "乙庚",
    "丙辛",
    "丁壬",
    "戊癸",
    "子丑",
    "寅亥",
    "卯戌",
    "辰酉",
    "巳申",
    "午未",
  ];
  const pair = pairs.find((candidate) => candidate.includes(value));
  return pair?.split("").find((candidate) => candidate !== value);
}

function calculateVoidBranches(dayPillar: string): [string, string] {
  const dayIndex = SIXTY_PILLARS.indexOf(dayPillar);
  if (dayIndex < 0) {
    throw new Error("日柱不在六十甲子中，暂时无法计算旬空。");
  }

  const firstPillarIndex = Math.floor(dayIndex / 10) * 10;
  const firstBranchIndex = firstPillarIndex % 12;
  return [
    BRANCHES[(firstBranchIndex + 10) % 12],
    BRANCHES[(firstBranchIndex + 11) % 12],
  ];
}

function addNamedDayRule(
  hits: ShenshaHit[],
  pillars: ShenshaPillar[],
  name: string,
  days: string[],
  category: ShenshaCategory,
  ruleSource: ShenshaSource,
) {
  const dayPillar = pillars[2].value;
  if (!days.includes(dayPillar)) return;
  addHit(hits, {
    name,
    category,
    targetValues: days,
    matches: [`日柱·${dayPillar}`],
    basis: [`日柱${dayPillar}在《${ruleSource.title}》所列日柱中`],
    source: ruleSource,
  });
}

export function calculateShensha(
  chineseDate: string,
  gender: ShenshaGender = "男",
): ShenshaResult {
  const pillars = parsePillars(chineseDate);
  const yearStem = pillars[0].stem;
  const yearBranch = pillars[0].branch;
  const monthBranch = pillars[1].branch;
  const dayStem = pillars[2].stem;
  const dayBranch = pillars[2].branch;
  const dayPillar = pillars[2].value;
  const hourBranch = pillars[3].branch;
  const hits: ShenshaHit[] = [];

  for (const rule of DAY_STEM_BRANCH_RULES) {
    const targets = rule.targets[dayStem] ?? [];
    addHit(hits, {
      name: rule.name,
      category: rule.category,
      targetValues: targets,
      matches: findBranchMatches(pillars, targets),
      basis: [`日干${dayStem}查${targets.join("、")}`],
      source: sanmingSource(rule.chapter),
    });
  }

  const bladeTargets = YANG_BLADE_TARGETS[dayStem] ?? [];
  addHit(hits, {
    name: "阳刃",
    category: "刑冲杂煞",
    targetValues: bladeTargets,
    matches: findBranchMatches(pillars, bladeTargets),
    basis: [`日干${dayStem}按《渊海子平》五阳干取刃`],
    source: yuanhaiSource("论阳刃"),
  });

  const baseBranches = [
    { label: "年支", branch: yearBranch },
    { label: "日支", branch: dayBranch },
  ];
  for (const rule of THREE_HARMONY_RULES) {
    const lookups = baseBranches
      .map((base) => {
        const target = findThreeHarmonyTarget(base.branch, rule.targets);
        return target ? { ...base, ...target } : undefined;
      })
      .filter((lookup) => lookup !== undefined);
    const targets = [...new Set(lookups.map((lookup) => lookup.target))];
    addHit(hits, {
      name: rule.name,
      category: rule.category,
      targetValues: targets,
      matches: findBranchMatches(pillars, targets),
      basis: lookups.map(
        (lookup) =>
          `${lookup.label}${lookup.branch}属${lookup.group}局，查${lookup.target}`,
      ),
      source: sanmingSource(rule.chapter, rule.sourceVolume),
    });
  }

  const voidBranches = calculateVoidBranches(dayPillar);
  addHit(hits, {
    name: "旬空",
    category: "刑冲杂煞",
    targetValues: [...voidBranches],
    matches: findBranchMatches(pillars, voidBranches),
    basis: [`日柱${dayPillar}所在旬空${voidBranches.join("、")}`],
    source: sanmingSource("论空亡"),
  });

  const emptyRuleTargets: Record<string, Record<string, string[]>> = {
    截路空亡: {
      甲: ["申", "酉"],
      己: ["申", "酉"],
      乙: ["午", "未"],
      庚: ["午", "未"],
      丙: ["辰", "巳"],
      辛: ["辰", "巳"],
      丁: ["寅", "卯"],
      壬: ["寅", "卯"],
      戊: ["戌", "亥"],
      癸: ["戌", "亥"],
    },
    五鬼空亡: {
      甲: ["巳", "午"],
      己: ["巳", "午"],
      乙: ["寅", "卯"],
      庚: ["寅", "卯"],
      丙: ["子", "丑"],
      辛: ["子", "丑"],
      丁: ["戌", "亥"],
      壬: ["戌", "亥"],
      戊: ["申", "酉"],
      癸: ["申", "酉"],
    },
    克害空亡: {
      甲: ["午"],
      乙: ["午"],
      丙: ["申"],
      丁: ["申"],
      戊: ["巳"],
      己: ["巳"],
      庚: ["寅"],
      辛: ["寅"],
      壬: ["酉", "丑"],
      癸: ["酉", "丑"],
    },
    破祖空亡: {
      甲: ["午"],
      乙: ["午"],
      丙: ["申"],
      丁: ["申"],
      戊: ["戌"],
      己: ["戌"],
      庚: ["子"],
      辛: ["子"],
      壬: ["寅"],
      癸: ["寅"],
    },
  };
  for (const [name, byStem] of Object.entries(emptyRuleTargets)) {
    const usesDayStem = name === "截路空亡";
    const lookupStem = usesDayStem ? dayStem : yearStem;
    const targets = byStem[lookupStem] ?? [];
    const matches = usesDayStem
      ? targets.includes(hourBranch)
        ? [`时柱·${hourBranch}`]
        : []
      : findBranchMatches(pillars, targets, 1);
    addHit(hits, {
      name,
      category: "刑冲杂煞",
      targetValues: targets,
      matches,
      basis: [
        `${usesDayStem ? "日干查时支" : "年干查月日时"}：${lookupStem}见${targets.join("、")}`,
      ],
      source: sanmingSource(`论空亡·${name}`),
    });
  }

  const currentMonthIndex = monthIndex(monthBranch);
  const tianDe = MONTH_TIAN_DE[currentMonthIndex];
  const tianDeHe = pairedValue(tianDe);
  const monthGroup = groupOf(monthBranch) ?? "";
  const monthDeByGroup: Record<string, string> = {
    寅午戌: "丙",
    亥卯未: "甲",
    申子辰: "壬",
    巳酉丑: "庚",
  };
  const monthDe = monthDeByGroup[monthGroup];
  const monthDeHe = pairedValue(monthDe);
  const mixedMonthRules = [
    {
      name: "天德贵人",
      target: tianDe,
      chapter: "论天月德",
    },
    {
      name: "月德贵人",
      target: monthDe,
      chapter: "论天月德",
    },
    {
      name: "天德合",
      target: tianDeHe,
      chapter: "论天月德·天德合",
    },
    {
      name: "月德合",
      target: monthDeHe,
      chapter: "论天月德·月德合",
    },
  ];
  for (const rule of mixedMonthRules) {
    if (!rule.target) continue;
    addHit(hits, {
      name: rule.name,
      category: "月令德曜",
      targetValues: [rule.target],
      matches: findMixedMatches(pillars, [rule.target]),
      basis: [`月支${monthBranch}按第${currentMonthIndex + 1}月查${rule.target}`],
      source: sanmingSource(rule.chapter),
    });
  }

  const virtueByGroup: Record<
    string,
    { virtue: string[]; elegance: string[] }
  > = {
    寅午戌: { virtue: ["丙", "丁"], elegance: ["戊", "癸"] },
    申子辰: { virtue: ["壬", "癸", "戊", "己"], elegance: ["丙", "辛", "甲", "己"] },
    巳酉丑: { virtue: ["庚", "辛"], elegance: ["乙", "庚"] },
    亥卯未: { virtue: ["甲", "乙"], elegance: ["丁", "壬"] },
  };
  const virtueRule = virtueByGroup[monthGroup];
  if (virtueRule) {
    const virtueMatches = findStemMatches(pillars, virtueRule.virtue);
    const eleganceMatches = findStemMatches(pillars, virtueRule.elegance);
    addHit(hits, {
      name: "德秀贵人",
      category: "月令德曜",
      targetValues: [...virtueRule.virtue, ...virtueRule.elegance],
      matches: [...new Set([...virtueMatches, ...eleganceMatches])],
      basis: [
        `月支${monthBranch}属${monthGroup}月，德查${virtueRule.virtue.join("、")}，秀查${virtueRule.elegance.join("、")}`,
      ],
      source: sanmingSource("论德秀"),
    });
  }

  const monthVoidByGroup: Record<string, string> = {
    寅午戌: "壬",
    亥卯未: "庚",
    申子辰: "丙",
    巳酉丑: "申",
  };
  const monthKillByGroup: Record<string, string> = {
    寅午戌: "丑",
    亥卯未: "戌",
    申子辰: "未",
    巳酉丑: "辰",
  };
  const monthAuxiliaryRules = [
    {
      name: "月空",
      target: monthVoidByGroup[monthGroup],
      chapter: "论天月德·月空",
    },
    {
      name: "月厌",
      target: MONTH_YAN[currentMonthIndex],
      chapter: "论天月德·月厌",
    },
    {
      name: "月煞",
      target: monthKillByGroup[monthGroup],
      chapter: "论天月德·月煞",
    },
  ];
  for (const rule of monthAuxiliaryRules) {
    addHit(hits, {
      name: rule.name,
      category: "月令德曜",
      targetValues: [rule.target],
      matches: findMixedMatches(pillars, [rule.target]),
      basis: [`月支${monthBranch}查${rule.target}`],
      source: sanmingSource(rule.chapter),
    });
  }

  const season = seasonOf(monthBranch);
  const pardonDay: Record<string, string> = {
    春: "戊寅",
    夏: "甲午",
    秋: "戊申",
    冬: "甲子",
  };
  if (dayPillar === pardonDay[season]) {
    addHit(hits, {
      name: "天赦",
      category: "月令德曜",
      targetValues: [pardonDay[season]],
      matches: [`日柱·${dayPillar}`],
      basis: [`月支${monthBranch}属${season}，${season}季天赦日为${pardonDay[season]}`],
      source: sanmingSource("论天月德·天赦日"),
    });
  }

  const jingByGroup: Record<
    string,
    { dayStems: string[]; hourBranch: string }
  > = {
    寅午戌: { dayStems: ["丙", "辛"], hourBranch: "寅" },
    亥卯未: { dayStems: ["甲", "己"], hourBranch: "亥" },
    申子辰: { dayStems: ["壬", "丁"], hourBranch: "申" },
    巳酉丑: { dayStems: ["庚", "乙"], hourBranch: "巳" },
  };
  const jing = jingByGroup[monthGroup];
  if (jing) {
    addHit(hits, {
      name: "旌德",
      category: "月令德曜",
      targetValues: jing.dayStems,
      matches: jing.dayStems.includes(dayStem)
        ? [`日柱·${dayStem}`]
        : [],
      basis: [`月支${monthBranch}属${monthGroup}，日干查${jing.dayStems.join("、")}`],
      source: sanmingSource("论天月德·旌德煞"),
    });
    addHit(hits, {
      name: "旌钺",
      category: "月令德曜",
      targetValues: [jing.hourBranch],
      matches:
        hourBranch === jing.hourBranch ? [`时柱·${hourBranch}`] : [],
      basis: [`月支${monthBranch}属${monthGroup}，时支查${jing.hourBranch}`],
      source: sanmingSource("论天月德·旌钺煞"),
    });
  }

  const stems = pillars.map((pillar) => pillar.stem).join("");
  const threeWonder = ["乙丙丁", "甲戊庚"].find((pattern) =>
    stems.includes(pattern),
  );
  if (threeWonder) {
    const startIndex = stems.indexOf(threeWonder);
    addHit(hits, {
      name: "三奇贵人",
      category: "贵人与文教",
      targetValues: threeWonder.split(""),
      matches: pillars
        .slice(startIndex, startIndex + 3)
        .map((pillar) => `${pillar.label}·${pillar.stem}`),
      basis: [`四柱天干${stems}顺布${threeWonder}`],
      source: sanmingSource("论三奇"),
    });
  }

  const yearIsYang = STEMS.indexOf(yearStem) % 2 === 0;
  const isForwardClass =
    (yearIsYang && gender === "男") || (!yearIsYang && gender === "女");
  const polarityLabel = `${yearIsYang ? "阳" : "阴"}${gender}`;
  const yuanChenTarget = branchOffset(yearBranch, isForwardClass ? 7 : 5);
  addHit(hits, {
    name: "元辰",
    category: "刑冲杂煞",
    targetValues: [yuanChenTarget],
    matches: findBranchMatches(pillars, [yuanChenTarget], 1),
    basis: [
      `${yearStem}${yearBranch}为${polarityLabel}，按冲位${isForwardClass ? "前" : "后"}一辰查${yuanChenTarget}`,
    ],
    source: sanmingSource("论元辰"),
  });

  const hookTarget = branchOffset(yearBranch, isForwardClass ? 3 : -3);
  const twistTarget = branchOffset(yearBranch, isForwardClass ? -3 : 3);
  for (const rule of [
    { name: "勾神", target: hookTarget },
    { name: "绞神", target: twistTarget },
  ]) {
    addHit(hits, {
      name: rule.name,
      category: "刑冲杂煞",
      targetValues: [rule.target],
      matches: findBranchMatches(pillars, [rule.target], 1),
      basis: [`${polarityLabel}以年支${yearBranch}前后三辰分勾绞，查${rule.target}`],
      source: sanmingSource("论勾绞"),
    });
  }

  const solitaryRules: Record<string, { lonely: string; widow: string }> = {
    寅卯辰: { lonely: "巳", widow: "丑" },
    巳午未: { lonely: "申", widow: "辰" },
    申酉戌: { lonely: "亥", widow: "未" },
    亥子丑: { lonely: "寅", widow: "戌" },
  };
  const yearQuarter = Object.keys(solitaryRules).find((group) =>
    group.includes(yearBranch),
  );
  if (yearQuarter) {
    const targets = solitaryRules[yearQuarter];
    for (const rule of [
      { name: "孤辰", target: targets.lonely },
      { name: "寡宿", target: targets.widow },
    ]) {
      addHit(hits, {
        name: rule.name,
        category: "刑冲杂煞",
        targetValues: [rule.target],
        matches: findBranchMatches(pillars, [rule.target], 1),
        basis: [`年支${yearBranch}属${yearQuarter}方，查${rule.target}`],
        source: sanmingSource("论孤辰寡宿"),
      });
    }
  }

  const allBranches = pillars.map((pillar) => pillar.branch);
  for (const rule of [
    { name: "天罗", pair: ["戌", "亥"] },
    { name: "地网", pair: ["辰", "巳"] },
  ]) {
    if (rule.pair.every((branch) => allBranches.includes(branch))) {
      addHit(hits, {
        name: rule.name,
        category: "刑冲杂煞",
        targetValues: rule.pair,
        matches: findBranchMatches(pillars, rule.pair),
        basis: [`四柱交见${rule.pair.join("、")}`],
        source: sanmingSource("论天罗地网"),
      });
    }
  }

  const darkGoldTargets: Record<string, string> = {
    子午卯酉: "巳",
    寅申巳亥: "酉",
    辰戌丑未: "丑",
  };
  const darkLookups = baseBranches.map((base) => {
    const group = Object.keys(darkGoldTargets).find((candidate) =>
      candidate.includes(base.branch),
    );
    return group
      ? { ...base, group, target: darkGoldTargets[group] }
      : undefined;
  }).filter((lookup) => lookup !== undefined);
  const darkTargets = [...new Set(darkLookups.map((lookup) => lookup.target))];
  addHit(hits, {
    name: "暗金煞",
    category: "刑冲杂煞",
    targetValues: darkTargets,
    matches: findBranchMatches(pillars, darkTargets),
    basis: darkLookups.map(
      (lookup) => `${lookup.label}${lookup.branch}属${lookup.group}，查${lookup.target}`,
    ),
    source: sanmingSource("论暗金的煞"),
  });

  const yearOffsetRules = [
    { name: "官符", offset: 4 },
    { name: "病符", offset: -1 },
    { name: "死符", offset: 5 },
    { name: "丧门", offset: 2 },
    { name: "吊客", offset: -2 },
  ];
  for (const rule of yearOffsetRules) {
    const target = branchOffset(yearBranch, rule.offset);
    addHit(hits, {
      name: rule.name,
      category: "行旅与年神",
      targetValues: [target],
      matches: findBranchMatches(pillars, [target], 1),
      basis: [`以年支${yearBranch}按太岁十二位查${target}`],
      source: sanmingSource(`总论诸神煞·${rule.name}煞`),
    });
  }

  addNamedDayRule(
    hits,
    pillars,
    "十恶大败",
    TEN_EVIL_DAYS,
    "日时专煞",
    sanmingSource("论十恶大败"),
  );
  addNamedDayRule(
    hits,
    pillars,
    "八专",
    EIGHT_EXCLUSIVE_DAYS,
    "日时专煞",
    sanmingSource("总论诸神煞·八专"),
  );
  addNamedDayRule(
    hits,
    pillars,
    "九丑",
    NINE_UGLY_DAYS,
    "日时专煞",
    sanmingSource("总论诸神煞·九丑"),
  );
  addNamedDayRule(
    hits,
    pillars,
    "孤鸾寡鹊",
    LONELY_PHOENIX_DAYS,
    "日时专煞",
    sanmingSource("总论诸神煞·孤鸾寡鹊煞"),
  );
  addNamedDayRule(
    hits,
    pillars,
    "阴阳差错",
    YIN_YANG_ERROR_DAYS,
    "日时专煞",
    sanmingSource("总论诸神煞·阴阳差错煞"),
  );
  addNamedDayRule(
    hits,
    pillars,
    "日贵",
    ["丁酉", "丁亥", "癸巳", "癸卯"],
    "贵人与文教",
    yuanhaiSource("论日贵"),
  );
  addNamedDayRule(
    hits,
    pillars,
    "日德",
    ["甲寅", "戊辰", "丙辰", "庚辰", "壬戌"],
    "贵人与文教",
    yuanhaiSource("论日德"),
  );
  addNamedDayRule(
    hits,
    pillars,
    "魁罡",
    ["壬辰", "庚戌", "戊戌", "庚辰"],
    "日时专煞",
    yuanhaiSource("论魁罡"),
  );
  addNamedDayRule(
    hits,
    pillars,
    "自刃",
    SELF_BLADE_DAYS,
    "日时专煞",
    wuxingSource("论羊刃·自刃"),
  );

  if (["癸酉", "己巳", "乙丑"].includes(pillars[3].value)) {
    addHit(hits, {
      name: "金神",
      category: "日时专煞",
      targetValues: ["癸酉", "己巳", "乙丑"],
      matches: [`时柱·${pillars[3].value}`],
      basis: [`时柱${pillars[3].value}为《渊海子平》所列金神三时之一`],
      source: yuanhaiSource("论金神"),
    });
  }

  const fourWasteBySeason: Record<string, string[]> = {
    春: ["庚申", "辛酉"],
    夏: ["壬子", "癸亥"],
    秋: ["甲寅", "乙卯"],
    冬: ["丙午", "丁巳"],
  };
  if (fourWasteBySeason[season].includes(dayPillar)) {
    addHit(hits, {
      name: "四废",
      category: "日时专煞",
      targetValues: fourWasteBySeason[season],
      matches: [`日柱·${dayPillar}`],
      basis: [`月支${monthBranch}属${season}，${season}季四废日查${fourWasteBySeason[season].join("、")}`],
      source: wuxingSource("四废日"),
    });
  }

  const breakPairs = ["卯午", "丑辰", "子酉", "未戌"];
  const activeBreak = breakPairs.find((pair) =>
    pair.split("").every((branch) => allBranches.includes(branch)),
  );
  if (activeBreak) {
    addHit(hits, {
      name: "破煞",
      category: "刑冲杂煞",
      targetValues: activeBreak.split(""),
      matches: findBranchMatches(pillars, activeBreak.split("")),
      basis: [`四柱交见${activeBreak.split("").join("、")}相破`],
      source: sanmingSource("总论诸神煞·破煞"),
    });
  }

  const hangingTargets: Record<string, string> = {
    戌: "巳",
    巳: "戌",
    辰: "亥",
    亥: "辰",
    寅: "未",
    未: "寅",
    卯: "申",
    申: "卯",
    午: "丑",
    丑: "午",
    子: "酉",
    酉: "子",
  };
  const hangingLookups = baseBranches.map((base) => ({
    ...base,
    target: hangingTargets[base.branch],
  }));
  const hangingValues = [
    ...new Set(hangingLookups.map((lookup) => lookup.target)),
  ];
  addHit(hits, {
    name: "自缢煞",
    category: "刑冲杂煞",
    targetValues: hangingValues,
    matches: findBranchMatches(pillars, hangingValues),
    basis: hangingLookups.map(
      (lookup) => `${lookup.label}${lookup.branch}反系处查${lookup.target}`,
    ),
    source: sanmingSource("总论诸神煞·自缢煞"),
  });

  const butcherTargets: Record<string, string> = {
    丑: "亥",
    亥: "丑",
    寅: "戌",
    戌: "寅",
    卯: "酉",
    酉: "卯",
    辰: "申",
    申: "辰",
    巳: "未",
    未: "巳",
  };
  const butcherTarget = butcherTargets[dayBranch];
  if (butcherTarget && hourBranch === butcherTarget) {
    addHit(hits, {
      name: "天屠煞",
      category: "日时专煞",
      targetValues: [butcherTarget],
      matches: [`日柱·${dayBranch}`, `时柱·${hourBranch}`],
      basis: [`日支${dayBranch}按逐两位取时支${butcherTarget}`],
      source: sanmingSource("总论诸神煞·天屠煞"),
    });
  }

  if (["巳", "酉", "丑", "申"].every((branch) => allBranches.includes(branch))) {
    addHit(hits, {
      name: "挂剑煞",
      category: "刑冲杂煞",
      targetValues: ["巳", "酉", "丑", "申"],
      matches: findBranchMatches(pillars, ["巳", "酉", "丑", "申"]),
      basis: ["四柱地支巳、酉、丑、申纯全"],
      source: sanmingSource("总论诸神煞·挂剑煞"),
    });
  }

  const yinYangPillar = gender === "男" ? "丙子" : "戊午";
  if (dayPillar === yinYangPillar) {
    addHit(hits, {
      name: "阴阳煞",
      category: "日时专煞",
      targetValues: [yinYangPillar],
      matches: [`日柱·${dayPillar}`],
      basis: [`${gender}命按《三命通会》日柱查${yinYangPillar}`],
      source: sanmingSource("总论诸神煞·阴阳煞"),
    });
  }

  return {
    pillars,
    hits,
    voidBranches,
    checkedRuleCount: SUPPORTED_SHENSHA_NAMES.length,
  };
}
import {
  SUPPORTED_SHENSHA_NAMES,
  getShenshaCommentary,
  type ShenshaCommentary,
} from "./shensha-commentary";

export { SUPPORTED_SHENSHA_NAMES, getShenshaCommentary };
