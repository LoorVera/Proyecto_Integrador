# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Ecuador Turismo — a static, academic (ESPOL) tourism/trip-planning site: 3 real pages, 100% frontend (HTML/CSS/TypeScript compiled to JS), no backend, no npm project (`package.json` does not exist).

## Commands

- Build TypeScript: `cd ts && tsc` — reads `ts/tsconfig.json`, compiles `ts/main.ts` → `js/main.js`.
- No test suite, linter, or bundler exists in this repo.
- Preview: open `index.html` directly in a browser, or serve the repo root with any static file server (e.g. `python -m http.server`).

## Architecture

- 3 HTML pages — `index.html` (landing: hero carousel, experiences, pricing, login/register/contact), `destinos.html` (destination catalog filterable by region), `organizador.html` (trip budget/itinerary calculator) — share identical header/nav/footer markup and one compiled script (`js/main.js`, loaded with `defer`).
- CSS is split into 4 files, loaded via 4 `<link>` tags in this fixed order in all 3 pages: `css/variables.css` (design tokens + base reset) → `css/layout.css` (header/nav, main/footer containers) → `css/components.css` (buttons, cards, forms, modal, carousel, page-specific styles) → `css/responsive.css` (all media queries, kept together to preserve cascade order). Keep new rules in the file matching their category, and keep the `<link>` order identical across all 3 HTML files — changing it changes the cascade.
- **`ts/main.ts` is the single source of truth for behavior; `js/main.js` is generated output.** Always edit `main.ts` and recompile — never hand-edit `js/main.js`.
- `main.ts` has no `import`/`export` (plain global script). `ts/tsconfig.json` intentionally omits `"module"` — the installed TypeScript (7.x) rejects `"none"` as a value, and since there's no import/export, omitting `module` produces the same plain-script output.
- `main.ts` is organized as independent `init*()` functions (`initTheme`, `initMenu`, `initForms`, `initContacto`, `initPasswordToggles`, `initCharCounter`, `initCarousel`, `initModal`, `initRating`, `initDestinosFilter`, `initOrganizador`), all wired up in one `DOMContentLoaded` listener at the bottom of the file.
- Form validation pattern: `Validator = (value: string) => string | null`; validators are composed per field into a `FieldConfig`, checked via `checkField()`, and bound to `blur` + debounced `input` events via `buildFields()`/`bindForm()`. Reuse this pattern for any new form instead of writing bespoke validation.
- `organizador.html`'s calculator uses hardcoded lookup tables `DESTINOS` and `HOSPEDAJE` plus a flat `COMIDA_POR_DIA` constant in `main.ts` — extend these tables rather than adding parallel logic.
- Theme (dark/light) persistence uses `localStorage` directly (see `initTheme`) — this is the established pattern for any future client-side persistence, since the project is backend-free by design.

## Known in-progress work

- `PLAN.md` at the repo root tracks an active cleanup/feature pass with an ESPOL deadline (2026-08-22). Check it before starting work to avoid duplicating already-planned or already-completed fixes.
- SEO meta tags (canonical, Open Graph, Twitter Card, JSON-LD) across all 3 pages still use a placeholder domain (`https://turismo-ecuador.example.com/`) — if updating, change it consistently across all 3 files.
