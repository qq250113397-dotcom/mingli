import {
  RiBookOpenLine,
  RiMenuLine,
  RiQuestionLine,
  RiSearchLine,
  RiSettings3Line,
} from "@remixicon/react";

interface AppHeaderProps {
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onFocusSearch: () => void;
}

export function AppHeader({
  onOpenLibrary,
  onOpenSettings,
  onFocusSearch,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <button
        className="icon-button app-header__menu"
        type="button"
        aria-label="打开古籍目录"
        onClick={onOpenLibrary}
      >
        <RiMenuLine aria-hidden="true" />
      </button>

      <a className="brand" href="#top" aria-label="紫微古籍馆首页">
        <h1 className="brand__name">紫微古籍馆</h1>
        <span className="brand__seal" aria-hidden="true">
          典
        </span>
        <span className="brand__tagline">查古籍，也排命盘</span>
      </a>

      <nav className="primary-nav" aria-label="主要导航">
        <a className="is-active" href="#chart">
          排盘
        </a>
        <a href="#fortune">运限</a>
        <a href="#library">古籍库</a>
        <a href="#about">关于作品</a>
      </nav>

      <div className="app-header__actions">
        <button
          className="icon-button"
          type="button"
          aria-label="搜索古籍"
          onClick={onFocusSearch}
        >
          <RiSearchLine aria-hidden="true" />
        </button>
        <a
          className="icon-button"
          href="#about"
          aria-label="查看使用说明"
        >
          <RiQuestionLine aria-hidden="true" />
        </a>
        <button
          className="icon-button"
          type="button"
          aria-label="打开算法设置"
          onClick={onOpenSettings}
        >
          <RiSettings3Line aria-hidden="true" />
        </button>
        <span className="app-header__book" aria-hidden="true">
          <RiBookOpenLine />
        </span>
      </div>
    </header>
  );
}
