document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('jeopardy-board');
    const overlayElement = document.getElementById('overlay');
    const overlayContentElement = document.getElementById('overlay-content');
    let gameData = null;

    // --- Data Loading and Validation ---
    async function loadGameData() {
        try {
            const response = await fetch('./data/jeopardy-data.json');
            if (!response.ok) {
                throw new Error(`Data file not found. Ensure 'jeopardy-data.json' is in the 'data' folder. (HTTP Status: ${response.status})`);
            }
            const data = await response.json();
            
            // Basic validation
            if (!Array.isArray(data) || data.length !== 5) {
                throw new Error("Data format error: The JSON file should contain an array of 5 categories.");
            }
            data.forEach((cat, i) => {
                if (!cat.topic || !Array.isArray(cat.clues) || cat.clues.length !== 5) {
                    throw new Error(`Data format error in category #${i+1}. Each category needs a 'topic' and a 'clues' array of 5 items.`);
                }
            });

            gameData = data;
            renderBoard();
        } catch (error) {
            console.error("Failed to load or parse game data:", error);
            displayError(error.message);
        }
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
