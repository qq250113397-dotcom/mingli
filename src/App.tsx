import { RiGithubLine, RiShieldCheckLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { AlgorithmDialog } from "./components/AlgorithmDialog";
import { AppHeader } from "./components/AppHeader";
import { AstrolabeGrid } from "./components/AstrolabeGrid";
import { BirthForm } from "./components/BirthForm";
import { ClassicPanel } from "./components/ClassicPanel";
import { FortunePanel } from "./components/FortunePanel";
import { LibrarySidebar } from "./components/LibrarySidebar";
import { ShenshaPanel } from "./components/ShenshaPanel";
import {
  DEFAULT_ALGORITHM_OPTIONS,
  buildChart,
  type AlgorithmOptions,
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
const DEFAULT_TARGET_DATE = "2026-06-20";
const DEFAULT_QUERY = "紫微";
const DEFAULT_DOCUMENT =
  searchClassics(CLASSIC_DOCUMENTS, DEFAULT_QUERY)[0].document;

export function App() {
  const [birth, setBirth] = useState(DEFAULT_BIRTH);
  const [targetDate, setTargetDate] = useState(DEFAULT_TARGET_DATE);
  const [algorithm, setAlgorithm] = useState(DEFAULT_ALGORITHM_OPTIONS);
  const [chart, setChart] = useState(() =>
    buildChart(
      DEFAULT_BIRTH,
      DEFAULT_TARGET_DATE,
      DEFAULT_ALGORITHM_OPTIONS,
    ),
  );
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

  function updateQuery(nextQuery: string, preferredDocumentId?: string) {
    setQuery(nextQuery);
    const preferredDocument = preferredDocumentId
      ? CLASSIC_DOCUMENTS.find(
          (document) => document.id === preferredDocumentId,
        )
      : undefined;
    const nextDocument =
      preferredDocument ??
      searchClassics(CLASSIC_DOCUMENTS, nextQuery)[0]?.document;
    if (nextDocument) selectDocument(nextDocument);
  }

  function updateChart(
    nextBirth: BirthInput,
    nextTargetDate: string,
    nextAlgorithm: AlgorithmOptions = algorithm,
  ) {
    try {
      const nextChart = buildChart(
        nextBirth,
        nextTargetDate,
        nextAlgorithm,
      );
      setBirth(nextBirth);
      setTargetDate(nextChart.fortune.date);
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
    const [, month, day] = chart.fortune.date.split("-");
    updateChart(birth, `${nextYear}-${month}-${day}`);
  }

  function applyAlgorithm(nextAlgorithm: AlgorithmOptions) {
    updateChart(birth, targetDate, nextAlgorithm);
    setAlgorithm(nextAlgorithm);
    setSettingsOpen(false);
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
            key={targetDate}
            initialBirth={birth}
            initialTargetDate={targetDate}
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

        <aside
          className="insight-sidebar"
          aria-label="运限、神煞和古籍原文"
        >
          <FortunePanel
            chart={chart}
            onYearChange={changeYear}
            onKeywordSelect={updateQuery}
          />
          <ShenshaPanel
            chineseDate={chart.summary.chineseDate}
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
        <AlgorithmDialog
          options={algorithm}
          onApply={applyAlgorithm}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
