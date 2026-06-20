import { astro } from "iztro";

export type CalendarType = "solar" | "lunar";
export type Gender = "男" | "女";

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
  heavenlyStem: string;
  earthlyBranch: string;
  palaceNames: string[];
  mutagens: string[];
  starsByPalace: string[][];
}

export interface ChartViewModel {
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
    year: number;
    nominalAge: number;
    decadalRange: [number, number];
    decadal: FortuneItem;
    yearly: FortuneItem;
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

function validateInput(input: BirthInput, targetYear: number) {
  if (!Number.isInteger(input.timeIndex) || input.timeIndex < 0 || input.timeIndex > 12) {
    throw new Error("出生时辰需要从早子时到晚子时中选择。");
  }

  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(input.date)) {
    throw new Error("出生日期格式不正确，请重新选择年月日。");
  }

  if (!Number.isInteger(targetYear) || targetYear < 1900 || targetYear > 2100) {
    throw new Error("流年年份暂时支持 1900 至 2100 年。");
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
  heavenlyStem: string;
  earthlyBranch: string;
  palaceNames: string[];
  mutagen: string[];
  stars?: Array<Array<{ name: string }>>;
}): FortuneItem {
  return {
    index: item.index,
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
  targetYear: number,
): ChartViewModel {
  validateInput(input, targetYear);

  try {
    const astrolabe =
      input.calendar === "solar"
        ? astro.bySolar(input.date, input.timeIndex, input.gender, input.fixLeap, "zh-CN")
        : astro.byLunar(
            input.date,
            input.timeIndex,
            input.gender,
            input.isLeapMonth,
            input.fixLeap,
            "zh-CN",
          );

    // Mid-year avoids mixing the previous and selected lunar year at the boundary.
    const horoscope = astrolabe.horoscope(`${targetYear}-6-20`);
    const decadalRange =
      astrolabe.palaces[horoscope.decadal.index]?.decadal.range ?? [0, 0];

    return {
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
        year: targetYear,
        nominalAge: horoscope.age.nominalAge,
        decadalRange: [...decadalRange],
        decadal: mapFortuneItem(horoscope.decadal),
        yearly: mapFortuneItem(horoscope.yearly),
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
