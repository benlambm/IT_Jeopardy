# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

IT Jeopardy is a zero-dependency, client-side classroom Jeopardy game that runs entirely in the browser. The game requires no server, build tools, or internet connection after initial load. It features automatic game discovery, GitHub Actions automation, and a clean separation between game data and presentation logic.

## Architecture & Core Principles

### Zero-Dependency Design
- **No frameworks or libraries** - Pure HTML5, CSS3, and ES2022+ JavaScript
- **No build steps** - All JavaScript runs directly in the browser
- **Offline-capable** - Works without internet after first load
- **Client-only** - No server required, just open `index.html` or `new.html`

### File Structure & Responsibilities
- `index.html` - Direct game launcher with minimal board skeleton
- `new.html` - Game selector interface for choosing from multiple games  
- `script.js` - Main game logic, data loading, board rendering, game state
- `new.js` - Game selection logic, file discovery, validation
- `utils.js` - Shared utilities in `JeopardyUtils` namespace
- `style.css` - All styling with CSS variables for theming
- `data/*.json` - Game data files (5 categories × 5 clues format)
- `generate-files-index.js` - Node script to auto-generate `data/files.json`

### Data-Driven Architecture
The game dynamically loads JSON data files from the `data/` folder. Each file must contain exactly 5 categories with 5 clues each. The `files.json` index is auto-generated to list available games.

## Common Development Tasks

### Run the Game Locally
```bash
# Option 1: Open game selector (recommended)
open new.html

# Option 2: Direct game with default data
open index.html

# Option 3: Direct game with specific data file
open "index.html?data=your-game.json"
```

### Generate Files Index
```bash
# Automatically scan and validate all game files in data/
node generate-files-index.js

# This updates data/files.json with valid games only
```

### Add New Game Data
1. Create a new JSON file in `data/` folder following the schema
2. Run `node generate-files-index.js` to update the index
3. The game selector will automatically detect it

### Validate Game Data Format
```bash
# The generate script validates all files automatically
node generate-files-index.js

# Valid files show: ✅ filename.json
# Invalid files show: ❌ filename.json - Error details
```

### Test GitHub Actions Locally
```bash
# The workflows auto-trigger on push to main when data files change
# To test file index generation:
node generate-files-index.js
```

## JSON Game Data Schema

```json
[
  {
    "topic": "CATEGORY NAME",
    "clues": [
      {
        "points": 100,
        "answer": "The clue/definition shown to players",
        "question": "The correct response (just the term, not 'What is...')"
      },
      // ... exactly 5 clues with points: 100, 200, 300, 400, 500
    ]
  }
  // ... exactly 5 categories
]
```

## Key Implementation Details

### State Management
- Game state managed via DOM with CSS classes (`.hidden`, `.answered`)
- Data attributes store indices (`data-category-index`, `data-clue-index`)
- No external state management needed

### Error Handling
- Graceful failures with user-friendly messages via overlay
- Automatic validation of game files during discovery
- Invalid files excluded with console warnings

### Game Flow
1. **new.html** → Loads `files.json` → Validates each file → Shows dropdown
2. User selects game → Redirects to `index.html?data=filename.json`
3. **index.html** → Loads specified JSON → Renders board → Handles gameplay
4. Click flow: Show answer → Show question → Mark as answered

### GitHub Actions Automation
- **update-files-index.yml**: Auto-generates `files.json` when data files change
- **deploy-pages.yml**: Deploys to GitHub Pages on push to main
- Site available at: `https://[username].github.io/[repo]/new.html`

## Extending the Game

When adding features:
1. Maintain zero-dependency, offline-capable architecture
2. Follow existing patterns (DOM state, CSS variables, utilities namespace)
3. Keep backward compatibility with existing game data files
4. Update README.md for user-visible changes
5. Touch only necessary files - preserve existing code where possible

## CSS Theming

Key CSS variables in `:root`:
- `--jeopardy-blue: #060ce9` - Board and overlay background
- `--jeopardy-gold: #ffcc00` - Points and accent color
- `--font-family: 'Teko', sans-serif` - Game typography

## Browser Compatibility

Targets modern browsers with ES2022+ support:
- Chrome/Edge 93+
- Firefox 92+
- Safari 15+

## Important Notes from Copilot Instructions

- **Separation of Concerns**: Keep HTML, CSS, JS isolated
- **Data-Driven UI**: Never hard-code questions or categories
- **Graceful Failure**: Missing/malformed JSON → friendly message
- **DOM-Backed State**: Manage via CSS classes and data attributes
- **Quality & Simplicity**: Readable, minimal-complexity code preferred
