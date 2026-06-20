import { RiExternalLinkLine, RiSearchLine } from "@remixicon/react";
import type {
  ClassicDocument,
  ClassicSearchResult,
} from "../lib/classics";

interface ClassicPanelProps {
  query: string;
  results: ClassicSearchResult[];
  selectedDocument: ClassicDocument;
  onQueryChange: (query: string) => void;
  onSelect: (document: ClassicDocument) => void;
}

function readableBody(document: ClassicDocument) {
  return document.body
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, 520);
}

export function ClassicPanel({
  query,
  results,
  selectedDocument,
  onQueryChange,
  onSelect,
}: ClassicPanelProps) {
  return (
    <section className="classic-panel panel-section" aria-labelledby="classic-title">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">对应阅读</span>
          <h2 id="classic-title">古籍原文</h2>
        </div>
        <span className="result-count">{results.length} 条</span>
      </div>

      <label className="classic-search">
        <RiSearchLine aria-hidden="true" />
        <input
          type="search"
          aria-label="搜索古籍"
          placeholder="搜宫位、星曜、四化"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      {results.length > 0 && (
        <div className="result-strip" aria-label="古籍搜索结果">
          {results.slice(0, 4).map((result) => (
            <button
              className={
                selectedDocument.id === result.document.id ? "is-active" : ""
              }
              type="button"
              onClick={() => onSelect(result.document)}
              key={result.document.id}
            >
              {result.document.title} · {result.document.chapter}
            </button>
          ))}
        </div>
      )}

      <article className="classic-excerpt">
        <header>
          <span>{selectedDocument.category}</span>
          <h3>
            {selectedDocument.title} · {selectedDocument.chapter}
          </h3>
          <small>{selectedDocument.status}</small>
        </header>
        <p>{readableBody(selectedDocument)}</p>
        <footer>
          <span>{selectedDocument.license}</span>
          <a
            href={selectedDocument.source}
            target="_blank"
            rel="noreferrer"
          >
            核验来源
            <RiExternalLinkLine aria-hidden="true" />
          </a>
        </footer>
      </article>
    </section>
  );
}
