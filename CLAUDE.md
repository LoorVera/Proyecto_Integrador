# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Ecuador Turismo — a static, academic (ESPOL) tourism/trip-planning site: 4 real pages, 100% frontend (HTML/CSS/TypeScript compiled to JS), no backend. `package.json` exists solely to pin the TypeScript version as a `devDependency`; there's no bundler, framework, or other npm dependency.

## Commands

- Install once: `npm install` (installs TypeScript locally into `node_modules/`, gitignored).
- Build TypeScript: `npm run build` (or `tsc -p ts/tsconfig.json` directly) — compiles `ts/main.ts` → `js/main.js`.
- No test suite, linter, or bundler exists in this repo.
- Preview: open `index.html` directly in a browser, or serve the repo root with any static file server (e.g. `python -m http.server`).

## Architecture

- 4 HTML pages — `index.html` (landing: hero carousel, experiences, pricing, login/register/contact), `destinos.html` (destination catalog filterable by region), `organizador.html` (trip budget/itinerary calculator), `privacidad.html` (privacy policy) — share identical header/nav/footer markup and one compiled script (`js/main.js`, loaded with `defer`).
- CSS is split into 4 files, loaded via 4 `<link>` tags in this fixed order in all 4 pages: `css/variables.css` (design tokens + base reset) → `css/layout.css` (header/nav, main/footer containers) → `css/components.css` (buttons, cards, forms, modal, carousel, page-specific styles) → `css/responsive.css` (all media queries, kept together to preserve cascade order). Keep new rules in the file matching their category, and keep the `<link>` order identical across all 4 HTML files — changing it changes the cascade.
- **`ts/main.ts` is the single source of truth for behavior; `js/main.js` is generated output.** Always edit `main.ts` and recompile (`npm run build`) — never hand-edit `js/main.js`.
- `main.ts` has no `import`/`export` (plain global script). `ts/tsconfig.json` intentionally omits `"module"` — the installed TypeScript (7.x) rejects `"none"` as a value, and since there's no import/export, omitting `module` produces the same plain-script output.
- `main.ts` is organized as independent `init*()` functions (`initTheme`, `initMenu`, `initForms`, `initTerminos`, `initContacto`, `initPasswordToggles`, `initCharCounter`, `initCarousel`, `initModal`, `initRating`, `initDestinosFilter`, `initReservas`, `initOrganizador`), plus `refrescarNavSesion`/`cargarExperienciasGuardadas`, all wired up in one `DOMContentLoaded` listener at the bottom of the file.
- Form validation pattern: `Validator = (value: string) => string | null`; validators are composed per field into a `FieldConfig`, checked via `checkField()`, and bound to `blur` + debounced `input` events via `buildFields()`/`bindForm()`. `bindForm()` also takes an optional `onSuccess` callback (used to persist the simulated session). Reuse this pattern for any new form instead of writing bespoke validation.
- `organizador.html`'s calculator uses hardcoded lookup tables `DESTINOS` and `HOSPEDAJE` plus a flat `COMIDA_POR_DIA` constant in `main.ts` — extend these tables rather than adding parallel logic.
- No backend: `localStorage` is the persistence layer for everything client-side — theme (`initTheme`), simulated session (`sesion-usuario`), saved reservations (`reservas-usuario`), user-added experiences (`experiencias-usuario`), and saved trip plans (`viajes-guardados`). Reuse the generic `leerArray`/`guardarArray` helpers in `main.ts` for any new list-shaped data.

## Known in-progress work

- `PLAN.md` at the repo root tracks an active cleanup/feature pass with an ESPOL deadline (2026-08-22). Check it before starting work to avoid duplicating already-planned or already-completed fixes.
- SEO meta tags (canonical, Open Graph, Twitter Card, JSON-LD) across all 4 pages still use a placeholder domain (`https://turismo-ecuador.example.com/`) — if updating, change it consistently across all 4 files.
