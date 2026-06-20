import {
  RiBook2Line,
  RiCloseLine,
  RiFileList2Line,
  RiSearchLine,
} from "@remixicon/react";
import type { ClassicCategory, ClassicDocument } from "../lib/classics";

const CATEGORIES: ClassicCategory[] = ["紫微斗数", "四柱命理", "易学卜筮"];

interface LibrarySidebarProps {
  documents: ClassicDocument[];
  selectedId: string;
  activeCategory: ClassicCategory;
  isOpen: boolean;
  onCategoryChange: (category: ClassicCategory) => void;
  onSelect: (document: ClassicDocument) => void;
  onClose: () => void;
}

export function LibrarySidebar({
  documents,
  selectedId,
  activeCategory,
  isOpen,
  onCategoryChange,
  onSelect,
  onClose,
}: LibrarySidebarProps) {
  const categoryDocuments = documents.filter(
    (document) => document.category === activeCategory,
  );

  return (
    <aside
      className={`library-sidebar ${isOpen ? "is-open" : ""}`}
      id="library"
      aria-label="古籍目录"
    >
      <div className="sidebar-heading">
        <div>
          <span className="section-kicker">古籍库</span>
          <h2>有来源的原文</h2>
        </div>
        <button
          className="icon-button sidebar-close"
          type="button"
          aria-label="关闭古籍目录"
          onClick={onClose}
        >
          <RiCloseLine aria-hidden="true" />
        </button>
      </div>

      <label className="sidebar-search">
        <RiSearchLine aria-hidden="true" />
        <input
          type="search"
          aria-label="筛选书目"
          placeholder="搜索书名或章节"
          onChange={(event) => {
            const query = event.target.value.trim().toLowerCase();
            const match = documents.find((document) =>
              `${document.title}${document.chapter}`
                .toLowerCase()
                .includes(query),
            );
            if (query && match) onSelect(match);
          }}
        />
      </label>

      <div className="category-tabs" role="tablist" aria-label="古籍分类">
        {CATEGORIES.map((category) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            className={activeCategory === category ? "is-active" : ""}
            onClick={() => onCategoryChange(category)}
            key={category}
          >
            {category}
            <span>
              {
                documents.filter((document) => document.category === category)
                  .length
              }
            </span>
          </button>
        ))}
      </div>

      <div className="book-list">
        {categoryDocuments.map((document) => (
          <button
            className={`book-item ${
              selectedId === document.id ? "is-selected" : ""
            }`}
            type="button"
            onClick={() => onSelect(document)}
            key={document.id}
          >
            <RiFileList2Line aria-hidden="true" />
            <span>
              <strong>{document.title}</strong>
              <small>{document.chapter}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="source-badge">
        <RiBook2Line aria-hidden="true" />
        <span>
          <strong>来源可核验</strong>
          <small>已收录 {documents.length} 卷公开古籍</small>
        </span>
      </div>
    </aside>
  );
}
