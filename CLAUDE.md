# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Ecuador Turismo — a static, academic (ESPOL) tourism/trip-planning site: 5 real pages, 100% frontend (HTML/CSS/TypeScript compiled to JS), no backend. `package.json` exists solely to pin the TypeScript version as a `devDependency`; there's no bundler, framework, or other npm dependency.

## Commands

- Install once: `npm install` (installs TypeScript locally into `node_modules/`, gitignored).
- Build TypeScript: `npm run build` (or `tsc -p ts/tsconfig.json` directly) — compiles `ts/main.ts` → `js/main.js`.
- No test suite, linter, or bundler exists in this repo.
- Preview: open `index.html` directly in a browser, or serve the repo root with any static file server (e.g. `python -m http.server`).

## Architecture

- 5 HTML pages — `index.html` (landing: full-bleed video hero with parallax, experiences, pricing, register/contact — all sections below the hero fade/slide in on scroll via `.scroll-reveal`), `login.html` (standalone login page, split out of `index.html` so the fixed header growing taller after a simulated login — the session box appearing — never overlaps the in-page `#login` anchor scroll position), `organizador.html` (trip budget/itinerary calculator), `mapa.html` (interactive amCharts map of provinces colored by region, with hotels per region), `privacidad.html` (privacy policy) — share identical header/nav/footer markup and one compiled script (`js/main.js`, loaded with `defer`). There is no `destinos.html` — its region/destination browsing role was absorbed by `mapa.html`.
- The header (`.site-header`) is `position: fixed` on all pages; `initHeaderScroll()` in `main.ts` sets `body`'s `padding-top` to the header's real `offsetHeight` (via `ResizeObserver`, recalculated whenever the header's height changes, e.g. session box appearing/disappearing) so content is never covered. Only `index.html` has `<body class="home-redesign">`, which makes `.site-header` transparent (glassmorphism gradient + `backdrop-filter`, see `components.css` section 10) to sit over the video hero; it intentionally never solidifies on scroll. The other 4 pages keep the plain solid `.site-header` background.
- `mapa.html` also loads the amCharts 5 CDN scripts (`index.js`, `map.js`, `geodata/ecuadorLow.js`, `themes/Animated.js`) plus its own hand-written `js/mapa.js` (not compiled from `main.ts` — it's a self-contained wrapper around a third-party widget). Two amCharts5 gotchas that cost real debugging time: (1) calling `chart.set("homeGeoPoint"/"homeZoomLevel")` + `chart.goHome()` leaves every polygon at 0×0 size — don't set those, just let the map auto-fit and call `chart.appear()`; (2) for a `MapPolygonSeries` fed from `geoJSON`, `dataItem.get("name")` returns nothing — the feature's name is at `dataItem.dataContext.name`.
- CSS is split into 4 files, loaded via 4 `<link>` tags in this fixed order in all 5 pages: `css/variables.css` (design tokens + base reset) → `css/layout.css` (header/nav, main/footer containers) → `css/components.css` (buttons, cards, forms, modal, carousel, page-specific styles) → `css/responsive.css` (all media queries, kept together to preserve cascade order). Keep new rules in the file matching their category, and keep the `<link>` order identical across all 5 HTML files — changing it changes the cascade.
- **`ts/main.ts` is the single source of truth for behavior; `js/main.js` is generated output.** Always edit `main.ts` and recompile (`npm run build`) — never hand-edit `js/main.js`.
- `main.ts` has no `import`/`export` (plain global script). `ts/tsconfig.json` intentionally omits `"module"` — the installed TypeScript (7.x) rejects `"none"` as a value, and since there's no import/export, omitting `module` produces the same plain-script output.
- `main.ts` is organized as independent `init*()` functions (`initTheme`, `initMenu`, `initHeaderScroll`, `initForms`, `initTerminos`, `initContacto`, `initPasswordToggles`, `initCharCounter`, `initHeroVideo`, `initHeroParallax`, `initScrollReveal`, `initModal`, `initRating`, `initReservas`, `initOrganizador`), plus `refrescarNavSesion`/`cargarExperienciasGuardadas`, all wired up in one `DOMContentLoaded` listener at the bottom of the file.
- Form validation pattern: `Validator = (value: string) => string | null`; validators are composed per field into a `FieldConfig`, checked via `checkField()`, and bound to `blur` + debounced `input` events via `buildFields()`/`bindForm()`. `bindForm()` also takes an optional `onSuccess` callback (used to persist the simulated session). Reuse this pattern for any new form instead of writing bespoke validation.
- `organizador.html`'s calculator uses hardcoded lookup tables `DESTINOS` and `HOSPEDAJE` plus a flat `COMIDA_POR_DIA` constant in `main.ts` — extend these tables rather than adding parallel logic.
- No backend: `localStorage` is the persistence layer for everything client-side — theme (`initTheme`), simulated session (`sesion-usuario`), saved reservations (`reservas-usuario`), user-added experiences (`experiencias-usuario`), and saved trip plans (`viajes-guardados`). Reuse the generic `leerArray`/`guardarArray` helpers in `main.ts` for any new list-shaped data.

## Known in-progress work

- `PLAN.md` at the repo root tracks an active cleanup/feature pass with an ESPOL deadline (2026-08-22). Check it before starting work to avoid duplicating already-planned or already-completed fixes.
- SEO meta tags (canonical, Open Graph, Twitter Card, JSON-LD) across all 5 pages still use a placeholder domain (`https://turismo-ecuador.example.com/`) — if updating, change it consistently across all 5 files.
