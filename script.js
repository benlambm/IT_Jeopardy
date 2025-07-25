document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('jeopardy-board');
    const overlayElement = document.getElementById('overlay');
    const overlayContentElement = document.getElementById('overlay-content');
    let gameData = null;

    // --- Data Loading and Validation ---
    async function loadGameData() {
        try {
            // Check if a specific data file was requested via URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const dataFile = urlParams.get('data') || 'jeopardy-data.json';

            const response = await fetch(`./data/${dataFile}`);
            if (!response.ok) {
                throw new Error(`Data file '${dataFile}' not found. Ensure the file exists in the 'data' folder. (HTTP Status: ${response.status})`);
            }
            const data = await response.json();

            // Basic validation
            if (!Array.isArray(data) || data.length !== 5) {
                throw new Error("Data format error: The JSON file should contain an array of 5 categories.");
            }
            data.forEach((cat, i) => {
                if (!cat.topic || !Array.isArray(cat.clues) || cat.clues.length !== 5) {
                    throw new Error(`Data format error in category #${i + 1}. Each category needs a 'topic' and a 'clues' array of 5 items.`);
                }
            });

            gameData = data;
            updateGameTitle(dataFile);
            renderBoard();
        } catch (error) {
            console.error("Failed to load or parse game data:", error);
            displayError(error.message);
        }
    }

    // --- Update Game Title ---
    function updateGameTitle(dataFile) {
        const headerTitle = document.querySelector('header h1');
        if (dataFile !== 'jeopardy-data.json') {
            const gameName = formatDisplayName(dataFile);
            headerTitle.textContent = `CLASSROOM JEOPARDY - ${gameName.toUpperCase()}`;
        }
    }

    // --- Format File Names for Display ---
    function formatDisplayName(fileName) {
        // Remove .json extension and format nicely
        let name = fileName.replace('.json', '');
        // Replace hyphens and underscores with spaces
        name = name.replace(/[-_]/g, ' ');
        // Capitalize each word
        name = name.replace(/\b\w/g, l => l.toUpperCase());
        return name;
    }

    // --- UI Rendering ---
    function renderBoard() {
        boardElement.innerHTML = ''; // Clear previous board state
        gameData.forEach((category, categoryIndex) => {
            const column = document.createElement('div');
            column.classList.add('category-column');

            const title = document.createElement('div');
            title.classList.add('category-title');
            title.textContent = category.topic;
            column.appendChild(title);

            category.clues.forEach((clue, clueIndex) => {
                const clueBox = document.createElement('div');
                clueBox.classList.add('clue-box');
                clueBox.textContent = clue.points;
                // Store data on the element for easy access
                clueBox.dataset.categoryIndex = categoryIndex;
                clueBox.dataset.clueIndex = clueIndex;
                clueBox.addEventListener('click', handleClueClick);
                column.appendChild(clueBox);
            });

            boardElement.appendChild(column);
        });
    }

    function displayError(message) {
        boardElement.innerHTML = `<div class="error-message"><strong>Error:</strong><br>${message}</div>`;
    }

    // --- Game Logic and Event Handling ---
    function handleClueClick(event) {
        const clueBox = event.target;
        if (clueBox.classList.contains('answered')) return;

        const { categoryIndex, clueIndex } = clueBox.dataset;
        const clueData = gameData[categoryIndex].clues[clueIndex];

        showOverlay(clueData, clueBox);
    }

    function showOverlay(clueData, clueBox) {
        // --- Stage 1: Show the Answer (Clue) ---
        overlayContentElement.textContent = clueData.answer;
        overlayElement.classList.remove('hidden');

        const showQuestionHandler = () => {
            // --- Stage 2: Show the Question (Correct Response) ---
            overlayContentElement.textContent = clueData.question;

            // Remove previous listener to avoid bugs
            overlayElement.removeEventListener('click', showQuestionHandler);

            const closeOverlayHandler = () => {
                // --- Stage 3: Hide Overlay and Mark as Answered ---
                overlayElement.classList.add('hidden');
                clueBox.classList.add('answered');
                clueBox.textContent = ''; // Clear the points
                overlayElement.removeEventListener('click', closeOverlayHandler);
            };
            overlayElement.addEventListener('click', closeOverlayHandler);
        };
        overlayElement.addEventListener('click', showQuestionHandler, { once: true }); // Use { once: true } so this only fires once
    }

    // --- Initialize the Game ---
    loadGameData();
});
