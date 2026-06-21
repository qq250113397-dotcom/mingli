import {
  buildChart,
  type AlgorithmOptions,
  type BirthInput,
  type ChartPalace,
  type ChartViewModel,
} from "./chart";

export interface TimelineYear {
  year: number;
  nominalAge: number;
  heavenlyStem: string;
  earthlyBranch: string;
  focusPalace: string;
}

export interface DecadalTimeline {
  decadalRange: [number, number];
  heavenlyStem: string;
  earthlyBranch: string;
  focusPalace: string;
  years: TimelineYear[];
}

export interface AnnualReading {
  title: string;
  summary: string;
  sections: Array<{
    label:
      | "十年气候"
      | "今年落点"
      | "四化怎么走"
      | "卡点在哪"
      | "落地判断";
    body: string;
  }>;
  evidence: Array<{
    label: string;
    value: string;
  }>;
  disclaimer: string;
}

const TRANSFORMATION_LABELS = ["化禄", "化权", "化科", "化忌"] as const;

const STAR_CHARACTER: Record<string, string> = {
  紫微: "重主导、格局与责任，事情往往要由自己定方向",
  天机: "重变化、策划与信息，越需要边走边调整",
  太阳: "重公开、担当与付出，容易被看见也容易多承担",
  武曲: "重执行、财务与结果，适合用数字和成果说话",
  天同: "重感受、协调与生活品质，但也要防止求安逸",
  廉贞: "重边界、欲望与规则，选择越多越要守住原则",
  天府: "重资源、稳定与统筹，适合经营已有基础",
  太阴: "重积累、内在判断与细节，宜稳中求进",
  贪狼: "重机会、人脉与体验，能开局也要防止分心",
  巨门: "重口舌、分析与质疑，成败常在怎么说、证据够不够",
  天相: "重合作、规范与辅助，借平台和制度更容易成事",
  天梁: "重原则、照顾与化解，容易承担收拾局面的角色",
  七杀: "重突破、压力与决断，适合攻坚但不宜鲁莽",
  破军: "重更新、拆旧与重建，变化不是点缀而是主课题",
};

const PALACE_GUIDANCE: Record<
  string,
  { theme: string; opportunity: string; caution: string; action: string }
> = {
  命宫: {
    theme: "个人方向、身份选择与自我调整会更受关注",
    opportunity: "适合重新整理目标，让外在行动和真实需求靠近",
    caution: "容易把压力都归到自己身上，决定前先给自己一点缓冲",
    action: "把年度目标压缩成三件可执行的小事，每月复盘一次",
  },
  兄弟: {
    theme: "同辈关系、合作分工与资源协调是这一年的重要课题",
    opportunity: "善用伙伴的不同能力，往往比独自硬扛更省力",
    caution: "口头约定容易产生理解偏差，钱和责任尤其要说清楚",
    action: "重要合作留下文字记录，先对齐边界再推进",
  },
  夫妻: {
    theme: "亲密关系与一对一合作会成为年度焦点",
    opportunity: "坦诚沟通有助于关系升级，也利于找到长期搭档",
    caution: "情绪上头时容易把一时感受当成最终结论",
    action: "重大关系决定至少隔一晚再谈，并明确双方期待",
  },
  子女: {
    theme: "创作、项目孵化、子女互动或兴趣表达更容易占据精力",
    opportunity: "适合把想法做成看得见的作品，先小规模试水",
    caution: "热情来得快时，也要留意时间和预算是否跟得上",
    action: "用最小版本验证想法，收到真实反馈后再追加投入",
  },
  财帛: {
    theme: "收入结构、消费取舍与资源配置会更受关注",
    opportunity: "适合梳理可持续收入，提升已有技能的变现效率",
    caution: "不宜把命理解读当成投资依据，也要防冲动消费",
    action: "先做现金流清单，大额支出设置冷静期并咨询专业人士",
  },
  疾厄: {
    theme: "生活节奏、精力分配与日常健康习惯值得优先照顾",
    opportunity: "规律作息和持续的小改变，可能比短期猛冲更有效",
    caution: "身体不适应以正规检查为准，不能用命盘替代诊断",
    action: "记录睡眠与疲劳变化，有持续症状及时寻求医疗帮助",
  },
  迁移: {
    theme: "外出、变化、新环境与跨圈层接触更容易带来推动",
    opportunity: "主动走出去、学习新工具或接触新客户可能打开视野",
    caution: "环境变化多时，要给行程、合同和沟通留出余量",
    action: "重要出行准备备选方案，新合作先小单验证",
  },
  仆役: {
    theme: "团队、人脉、客户与协作者的筛选会影响推进效率",
    opportunity: "可靠的协作者可能带来信息、渠道或执行上的帮助",
    caution: "不要只看热情，长期合作更要观察兑现能力",
    action: "按结果和信用分层维护关系，关键环节准备替代人选",
  },
  官禄: {
    theme: "事业定位、职责变化与作品成果是这一年的主轴",
    opportunity: "适合建立可被看见的专业成果，争取更清晰的角色",
    caution: "忙碌不等于有效，接太多任务可能分散真正的重点",
    action: "选一个能代表自己的核心项目，持续积累可展示的成果",
  },
  田宅: {
    theme: "家庭安排、居住环境与长期基础建设更值得投入",
    opportunity: "整理空间和家庭分工，有助于提升稳定感与效率",
    caution: "房产和大额家庭决策应核实合同、预算与现实条件",
    action: "先处理最影响日常的一处环境问题，再讨论长期投入",
  },
  福德: {
    theme: "内在状态、休息质量与长期满足感会成为隐藏主线",
    opportunity: "适合减少无效消耗，恢复专注与真正喜欢的生活方式",
    caution: "想得太多时容易行动变慢，也可能把疲惫误当成失败",
    action: "固定留出不被打扰的恢复时间，再处理高压力决定",
  },
  父母: {
    theme: "长辈、制度、文书与支持系统较容易进入视野",
    opportunity: "主动请教有经验的人，可能少走一些弯路",
    caution: "证件、合同和正式流程需要反复核对，避免凭印象处理",
    action: "重要材料建立清单，涉及专业问题请对应人士复核",
  },
};

