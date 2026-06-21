import { RiCompass3Line, RiExternalLinkLine } from "@remixicon/react";
import {
  SHENSHA_CATEGORY_ORDER,
  calculateShensha,
  type ShenshaGender,
} from "../domain/shensha";

interface ShenshaPanelProps {
  chineseDate: string;
  gender: ShenshaGender;
  onKeywordSelect: (keyword: string, documentId: string) => void;
}

export function ShenshaPanel({
  chineseDate,
  gender,
  onKeywordSelect,
}: ShenshaPanelProps) {
  const result = calculateShensha(chineseDate, gender);
  const groupedHits = SHENSHA_CATEGORY_ORDER.map((category) => ({
    category,
    hits: result.hits.filter((hit) => hit.category === category),
  })).filter((group) => group.hits.length > 0);

  return (
    <section
      className="shensha-panel panel-section"
      aria-labelledby="shensha-title"
    >
      <div className="panel-heading">
        <div>
          <span className="section-kicker">典籍取法</span>
          <h2 id="shensha-title">四柱神煞</h2>
        </div>
        <RiCompass3Line aria-hidden="true" />
      </div>

      <div className="shensha-summary">
        <span>{result.checkedRuleCount} 项规则</span>
        <strong>{result.hits.length} 项命中</strong>
        <small>日柱旬空：{result.voidBranches.join("、")}</small>
      </div>

      <div className="shensha-list" aria-label="神煞命中结果">
        {result.hits.length === 0 && (
          <p className="shensha-empty">本次四柱在已核验规则中没有直接命中。</p>
        )}
        {groupedHits.map((group) => (
          <section className="shensha-group" key={group.category}>
            <h3>{group.category}</h3>
            {group.hits.map((hit) => (
              <article className="shensha-item" key={hit.name}>
                <button
                  type="button"
                  onClick={() =>
                    onKeywordSelect(hit.name, hit.source.documentId)
                  }
                >
                  <strong>{hit.name}</strong>
                  <span>{hit.matches.join("、")}</span>
                </button>
                <div>
                  <small>{hit.basis.join("；")}</small>
                  <a
                    href={hit.source.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`核验${hit.name}出处：${hit.source.title}${hit.source.chapter}`}
                  >
                    {hit.source.title} · {hit.source.chapter}
                    <RiExternalLinkLine aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>

      <p className="panel-hint">
        已尽量收录现有四柱可复算的典籍规则；需要胎元、命宫、纳音复合判断的条目不冒充支持。神煞不能脱离整体格局单独断事。
      </p>
    </section>
  );
}
