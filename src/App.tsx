import { RiGithubLine, RiShieldCheckLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { AlgorithmDialog } from "./components/AlgorithmDialog";
import { AppHeader } from "./components/AppHeader";
import { AstrolabeGrid } from "./components/AstrolabeGrid";
import { BirthForm } from "./components/BirthForm";
import { ClassicPanel } from "./components/ClassicPanel";
import { FortunePanel } from "./components/FortunePanel";
import { LibrarySidebar } from "./components/LibrarySidebar";
import {
  buildChart,
  type BirthInput,
  type ChartPalace,
} from "./domain/chart";
import { CLASSIC_DOCUMENTS } from "./lib/classic-content";
import {
  searchClassics,
  type ClassicCategory,
  type ClassicDocument,
} from "./lib/classics";

const DEFAULT_BIRTH: BirthInput = {
  calendar: "solar",
  date: "1990-05-20",
  timeIndex: 8,
  gender: "男",
  isLeapMonth: false,
  fixLeap: true,
};
const DEFAULT_QUERY = "紫微";
const DEFAULT_DOCUMENT =
  searchClassics(CLASSIC_DOCUMENTS, DEFAULT_QUERY)[0].document;

export function App() {
  const [birth, setBirth] = useState(DEFAULT_BIRTH);
  const [year, setYear] = useState(2026);
  const [chart, setChart] = useState(() => buildChart(DEFAULT_BIRTH, 2026));
  const [selectedPalace, setSelectedPalace] = useState(7);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [selectedDocument, setSelectedDocument] = useState(DEFAULT_DOCUMENT);
  const [activeCategory, setActiveCategory] =
    useState<ClassicCategory>("紫微斗数");
  const [isLibraryOpen, setLibraryOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState("");
  const results = useMemo(
    () => searchClassics(CLASSIC_DOCUMENTS, query),
    [query],
  );

  function selectDocument(document: ClassicDocument) {
    setSelectedDocument(document);
    setActiveCategory(document.category);
    setLibraryOpen(false);
  }

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    const nextResult = searchClassics(CLASSIC_DOCUMENTS, nextQuery)[0];
    if (nextResult) selectDocument(nextResult.document);
  }

  function updateChart(nextBirth: BirthInput, nextYear: number) {
    try {
      const nextChart = buildChart(nextBirth, nextYear);
      setBirth(nextBirth);
      setYear(nextYear);
      setChart(nextChart);
      setError("");
    } catch (chartError) {
      setError(
        chartError instanceof Error
          ? chartError.message
          : "暂时无法排盘，请检查输入。",
      );
    }
  }

  function selectPalace(palace: ChartPalace) {
    setSelectedPalace(palace.index);
    updateQuery(palace.name.replace(/宫$/, ""));
  }

  function changeYear(nextYear: number) {
    updateChart(birth, nextYear);
  }

  function focusClassicSearch() {
    document
      .querySelector<HTMLInputElement>('input[aria-label="搜索古籍"]')
      ?.focus();
  }

  return (
    <div className="app-shell" id="top">
      <AppHeader
        onOpenLibrary={() => setLibraryOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onFocusSearch={focusClassicSearch}
      />

      <div className="workspace">
        <LibrarySidebar
          documents={CLASSIC_DOCUMENTS}
          selectedId={selectedDocument.id}
          activeCategory={activeCategory}
          isOpen={isLibraryOpen}
          onCategoryChange={setActiveCategory}
          onSelect={selectDocument}
          onClose={() => setLibraryOpen(false)}
        />

        <main className="chart-workspace">
          <BirthForm
            initialBirth={DEFAULT_BIRTH}
            initialYear={year}
            onSubmit={updateChart}
          />
          {error && <p role="alert">{error}</p>}
          <AstrolabeGrid
            chart={chart}
            selectedPalace={selectedPalace}
            onSelectPalace={selectPalace}
          />
          <section className="privacy-callout" id="about">
            <RiShieldCheckLine aria-hidden="true" />
            <div>
              <h2>一件公开、可核验的传统文化作品</h2>
              <p>
                排盘在本地完成，古籍保留来源与许可。内容仅供传统文化研究和娱乐，
                不作为医疗、法律、投资等现实决策依据。
              </p>
            </div>
            <a
              href="https://github.com/qq250113397-dotcom/mingli"
              target="_blank"
              rel="noreferrer"
            >
              <RiGithubLine aria-hidden="true" />
              查看源码
            </a>
          </section>
        </main>

        <aside className="insight-sidebar" aria-label="运限和古籍原文">
          <FortunePanel
            chart={chart}
            onYearChange={changeYear}
            onKeywordSelect={updateQuery}
          />
          <ClassicPanel
            query={query}
            results={results}
            selectedDocument={selectedDocument}
            onQueryChange={updateQuery}
            onSelect={selectDocument}
          />
        </aside>
      </div>

      <footer className="site-footer">
        <span>传统文化研究与娱乐用途</span>
        <span>嘴笨牛哥 × Codex · 2026</span>
      </footer>

      {isLibraryOpen && (
        <button
          className="drawer-backdrop"
          type="button"
          aria-label="关闭古籍目录"
          onClick={() => setLibraryOpen(false)}
        />
      )}
      {isSettingsOpen && (
        <AlgorithmDialog onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
