# Spec: 紫微古籍馆 MVP

## Objective

Build a public, mobile-responsive Chinese web app where ordinary users can:

1. Enter solar or lunar birth data without uploading it to a server.
2. Generate a Zi Wei Dou Shu chart with twelve palaces.
3. Inspect the decadal fortune and annual fortune for a selected year.
4. Search sourced classical texts and jump from selected chart terms to matching passages.

The product is a traditional-culture research and entertainment tool, and a portfolio work by 嘴笨牛哥.

## Tech Stack

- React 19.2
- TypeScript 6.0
- Vite 8
- iztro 2.5.8
- Vitest 4
- Cloudflare Pages

## Commands

```bash
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

## Project Structure

```text
content/classics/  Markdown classical texts with source metadata
docs/design/       Selected visual target
src/components/    Focused interface components
src/domain/        Chart and fortune adapters
src/lib/           Markdown parsing and search
src/test/          Test setup and fixtures
public/            Cloudflare headers and static metadata
```

## Code Style

Use small typed functions and explicit domain names:

```ts
export function searchClassics(
  documents: ClassicDocument[],
  query: string,
): ClassicSearchResult[] {
  // Return deterministic, relevance-sorted matches.
}
```

## Testing Strategy

- Unit tests for Markdown parsing, search ranking, time-index mapping, and iztro adapters.
- Component tests for the birth form and result navigation.
- Real-browser checks at 320, 768, 1024, and 1440 pixels.
- A visual comparison against `docs/design/reference-option-1.png` before handoff.

## Boundaries

- Always: validate dates and time index; keep calculations in the browser; show source and algorithm information.
- Ask first: adding login, payment, AI interpretation, or private user storage.
- Never: commit secrets; upload birth data; present results as medical, legal, or investment advice; copy unverified modern copyrighted texts.

## Success Criteria

- A valid solar or lunar form produces twelve palaces.
- The selected year produces decadal and annual fortune data.
- Search works across Markdown titles, chapters, keywords, and body text.
- Selecting a palace or star can seed a classical-text search.
- The site works by keyboard and on mobile.
- Tests, lint, type checking, build, browser verification, and design QA pass.
- The public site is available at `https://mingli.lbenben.cc.cd`.
