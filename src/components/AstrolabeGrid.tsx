import type { ChartPalace, ChartViewModel } from "../domain/chart";

const GRID_ORDER = [0, 1, 2, 3, 11, 4, 10, 5, 9, 8, 7, 6];

interface AstrolabeGridProps {
  chart: ChartViewModel;
  selectedPalace: number;
  onSelectPalace: (palace: ChartPalace) => void;
}

function PalaceButton({
  palace,
  isSelected,
  onSelect,
}: {
  palace: ChartPalace;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const stars = [...palace.majorStars, ...palace.minorStars].slice(0, 4);
  const palaceLabel = palace.name.endsWith("宫")
    ? palace.name
    : `${palace.name}宫`;

  return (
    <button
      className={`palace palace--${palace.index} ${
        isSelected ? "is-selected" : ""
      }`}
      type="button"
      aria-label={`${palaceLabel}，${stars.map((star) => star.name).join("、")}`}
      onClick={onSelect}
    >
      <span className="palace__meta">
        {palace.heavenlyStem}
        {palace.earthlyBranch}
        <small>
          {palace.decadalRange[0]}–{palace.decadalRange[1]}
        </small>
      </span>
      <strong>{palaceLabel}</strong>
      <span className="palace__stars">
        {stars.length > 0
          ? stars.map((star) => (
              <span className={star.mutagen ? "has-mutagen" : ""} key={star.name}>
                {star.name}
                {star.mutagen ? `·${star.mutagen}` : ""}
              </span>
            ))
          : "星曜平守"}
      </span>
      <small className="palace__flags">
        {palace.isOriginalPalace ? "来因宫" : ""}
        {palace.isBodyPalace ? " 身宫" : ""}
      </small>
    </button>
  );
}

export function AstrolabeGrid({
  chart,
  selectedPalace,
  onSelectPalace,
}: AstrolabeGridProps) {
  const orderedPalaces = GRID_ORDER.map(
    (index) => chart.palaces.find((palace) => palace.index === index)!,
  );

  return (
    <section
      className="astrolabe"
      id="chart"
      role="region"
      aria-label="紫微斗数命盘"
    >
      {orderedPalaces.map((palace) => (
        <PalaceButton
          palace={palace}
          isSelected={selectedPalace === palace.index}
          onSelect={() => onSelectPalace(palace)}
          key={palace.index}
        />
      ))}

      <div className="chart-center">
        <span className="section-kicker">命盘信息</span>
        <h2>
          {chart.summary.solarDate} · {chart.summary.time}
        </h2>
        <dl>
          <div>
            <dt>农历</dt>
            <dd>{chart.summary.lunarDate}</dd>
          </div>
          <div>
            <dt>四柱</dt>
            <dd>{chart.summary.chineseDate}</dd>
          </div>
          <div>
            <dt>五行局</dt>
            <dd>{chart.summary.fiveElementsClass}</dd>
          </div>
          <div>
            <dt>命主 / 身主</dt>
            <dd>
              {chart.summary.soul} / {chart.summary.body}
            </dd>
          </div>
        </dl>
        <p>
          {chart.summary.gender} · {chart.summary.sign} · 属
          {chart.summary.zodiac}
        </p>
      </div>
    </section>
  );
}
