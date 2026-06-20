import { astro } from "iztro";

export type CalendarType = "solar" | "lunar";
export type Gender = "男" | "女";

export interface AlgorithmOptions {
  algorithm: "default" | "zhongzhou";
  yearDivide: "normal" | "exact";
  horoscopeDivide: "normal" | "exact";
  ageDivide: "normal" | "birthday";
  dayDivide: "current" | "forward";
}

export const DEFAULT_ALGORITHM_OPTIONS: AlgorithmOptions = {
  algorithm: "default",
  yearDivide: "normal",
  horoscopeDivide: "normal",
  ageDivide: "normal",
  dayDivide: "forward",
};

export interface BirthInput {
  calendar: CalendarType;
  date: string;
  timeIndex: number;
  gender: Gender;
  isLeapMonth: boolean;
  fixLeap: boolean;
}

export interface ChartStar {
  name: string;
  brightness?: string;
  mutagen?: string;
}

export interface ChartPalace {
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  isBodyPalace: boolean;
  isOriginalPalace: boolean;
  majorStars: ChartStar[];
  minorStars: ChartStar[];
  adjectiveStars: ChartStar[];
  decadalRange: [number, number];
}

export interface FortuneItem {
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  palaceNames: string[];
  mutagens: string[];
  starsByPalace: string[][];
}

export interface ChartViewModel {
  algorithm: AlgorithmOptions;
  summary: {
    gender: string;
    solarDate: string;
    lunarDate: string;
    chineseDate: string;
    time: string;
    timeRange: string;
    sign: string;
    zodiac: string;
    fiveElementsClass: string;
    soul: string;
    body: string;
    soulPalaceBranch: string;
    bodyPalaceBranch: string;
  };
  palaces: ChartPalace[];
  fortune: {
    date: string;
    lunarDate: string;
    year: number;
    nominalAge: number;
    decadalRange: [number, number];
    decadal: FortuneItem;
    age: FortuneItem;
    yearly: FortuneItem;
    monthly: FortuneItem;
    daily: FortuneItem;
  };
}

export const TIME_OPTIONS = [
  { value: 0, label: "早子时（00:00–01:00）" },
  { value: 1, label: "丑时（01:00–03:00）" },
  { value: 2, label: "寅时（03:00–05:00）" },
  { value: 3, label: "卯时（05:00–07:00）" },
  { value: 4, label: "辰时（07:00–09:00）" },
  { value: 5, label: "巳时（09:00–11:00）" },
  { value: 6, label: "午时（11:00–13:00）" },
  { value: 7, label: "未时（13:00–15:00）" },
  { value: 8, label: "申时（15:00–17:00）" },
  { value: 9, label: "酉时（17:00–19:00）" },
  { value: 10, label: "戌时（19:00–21:00）" },
  { value: 11, label: "亥时（21:00–23:00）" },
  { value: 12, label: "晚子时（23:00–00:00）" },
] as const;

function normalizeTargetDate(target: string | number): string {
  const rawDate = typeof target === "number" ? `${target}-6-20` : target;
  const match = rawDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (!match) {
    throw new Error("查看日期格式不正确，请重新选择年月日。");
  }

  const [, rawYear, rawMonth, rawDay] = match;
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isValidDate =
    year >= 1900 &&
    year <= 2100 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isValidDate) {
    throw new Error("查看日期暂时支持 1900 至 2100 年，请检查年月日。");
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function validateInput(input: BirthInput) {
  if (
    !Number.isInteger(input.timeIndex) ||
    input.timeIndex < 0 ||
    input.timeIndex > 12
  ) {
    throw new Error("出生时辰需要从早子时到晚子时中选择。");
  }

  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(input.date)) {
    throw new Error("出生日期格式不正确，请重新选择年月日。");
  }
}

function mapStars(
  stars: Array<{
    name: string;
    brightness?: string;
    mutagen?: string;
  }>,
): ChartStar[] {
  return stars.map((star) => ({
    name: star.name,
    brightness: star.brightness || undefined,
    mutagen: star.mutagen || undefined,
  }));
}

function mapFortuneItem(item: {
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  palaceNames: string[];
  mutagen: string[];
  stars?: Array<Array<{ name: string }>>;
}): FortuneItem {
  return {
    index: item.index,
    name: item.name,
    heavenlyStem: item.heavenlyStem,
    earthlyBranch: item.earthlyBranch,
    palaceNames: [...item.palaceNames],
    mutagens: [...item.mutagen],
    starsByPalace: (item.stars ?? []).map((stars) =>
      stars.map((star) => star.name),
    ),
  };
}

export function buildChart(
  input: BirthInput,
  target: string | number,
  algorithm: AlgorithmOptions = DEFAULT_ALGORITHM_OPTIONS,
): ChartViewModel {
  validateInput(input);
  const targetDate = normalizeTargetDate(target);

  try {
    const astrolabe = astro.withOptions({
      type: input.calendar,
      dateStr: input.date,
      timeIndex: input.timeIndex,
      gender: input.gender,
      isLeapMonth: input.isLeapMonth,
      fixLeap: input.fixLeap,
      language: "zh-CN",
      config: algorithm,
    });
    const horoscope = astrolabe.horoscope(targetDate);
    const decadalRange =
      astrolabe.palaces[horoscope.decadal.index]?.decadal.range ?? [0, 0];

    return {
      algorithm: { ...algorithm },
      summary: {
        gender: astrolabe.gender,
        solarDate: astrolabe.solarDate,
        lunarDate: astrolabe.lunarDate,
        chineseDate: astrolabe.chineseDate,
        time: astrolabe.time,
        timeRange: astrolabe.timeRange,
        sign: astrolabe.sign,
        zodiac: astrolabe.zodiac,
        fiveElementsClass: astrolabe.fiveElementsClass,
        soul: astrolabe.soul,
        body: astrolabe.body,
        soulPalaceBranch: astrolabe.earthlyBranchOfSoulPalace,
        bodyPalaceBranch: astrolabe.earthlyBranchOfBodyPalace,
      },
      palaces: astrolabe.palaces.map((palace) => ({
        index: palace.index,
        name: palace.name,
        heavenlyStem: palace.heavenlyStem,
        earthlyBranch: palace.earthlyBranch,
        isBodyPalace: palace.isBodyPalace,
        isOriginalPalace: palace.isOriginalPalace,
        majorStars: mapStars(palace.majorStars),
        minorStars: mapStars(palace.minorStars),
        adjectiveStars: mapStars(palace.adjectiveStars),
        decadalRange: [...palace.decadal.range],
      })),
      fortune: {
        date: targetDate,
        lunarDate: horoscope.lunarDate,
        year: Number(targetDate.slice(0, 4)),
        nominalAge: horoscope.age.nominalAge,
        decadalRange: [...decadalRange],
        decadal: mapFortuneItem(horoscope.decadal),
        age: mapFortuneItem(horoscope.age),
        yearly: mapFortuneItem(horoscope.yearly),
        monthly: mapFortuneItem(horoscope.monthly),
        daily: mapFortuneItem(horoscope.daily),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("出生")) {
      throw error;
    }
    throw new Error(
      "这组生辰暂时无法排盘，请检查日期、时辰和闰月设置。",
      { cause: error },
    );
  }
}
