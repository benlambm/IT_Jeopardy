# Repository Guidelines

## Project Structure & Module Organization
- `index.html` and `script.js` drive the Jeopardy board UI; keep DOM ids consistent with these files.
- `new.html` and `new.js` provide the dataset picker; call shared helpers from `utils.js` instead of duplicating logic.
- `utils.js` holds validation, title, and image utilities; extend this module when adding browser helpers.
- `style.css` contains the full design system; reuse class names when introducing new layouts.
- `data/` stores Jeopardy sets (`*.json`) and the generated `files.json` manifest; each dataset must remain a 5×5 grid.

## Build, Test & Development Commands
- `node generate-files-index.js` — Rebuilds `data/files.json` after adding or editing game JSON; exits if structure is invalid.
- `python3 -m http.server 4173` — Serves the repo locally so `fetch` calls resolve; open `http://localhost:4173/new.html`.
- `xdg-open index.html` / `open index.html` — Quick offline sanity check for single datasets.
- `npx prettier@latest --check *.js` — Optional formatting pass that matches the current Vanilla JS style.

## Coding Style & Naming Conventions
- Use 4-space indentation, trailing semicolons, and prefer `const`/`let`; mirror the existing module pattern.
- Favor single quotes in JS; reserve double quotes for HTML attributes or JSON literals.
- Name datasets with kebab-case (`topic-area.json`) so auto-discovery and sorting stay predictable.
- Keep helper names descriptive (`resolveClueImage`) and colocate shared browser utilities inside `JeopardyUtils`.

## Testing Guidelines
- Run `node generate-files-index.js` before every commit to validate clue structure and refresh the manifest.
- Launch `new.html` via a local server and confirm every dataset loads, especially new image-based clues.
- Spot-check `index.html?data=<file>` for manual regression; ensure overlays close and tiles clear after viewing questions.
- When tweaking image logic, test on a throttled network so Wikimedia fallback searches are exercised.

## Commit & Pull Request Guidelines
- Follow the existing short, imperative commit messages (`Update readme`, `Remove …`); add `[skip ci]` only for manifest-only runs.
- Limit each PR to one feature or fix; include a concise summary, manual test notes, and screenshots or GIFs for UI changes.
- Reference related issues in the description and flag any datasets that need educator review before merging.

## Data Management & Automation
- The GitHub Actions workflow mirrors the local index script; never hand-edit `data/files.json` in commits.
- Keep remote image URLs Wikimedia/Wikipedia-hosted for licensing; document any other sources inside the PR discussion.
- Store sensitive classroom material in private branches—no PII or student data should land in `data/`.
