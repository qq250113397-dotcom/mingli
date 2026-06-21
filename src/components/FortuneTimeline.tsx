import { RiBookOpenLine, RiSparkling2Line } from "@remixicon/react";
import type {
  AnnualReading,
  DecadalTimeline,
} from "../domain/annual-reading";

interface FortuneTimelineProps {
  timeline: DecadalTimeline;
  selectedYear: number;
  reading: AnnualReading;
  onYearChange: (year: number) => void;
}

export function FortuneTimeline({
  timeline,
  selectedYear,
  reading,
  onYearChange,
}: FortuneTimelineProps) {
  return (
    <section className="fortune-visual" aria-labelledby="fortune-visual-title">
      <div className="fortune-visual__heading">
        <div>
          <span className="section-kicker">像直播一样横向看运程</span>
          <h2 id="fortune-visual-title">十年流年图</h2>
          <p>
            {timeline.decadalRange[0]}–{timeline.decadalRange[1]} 岁 ·{" "}
            {timeline.heavenlyStem}
            {timeline.earthlyBranch}大限 · 大限命宫在
            {timeline.focusPalace}
          </p>
        </div>
        <RiSparkling2Line aria-hidden="true" />
      </div>

      <div className="fortune-ruler" aria-label="选择要查看的流年">
        {timeline.years.map((item) => (
          <button
            className={item.year === selectedYear ? "is-selected" : ""}
            type="button"
            aria-pressed={item.year === selectedYear}
            aria-label={`${item.year} 年，虚岁 ${item.nominalAge}，${item.heavenlyStem}${item.earthlyBranch}，流年命宫 ${item.focusPalace}`}
            onClick={() => onYearChange(item.year)}
            key={item.year}
          >
            <span>{item.year}</span>
            <strong>
              {item.heavenlyStem}
              {item.earthlyBranch}
            </strong>
            <small>虚岁 {item.nominalAge}</small>
            <em>{item.focusPalace}</em>
          </button>
        ))}
      </div>

      <article className="annual-commentary">
        <div className="annual-commentary__title">
          <RiBookOpenLine aria-hidden="true" />
          <div>
            <span>规则化解读 · 可查看依据</span>
            <h3>{reading.title}</h3>
          </div>
        </div>

        <p className="annual-commentary__summary">{reading.summary}</p>

        <div className="annual-commentary__grid">
          {reading.sections.map((section) => (
            <section key={section.label}>
              <h4>{section.label}</h4>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        <dl className="annual-evidence" aria-label="批注推导依据">
          {reading.evidence.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <p className="annual-commentary__disclaimer">{reading.disclaimer}</p>
      </article>
    </section>
  );
}
