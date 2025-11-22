document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('jeopardy-board');
    const overlayElement = document.getElementById('overlay');
    const overlayContentElement = document.getElementById('overlay-content');

    // Verify critical DOM elements exist
    if (!boardElement || !overlayElement || !overlayContentElement) {
        console.error('Critical DOM elements missing');
        alert('Error: Page structure is incomplete. Please refresh or contact support.');
        return;
    }

    let gameData = null;

    // --- Data Loading and Validation ---
    async function loadGameData() {
        try {
            // Check if a specific data file was requested via URL parameter
            const dataFile = JeopardyUtils.getCurrentDataFile();

            const response = await fetch(`./data/${dataFile}`);
            if (!response.ok) {
                throw new Error(`Data file '${dataFile}' not found. Ensure the file exists in the 'data' folder. (HTTP Status: ${response.status})`);
            }
            const data = await response.json();

            // Validate data format
            if (!JeopardyUtils.isValidJeopardyData(data)) {
                throw new Error("Data format error: The JSON file should contain an array of 5 categories, each with 5 clues containing points, answer, and question fields.");
            }

            gameData = data;
            JeopardyUtils.updateGameTitle(dataFile);
            renderBoard();
        } catch (error) {
            console.error("Failed to load or parse game data:", error);
            JeopardyUtils.showFatalError(error.message);
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

            const closeOverlayHandler = () => {
                // --- Stage 3: Hide Overlay and Mark as Answered ---
                overlayElement.classList.add('hidden');
                clueBox.classList.add('answered');
                clueBox.textContent = ''; // Clear the points
            };
            overlayElement.addEventListener('click', closeOverlayHandler, { once: true });
        };
        overlayElement.addEventListener('click', showQuestionHandler, { once: true });
    }

    // --- Initialize the Game ---
    loadGameData();
});
