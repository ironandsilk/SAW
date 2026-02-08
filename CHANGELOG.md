# Changelog

All notable changes to SAW will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
with epic/story linking for production tracking.

---

## [Unreleased]

### In Progress
- Epic 1.1: Camera System (partial)

### Added
- **Chat panel (TONKA)** — Bottom-left, edit the editor from within
- **Theme Hierarchy panel** — Toggle modules, track versions per theme
- Progress bars per epic
- Module on/off switches

---

## [0.1.0] - 2026-02-07

> Initial scaffold. Spatial-first foundation.

### Epic 1.1: Camera System
- [x] Story: Implement free camera with Bryce-style movement (orbit, pan, dolly)
- [x] Story: Add camera presets (top, front, side, perspective)

### Added
- **Core package** — Contracts for shell, input, scene, panel + event bus
- **Web shell** — Browser-based container with resize handling
- **Spatial viewport** — Three.js scene as THE interface
- **Bryce camera** — Orbit/pan/dolly with spherical coordinates
- **Chrome overlay** — Top bar, side panels, bottom status, nav widget
- **Light/dark themes** — Full theme system with persistence

### Technical
- Monorepo with pnpm workspaces
- Vite + TypeScript + vanilla Three.js
- CSS custom properties for theming
- Input-agnostic navigation contracts

### Commits
- `ffe3bc8` — Initial scaffold: spatial-first editor with Bryce UI
- `09133fe` — Remove emojis, add light/dark theme support

---

## Version History

| Version | Date | Focus |
|---------|------|-------|
| 0.1.0 | 2026-02-07 | Foundation, camera, theming |

---

*Tracking inspired by Autodesk ShotGrid. Every change tells a story.*