function safeDateForYear(targetDate: string, year: number): string {
  const [, month, day] = targetDate.split("-");
  const candidate = `${year}-${month}-${day}`;
  const parsed = new Date(`${candidate}T00:00:00Z`);

  if (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === Number(month) &&
    parsed.getUTCDate() === Number(day)
  ) {
    return candidate;
  }

  return `${year}-${month}-28`;
}

function palaceNameAtIndex(
  palaces: ChartPalace[],
  index: number,
): string {
  const palaceName = palaces[index]?.name;

  if (!palaceName || palaceName === "命宫") {
    return "命宫";
  }

  return palaceName.replace(/宫$/, "");
}

function findStarPalace(chart: ChartViewModel, starName: string): string {
  const palace = chart.palaces.find((item) =>
    [...item.majorStars, ...item.minorStars, ...item.adjectiveStars].some(
      (star) => star.name === starName,
    ),
  );

  return palace?.name ?? "宫位待核";
}

function palaceStars(
  chart: ChartViewModel,
  index: number,
  includeYearlyStars = false,
): string[] {
  const palace = chart.palaces[index];
  const major = palace?.majorStars.map((star) =>
    star.brightness ? `${star.name}（${star.brightness}）` : star.name,
  );
  const yearly = includeYearlyStars
    ? chart.fortune.yearly.starsByPalace[index] ?? []
    : [];

  return [...new Set([...(major ?? []), ...yearly])].slice(0, 5);
}

function starReading(stars: string[]): string {
  const mainStars = stars
    .map((star) => star.replace(/（.*$/, ""))
    .filter((star) => STAR_CHARACTER[star])
    .slice(0, 2);

  if (mainStars.length === 0) {
    return "本宫没有十四主星直接坐守，判断不能只抓一个星名，要结合对宫和四化落点来看";
  }

  return mainStars
    .map((star) => `${star}${STAR_CHARACTER[star]}`)
    .join("；");
}

function transformationLine(
  label: (typeof TRANSFORMATION_LABELS)[number],
  star: string | undefined,
  chart: ChartViewModel,
): string {
  if (!star) return `${label}星曜待核`;

  const palace = findStarPalace(chart, star);
  const meaning = {
    化禄: "是资源、人情和机会较容易流入的地方",
    化权: "是要拿主意、扛责任，也最容易感到忙和硬的地方",
    化科: "是靠专业、名声、文书或解释能力获得认可的地方",
    化忌: "是最容易反复、执着或出现沟通成本的地方",
  }[label];

  return `${label}${star}落${palace}，${meaning}`;
}

