import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarEventLine,
} from "@remixicon/react";
import { useState } from "react";
import type { ChartViewModel, FortuneItem } from "../domain/chart";

type FortuneScope = "decadal" | "age" | "yearly" | "monthly" | "daily";

const FORTUNE_TABS: Array<{ scope: FortuneScope; label: string }> = [
  { scope: "decadal", label: "大限" },
  { scope: "age", label: "小限" },
  { scope: "yearly", label: "流年" },
  { scope: "monthly", label: "流月" },
  { scope: "daily", label: "流日" },
];

interface FortunePanelProps {
  chart: ChartViewModel;
  onYearChange: (year: number) => void;
  onKeywordSelect: (keyword: string) => void;
}

function FortuneDetails({
  item,
  onKeywordSelect,
}: {
  item: FortuneItem;
  onKeywordSelect: (keyword: string) => void;
}) {
  return (
    <div className="fortune-details">
      <p className="fortune-branch">
        {item.heavenlyStem}
        {item.earthlyBranch} · {item.palaceNames.filter(Boolean).slice(0, 3).join("、")}
      </p>
      <div className="fortune-tags" aria-label="四化星曜">
        {item.mutagens.map((mutagen, index) => (
          <button
            type="button"
            onClick={() => onKeywordSelect(mutagen)}
            key={`${mutagen}-${index}`}
          >
            {mutagen}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FortunePanel({
  chart,
  onYearChange,
  onKeywordSelect,
}: FortunePanelProps) {
  const [activeTab, setActiveTab] = useState<FortuneScope>("decadal");
  const item = chart.fortune[activeTab];
  const activeLabel =
    FORTUNE_TABS.find((tab) => tab.scope === activeTab)?.label ?? item.name;

  function cardTitle() {
    if (activeTab === "decadal") {
      return `${chart.fortune.decadalRange[0]}–${chart.fortune.decadalRange[1]} 岁`;
    }
    if (activeTab === "age") {
      return `虚岁 ${chart.fortune.nominalAge}`;
    }
    if (activeTab === "yearly") {
      return `${chart.fortune.year} 年`;
    }
    return `${item.heavenlyStem}${item.earthlyBranch} · ${chart.fortune.lunarDate}`;
  }

  return (
    <section className="fortune-panel panel-section" id="fortune">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">当前查看</span>
          <h2>
            {chart.fortune.date} · 虚岁 {chart.fortune.nominalAge}
          </h2>
        </div>
        <RiCalendarEventLine aria-hidden="true" />
      </div>

      <div className="year-stepper" aria-label="切换流年">
        <button
          type="button"
          aria-label="查看上一年"
          onClick={() => onYearChange(chart.fortune.year - 1)}
        >
          <RiArrowLeftSLine aria-hidden="true" />
        </button>
        <strong>{chart.fortune.year}</strong>
        <button
          type="button"
          aria-label="查看下一年"
          onClick={() => onYearChange(chart.fortune.year + 1)}
        >
          <RiArrowRightSLine aria-hidden="true" />
        </button>
      </div>

      <div className="fortune-tabs" role="tablist" aria-label="运限类型">
        {FORTUNE_TABS.map((tab) => (
          <button
            className={activeTab === tab.scope ? "is-active" : ""}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.scope}
            onClick={() => setActiveTab(tab.scope)}
            key={tab.scope}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="fortune-card" role="tabpanel">
        <span>{activeLabel}信息</span>
        <h3>{cardTitle()}</h3>
        <FortuneDetails item={item} onKeywordSelect={onKeywordSelect} />
      </div>
      <p className="panel-hint">点击四化词，可在下方古籍中查找原文。</p>
    </section>
  );
}
