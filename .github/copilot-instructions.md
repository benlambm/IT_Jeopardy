---
applyTo: "**"
---

# Classroom IT Jeopardy – AI Instructions (2025)

> **Status:** A complete, working Jeopardy game already exists in this repo.  
> You are _maintaining or extending_ it, not starting from scratch.

## 1 Purpose

Keep the game **zero-dependency, client-only, offline-friendly**. Opening `index.html` must be enough to run it locally, and the same files should run unmodified when hosted on GitHub Pages or any static web server.

## 2 Tech stack

- **HTML5** – structure
- **CSS3** – styling (colors & fonts via `:root` variables)
- **Plain ES 2022+ JavaScript** – all logic, _no_ external libraries or frameworks

## 3 File contracts

| File          | Role                                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| `index.html`  | Minimal board + overlay skeleton                                                        |
| `style.css`   | Grid layout, theme, typography                                                          |
| `script.js`   | Load & validate data JSON files; render UI; handle state & clicks; surface clear errors |
| `data/*.json` | Game data source files; must match the expected schema                                  |

## 4 Design principles

1. **Separation of Concerns** – keep HTML, CSS, JS isolated.
2. **Data-Driven UI** – never hard-code questions or categories.
3. **Graceful Failure** – missing / malformed JSON ⇒ friendly message.
4. **DOM-Backed State** – manage via CSS classes (`.hidden`, `.answered`) & `data-*` attributes.
5. **Quality & Simplicity** – readable, minimal-complexity code; prefer elegant solutions.

## 5 Extending the game

- New features or pages are welcome **if they remain zero-dependency and offline-capable**.
- Re-use shared CSS variables and follow the existing grid / typography system.
- Avoid build steps; new JS must run as-is in the browser.
- Update these instructions if the public API of game data files or file layout changes.

## 6 Feature workflow

When adding a feature (e.g., score tracking, multi-team support, settings page):

1. Decide whether it belongs in the main page or a new page / module.
2. Touch only the necessary files; keep other code untouched where possible.
3. Follow Principles 1-5.
4. Maintain backward compatibility with existing game data files unless the schema is version-bumped.
5. Document any new user-visible behaviour in `README.md`.

## 7 Architectural ethos

Strive for resilient, modular MVPs that “just run” with the least setup—whether opened locally or hosted as a static site—aligned with best practices in software system design, architecture, and full-stack quality.