export function buildDecadalTimeline(
  birth: BirthInput,
  targetDate: string,
  algorithm: AlgorithmOptions,
): DecadalTimeline {
  const selectedChart = buildChart(birth, targetDate, algorithm);
  const [startAge, endAge] = selectedChart.fortune.decadalRange;
  const birthYearOffset =
    selectedChart.fortune.year - selectedChart.fortune.nominalAge + 1;
  const startYear = birthYearOffset + startAge;
  const years = Array.from({ length: endAge - startAge + 1 }, (_, index) => {
    const year = startYear + index;
    const chart = buildChart(
      birth,
      safeDateForYear(targetDate, year),
      algorithm,
    );

    return {
      year,
      nominalAge: chart.fortune.nominalAge,
      heavenlyStem: chart.fortune.yearly.heavenlyStem,
      earthlyBranch: chart.fortune.yearly.earthlyBranch,
      focusPalace: palaceNameAtIndex(
        chart.palaces,
        chart.fortune.yearly.index,
      ),
    };
  });

  return {
    decadalRange: [...selectedChart.fortune.decadalRange],
    heavenlyStem: selectedChart.fortune.decadal.heavenlyStem,
    earthlyBranch: selectedChart.fortune.decadal.earthlyBranch,
    focusPalace: palaceNameAtIndex(
      selectedChart.palaces,
      selectedChart.fortune.decadal.index,
    ),
    years,
  };
}

export function createAnnualReading(
  chart: ChartViewModel,
): AnnualReading {
  const yearlyPalace = palaceNameAtIndex(
    chart.palaces,
    chart.fortune.yearly.index,
  );
  const decadalPalace = palaceNameAtIndex(
    chart.palaces,
    chart.fortune.decadal.index,
  );
  const guidance = PALACE_GUIDANCE[yearlyPalace] ?? PALACE_GUIDANCE.命宫;
  const yearlyStars = palaceStars(chart, chart.fortune.yearly.index, true);
  const decadalStars = palaceStars(chart, chart.fortune.decadal.index);
  const transformations = chart.fortune.yearly.mutagens.map(
    (star, index) => ({
      label: TRANSFORMATION_LABELS[index],
      value: `${star} · ${findStarPalace(chart, star)}`,
    }),
  );
  const transformationLines = TRANSFORMATION_LABELS.map((label, index) =>
    transformationLine(label, chart.fortune.yearly.mutagens[index], chart),
  );
  const yearlyStarNames =
    yearlyStars.length > 0 ? yearlyStars.join("、") : "本宫无十四主星";
  const decadalStarNames =
    decadalStars.length > 0 ? decadalStars.join("、") : "本宫无十四主星";
  const samePalace = decadalPalace === yearlyPalace;

  return {
    title: `${chart.fortune.year} 年大师批注`,
    summary: `看这一年，不是只看一个流年宫。你这步大限落${decadalPalace}，流年命宫走到${yearlyPalace}，再把${TRANSFORMATION_LABELS.map((label, index) => `${label}${chart.fortune.yearly.mutagens[index] ?? "待核"}`).join("、")}串起来，重点才会清楚。`,
    sections: [
      {
        label: "十年气候",
        body: `大限在${decadalPalace}，宫内见${decadalStarNames}。这十年先处理的是${PALACE_GUIDANCE[decadalPalace]?.theme ?? "个人方向与资源安排"}；${starReading(decadalStars)}。所以本年发生的事，最终都会回到这条十年主线上。`,
      },
      {
        label: "今年落点",
        body: `流年命宫落${yearlyPalace}，见${yearlyStarNames}。${starReading(yearlyStars)}。${samePalace ? "流年与大限落在同一宫，十年课题在这一年会被明显放大，不能再用拖延绕过去。" : `大限管${decadalPalace}，流年转到${yearlyPalace}，今年要用${yearlyPalace}的事情去回应${decadalPalace}的长期课题。`}`,
      },
      {
        label: "四化怎么走",
        body: `${transformationLines.slice(0, 3).join("；")}。简单说：先看化禄从哪里进资源，再看化权在哪里必须亲自推动，最后用化科把事情做得可被信任。`,
      },
      {
        label: "卡点在哪",
        body: `${transformationLines[3]}。化忌不代表坏事会发生，而是这个宫位最容易让人重复用力、想不开或说不清；${guidance.caution}。先处理卡点，化禄、化权、化科才接得住。`,
      },
      {
        label: "落地判断",
        body: `这一年可做的不是等运来，而是顺着盘面用力：${guidance.opportunity}；具体先做“${guidance.action}”。凡涉及健康、投资、合同或法律问题，盘面只提示关注方向，最后以专业意见和现实证据为准。`,
      },
    ],
    evidence: [
      {
        label: "大限命宫",
        value: `${decadalPalace} · ${chart.fortune.decadal.heavenlyStem}${chart.fortune.decadal.earthlyBranch}`,
      },
      {
        label: "流年命宫",
        value: `${yearlyPalace} · ${chart.fortune.yearly.heavenlyStem}${chart.fortune.yearly.earthlyBranch}`,
      },
      ...transformations,
    ],
    disclaimer:
      "批注依据当前排盘口径自动整理，仅供传统文化研究与娱乐；不替代医疗、法律、投资等专业意见。",
  };
}
