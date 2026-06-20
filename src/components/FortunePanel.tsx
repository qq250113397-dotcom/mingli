import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarEventLine,
} from "@remixicon/react";
import { useState } from "react";
import type { ChartViewModel, FortuneItem } from "../domain/chart";

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
  const [activeTab, setActiveTab] = useState<"decadal" | "yearly">("decadal");
  const item =
    activeTab === "decadal" ? chart.fortune.decadal : chart.fortune.yearly;

  return (
    <section className="fortune-panel panel-section" id="fortune">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">当前查看</span>
          <h2>
            {chart.fortune.year} 年 · 虚岁 {chart.fortune.nominalAge}
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
        <button
          className={activeTab === "decadal" ? "is-active" : ""}
          type="button"
          role="tab"
          aria-selected={activeTab === "decadal"}
          onClick={() => setActiveTab("decadal")}
        >
          大限
        </button>
        <button
          className={activeTab === "yearly" ? "is-active" : ""}
          type="button"
          role="tab"
          aria-selected={activeTab === "yearly"}
          onClick={() => setActiveTab("yearly")}
        >
          流年
        </button>
      </div>

      <div className="fortune-card">
        <span>{activeTab === "decadal" ? "十年区间" : "年度信息"}</span>
        <h3>
          {activeTab === "decadal"
            ? `${chart.fortune.decadalRange[0]}–${chart.fortune.decadalRange[1]} 岁`
            : `${chart.fortune.year} 年`}
        </h3>
        <FortuneDetails item={item} onKeywordSelect={onKeywordSelect} />
      </div>
      <p className="panel-hint">点击四化词，可在下方古籍中查找原文。</p>
    </section>
  );
}
