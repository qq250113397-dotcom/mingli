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
    label: "年度主轴" | "机会窗口" | "需要留意" | "行动建议";
    body: string;
  }>;
  evidence: Array<{
    label: string;
    value: string;
  }>;
  disclaimer: string;
}

const TRANSFORMATION_LABELS = ["化禄", "化权", "化科", "化忌"] as const;

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
  const transformations = chart.fortune.yearly.mutagens.map(
    (star, index) => ({
      label: TRANSFORMATION_LABELS[index],
      value: `${star} · ${findStarPalace(chart, star)}`,
    }),
  );
  const restriction = transformations[3];

  return {
    title: `${chart.fortune.year} 年大师批注`,
    summary: `大限走${decadalPalace}，流年走${yearlyPalace}。这一年先看“${guidance.theme}”。`,
    sections: [
      {
        label: "年度主轴",
        body: `${guidance.theme}。大限${decadalPalace}提供十年背景，流年${yearlyPalace}决定当年的观察重点。`,
      },
      {
        label: "机会窗口",
        body: `${guidance.opportunity}。${transformations[0]?.value ?? "化禄位置待核"}可作为资源较容易聚集之处观察。`,
      },
      {
        label: "需要留意",
        body: `${guidance.caution}。${restriction?.value ?? "化忌位置待核"}只表示课题较集中，不代表会发生坏事。`,
      },
      {
        label: "行动建议",
        body: guidance.action,
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
