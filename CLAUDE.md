# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Vite)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

No linter or test runner is configured.

## Architecture

Single-page React app that streams Polish radio stations. Everything lives in one component file (`src/App.jsx`) with co-located sub-components: `StationCard`, `MiniPlayer`, `WaveAnimation`, and SVG icon components.

Audio playback uses a single `<audio>` element managed via ref, with automatic retry on error/stall and network reconnection handling.

Station data is a static array in `src/data/stations.js` (named export `stations`). Each station has `id`, `name`, `logoUrl` (imported asset), and `streamUrl`.

## Styling

Material Design 3 dark theme with a violet seed color, implemented as pure CSS custom properties in `src/App.css`. No component library — all layout, tokens, and animations are hand-rolled. Roboto font loaded via Google Fonts in `index.html`.

## Deployment

GitHub Pages via Actions workflow (`.github/workflows/deploy.yml`). Pushes to `main` trigger build and deploy. Vite `base` is set to `/radio/` in `vite.config.js` to match the Pages subpath.

Live at: https://lunarem.com/radio/
