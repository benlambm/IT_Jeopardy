# IT Jeopardy Game for Classroom Learning

A simple, self-contained Jeopardy game to run in a web browser for classroom learning. This application runs entirely offline after the first load and requires no server or internet connection to play.

### How to Use

#### Quick Start (Single Game)
1.  **Prepare Your Questions:** Create or edit your question set in the `data/jeopardy-data.json` file.
2.  **Run the Game:** Double-click the `index.html` file to open it in your preferred web browser.

#### Multiple Games (Recommended)
1.  **Prepare Multiple Game Files:** Create multiple JSON files in the `data` folder (e.g., `science.json`, `history.json`, etc.).
2.  **Game Selection:** Double-click the `new.html` file to open the game selector.
3.  **Choose Your Game:** Select from available game files using the dropdown menu and click "START GAME".

### File Structure

Your project folder should look like this:

```
/jeopardy-game/
|-- data/
|   |-- jeopardy-data.json  <-- Default game file
|   |-- sample-data.json    <-- Additional game files
|   |-- programming.json    <-- Add as many as you want
|   `-- files.json          <-- Optional: list of available games
|-- new.html                <-- GAME SELECTOR (Recommended start point)
|-- index.html              <-- Direct game launcher
|-- style.css
`-- script.js
```

#### Adding New Game Files
- Create new `.json` files in the `data` folder following the same format
- **Automatic Discovery**: 
  - GitHub Actions will auto-update `files.json` when you push changes
  - Or run `node generate-files-index.js` locally to regenerate the index
- The game selector will automatically detect and validate new files
- Invalid files are automatically excluded with helpful error messages

### 🤖 Automated File Management

This project includes GitHub Actions automation for seamless file management:

#### Automatic Index Generation
- **Trigger**: Runs automatically when JSON files are added/modified in the `data` folder
- **Process**: Validates all JSON files and updates `files.json` with valid games only
- **Deployment**: GitHub Pages automatically serves the updated content

#### Manual Index Generation
For local development or manual updates:
```bash
# Generate files.json locally
node generate-files-index.js

# The script will:
# ✅ Scan data folder for JSON files
# ✅ Validate Jeopardy format (5 categories × 5 clues)
# ✅ Generate sorted files.json index
# ✅ Show helpful validation results
```

#### GitHub Pages Setup
1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The site will auto-deploy on every push to main branch
4. Access your game at: `https://yourusername.github.io/your-repo-name/new.html`

---

### ⭐ Using an AI to Generate Your Questions

You can use any modern LLM (like ChatGPT, Claude, etc.) to automatically create the `jeopardy-data.json` file for you.

Simply copy the prompt below, paste it into the AI chat, and replace the last line with your own topics or a paste of your class notes. The AI will generate the file content in the exact format the game needs.

#### Custom LLM Prompt for Generating `jeopardy-data.json`

```
You are an expert curriculum designer tasked with creating a `jeopardy-data.json` file for a classroom game. Your output must be a single, valid JSON code block and nothing else.

The JSON structure must follow these strict rules:
1.  The root element is a JSON array `[]`.
2.  The array must contain exactly 5 category objects `{}`.
3.  Each category object must have two keys:
    - `"topic"`: A string for the category name.
    - `"clues"`: An array of exactly 5 clue objects.
4.  Each clue object must have three keys:
    - `"points"`: A number, which must be `100`, `200`, `300`, `400`, and `500` in order for the 5 clues.
    - `"answer"`: A string that is the clue/definition displayed to the player.
    - `"question"`: A string that is the correct response. This should be the term itself, NOT in the "What is..." format (e.g., "HTML", not "What is HTML?").

Based on the materials I provide below, generate the complete `jeopardy-data.json` content.

---
[PASTE YOUR TOPICS OR CLASS NOTES HERE. For example: "Create a Jeopardy board based on the following 5 topics: US History, Basic Chemistry, World Capitals, Shakespeare's Plays, and Simple Algebra."]
