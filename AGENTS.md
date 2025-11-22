# AI Agent Guide for IT Jeopardy

> **Context:** This is a complete, working application. You are maintaining or extending it, not building from scratch.

## Project Overview

IT Jeopardy is a zero-dependency, client-side classroom game that runs entirely in the browser. No backend, no build tools, no frameworks. Open `index.html` locally or deploy to any static host (GitHub Pages, nginx, etc.) - it works identically in all environments and remains offline-capable after first load.

**Tech Stack:**
- Pure HTML5, CSS3, ES2022+ JavaScript
- No libraries, frameworks, or build steps
- Targets modern browsers (Chrome 93+, Firefox 92+, Safari 15+)

## Core Architecture Principles

1. **Zero Dependencies** - No npm packages, no bundlers, no external libraries
2. **Data-Driven UI** - Never hard-code questions; all content comes from JSON files
3. **Separation of Concerns** - HTML structure, CSS styling, JS logic remain isolated
4. **DOM-Backed State** - Manage game state via CSS classes (`.hidden`, `.answered`) and `data-*` attributes
5. **Offline-First** - Must work without internet after initial load
6. **Graceful Failure** - Missing/malformed data displays friendly error messages

## File Structure

| File | Purpose |
|------|---------|
| `index.html` | Game board with minimal DOM skeleton |
| `new.html` | Game selector interface |
| `script.js` | Main game logic: data loading, rendering, event handling |
| `new.js` | Game selection, file discovery, validation |
| `utils.js` | Shared utilities in `JeopardyUtils` namespace (validation, formatting, error display) |
| `style.css` | Complete styling system with CSS variables |
| `data/*.json` | Game data files (5×5 grid format) |
| `data/files.json` | Auto-generated index of available games |
| `generate-files-index.js` | Node.js script to rebuild `files.json` |

## Development Workflow

### Running the Game

```bash
# Recommended: Game selector
open new.html

# Direct game with default data
open index.html

# Direct game with specific file
open "index.html?data=network-types.json"

# Local server (if testing fetch behavior)
python3 -m http.server 4173
# Then visit: http://localhost:4173/new.html
```

### Adding New Game Data

1. Create `data/your-game.json` following the schema (see below)
2. Run `node generate-files-index.js` to validate and update index
3. Commit both the new game file and updated `data/files.json`
4. GitHub Actions will auto-validate on push

### Validating Game Files

```bash
node generate-files-index.js
# ✅ valid-file.json - Category Name
# ❌ broken-file.json - Invalid Jeopardy format
```

## Game Data Schema

Each JSON file must contain exactly 5 categories with exactly 5 clues each:

```json
[
  {
    "topic": "CATEGORY NAME",
    "clues": [
      {
        "points": 100,
        "answer": "The clue/definition shown to players",
        "question": "The correct response (term only, not 'What is...')"
      },
      { "points": 200, "answer": "...", "question": "..." },
      { "points": 300, "answer": "...", "question": "..." },
      { "points": 400, "answer": "...", "question": "..." },
      { "points": 500, "answer": "...", "question": "..." }
    ]
  }
  // ... 4 more categories
]
```

**Validation:** Both `utils.js` and `generate-files-index.js` contain identical validation logic (intentional duplication for Node vs browser environments).

## Coding Standards

### Style Conventions
- **Indentation:** 4 spaces (no tabs)
- **Quotes:** Single quotes in JS, double quotes in HTML/JSON
- **Semicolons:** Always use trailing semicolons
- **Variables:** Prefer `const`/`let`, never `var`
- **Functions:** Use descriptive names (`resolveClueImage`, not `getImg`)

### Naming Conventions
- **Data files:** kebab-case (`network-types.json`, `wifi1.json`)
- **Classes:** kebab-case (`.clue-box`, `.category-title`)
- **Functions:** camelCase (`loadGameData`, `handleClueClick`)
- **Constants:** camelCase or UPPER_SNAKE_CASE

### Module Pattern
- Utilities live in `window.JeopardyUtils` namespace to avoid global pollution
- Export only what's needed via public API return object

## Testing & Quality Assurance

### Pre-Commit Checklist
1. Run `node generate-files-index.js` to validate all data files
2. Test `new.html` via local server - verify all games load
3. Test `index.html?data=<file>` for new/modified games
4. Verify overlay opens/closes correctly
5. Check that answered tiles clear properly

### Manual Testing
- Test on throttled network (to exercise error handling)
- Verify offline functionality (disable network after first load)
- Test with invalid JSON files (should skip gracefully)

## Game Flow

1. User opens `new.html`
2. `new.js` fetches `data/files.json`
3. Validates each file in parallel via `JeopardyUtils.isValidJeopardyData()`
4. Populates dropdown with valid games (sorted alphabetically)
5. User selects game → redirects to `index.html?data=filename.json`
6. `script.js` loads specified JSON, renders 5×5 board
7. Click flow: Show answer → Show question → Mark answered & clear

## GitHub Actions Automation

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `update-files-index.yml` | Push to `data/**/*.json` | Auto-generates `data/files.json` |
| `deploy-pages.yml` | Push to `main` | Deploys to GitHub Pages |
| `deploy-to-vps.yml` | Push to `main` | Deploys to custom VPS (user-specific) |

**Note:** Index generation includes `[skip ci]` in commit message to prevent loops.

## Extending the Application

When adding features (e.g., score tracking, multi-team support):

1. **Maintain core principles** - Zero-dependency, offline-capable, data-driven
2. **Touch only necessary files** - Don't refactor unrelated code
3. **Preserve backward compatibility** - Existing game data must still work
4. **Follow existing patterns** - DOM state, CSS variables, utility namespace
5. **Update README.md** - Document user-visible changes
6. **Avoid over-engineering** - Simple solutions over abstractions

### CSS Customization

Key variables in `:root`:
```css
--jeopardy-blue: #060ce9;    /* Board background */
--jeopardy-gold: #ffcc00;    /* Points and accents */
--font-family: 'Teko', sans-serif;
```

## Commit & Pull Request Guidelines

- Use short, imperative commit messages (`Update readme`, `Fix validation`)
- Add `[skip ci]` only for `files.json`-only commits to prevent workflow loops
- Limit each PR to one feature or fix
- Include manual test notes and screenshots for UI changes
- Reference related issues in PR description

## Data Management

- Never manually edit `data/files.json` - always regenerate via script
- Keep image URLs Wikimedia/Wikipedia-hosted (licensing compliance)
- No PII or sensitive classroom data in public repository
- Mark educational datasets that need review before merging

## Common Pitfalls

- ❌ Don't manually edit `data/files.json` - regenerate via script
- ❌ Don't add npm dependencies or build steps
- ❌ Don't hard-code game content outside JSON files
- ❌ Don't break offline functionality with external API calls
- ❌ Don't use bash commands (`find`, `grep`, `cat`) when specialized tools exist

## Quick Reference

```bash
# Validate all data files
node generate-files-index.js

# Run local server
python3 -m http.server 4173

# Check code style (optional)
npx prettier@latest --check *.js

# Quick sanity check (offline)
open index.html  # or xdg-open on Linux
```

---

**Maintained by:** Human + AI collaboration
