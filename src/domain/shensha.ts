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

export interface ShenshaPillar {
  label: (typeof PILLAR_LABELS)[number];
  value: string;
  stem: string;
  branch: string;
}

export interface ShenshaSource {
  title: "三命通会" | "渊海子平";
  chapter: string;
  url: string;
  documentId: string;
}

export interface ShenshaHit {
  name: string;
  targetBranches: string[];
  matches: string[];
  basis: string[];
  source: ShenshaSource;
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

const DAY_STEM_RULES = [
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
    source: SANMING_VOLUME_3,
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
    chapter: "文昌贵（三命通会取法）",
    source: SANMING_VOLUME_3,
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
    source: SANMING_VOLUME_3,
  },
] as const;

const YANG_BLADE_TARGETS: Partial<Record<string, string[]>> = {
  甲: ["卯"],
  丙: ["午"],
  戊: ["午"],
  庚: ["酉"],
  壬: ["子"],
};

const THREE_HARMONY_RULES = [
  {
    name: "驿马",
    targets: { 寅午戌: "申", 申子辰: "寅", 巳酉丑: "亥", 亥卯未: "巳" },
    chapter: "论驿马",
    source: SANMING_VOLUME_3,
  },
  {
    name: "咸池",
    targets: { 寅午戌: "卯", 巳酉丑: "午", 申子辰: "酉", 亥卯未: "子" },
    chapter: "论咸池",
    source: SANMING_VOLUME_2,
  },
  {
    name: "将星",
    targets: { 寅午戌: "午", 申子辰: "子", 巳酉丑: "酉", 亥卯未: "卯" },
    chapter: "论将星华盖",
    source: SANMING_VOLUME_2,
  },
  {
    name: "华盖",
    targets: { 寅午戌: "戌", 申子辰: "辰", 巳酉丑: "丑", 亥卯未: "未" },
    chapter: "论将星华盖",
    source: SANMING_VOLUME_2,
  },
  {
    name: "劫煞",
    targets: { 申子辰: "巳", 寅午戌: "亥", 巳酉丑: "寅", 亥卯未: "申" },
    chapter: "论劫煞亡神",
    source: SANMING_VOLUME_3,
  },
  {
    name: "亡神",
    targets: { 申子辰: "亥", 寅午戌: "巳", 巳酉丑: "申", 亥卯未: "寅" },
    chapter: "论劫煞亡神",
    source: SANMING_VOLUME_3,
  },
] as const;

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

function findMatches(pillars: ShenshaPillar[], targets: readonly string[]) {
  return pillars
    .filter((pillar) => targets.includes(pillar.branch))
    .map((pillar) => `${pillar.label}·${pillar.branch}`);
}

function source(
  title: ShenshaSource["title"],
  chapter: string,
  url: string,
  documentId: string,
): ShenshaSource {
  return { title, chapter, url, documentId };
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

export function calculateShensha(chineseDate: string): ShenshaResult {
  const pillars = parsePillars(chineseDate);
  const dayStem = pillars[2].stem;
  const hits: ShenshaHit[] = [];

  for (const rule of DAY_STEM_RULES) {
    const targets =
      rule.targets[dayStem as keyof typeof rule.targets] ?? [];
    const matches = findMatches(pillars, targets);
    if (matches.length > 0) {
      hits.push({
        name: rule.name,
        targetBranches: [...targets],
        matches,
        basis: [`日干${dayStem}查${targets.join("、")}`],
        source: source(
          "三命通会",
          rule.chapter,
          rule.source,
          "bazi/sanming-tonghui-3",
        ),
      });
    }
  }

  const bladeTargets = YANG_BLADE_TARGETS[dayStem] ?? [];
  const bladeMatches = findMatches(pillars, bladeTargets);
  if (bladeMatches.length > 0) {
    hits.push({
      name: "阳刃",
      targetBranches: [...bladeTargets],
      matches: bladeMatches,
      basis: [`日干${dayStem}按五阳干取刃`],
      source: source(
        "渊海子平",
        "论阳刃",
        YUANHAI_ZIPING,
        "bazi/yuanhai-ziping",
      ),
    });
  }

  const baseBranches = [
    { label: "年支", branch: pillars[0].branch },
    { label: "日支", branch: pillars[2].branch },
  ];

  for (const rule of THREE_HARMONY_RULES) {
    const lookups = baseBranches
      .map((base) => {
        const target = findThreeHarmonyTarget(
          base.branch,
          rule.targets as Record<string, string>,
        );
        return target ? { ...base, ...target } : undefined;
      })
      .filter((lookup) => lookup !== undefined);
    const targets = [...new Set(lookups.map((lookup) => lookup.target))];
    const matches = findMatches(pillars, targets);

    if (matches.length > 0) {
      hits.push({
        name: rule.name,
        targetBranches: targets,
        matches,
        basis: lookups.map(
          (lookup) =>
            `${lookup.label}${lookup.branch}属${lookup.group}局，查${lookup.target}`,
        ),
        source: source(
          "三命通会",
          rule.chapter,
          rule.source,
          rule.source === SANMING_VOLUME_2
            ? "bazi/sanming-tonghui-2"
            : "bazi/sanming-tonghui-3",
        ),
      });
    }
  }

  const voidBranches = calculateVoidBranches(pillars[2].value);
  const voidMatches = findMatches(pillars, voidBranches);
  if (voidMatches.length > 0) {
    hits.push({
      name: "旬空",
      targetBranches: [...voidBranches],
      matches: voidMatches,
      basis: [`日柱${pillars[2].value}所在旬空${voidBranches.join("、")}`],
      source: source(
        "三命通会",
        "论空亡",
        SANMING_VOLUME_3,
        "bazi/sanming-tonghui-3",
      ),
    });
  }

  return {
    pillars,
    hits,
    voidBranches,
    checkedRuleCount: 11,
  };
}
