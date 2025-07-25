document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('data-file-select');
    const startButton = document.getElementById('start-game-btn');
    const form = document.getElementById('game-selection-form');
    const overlayElement = document.getElementById('overlay');
    const overlayContentElement = document.getElementById('overlay-content');

    // --- Load Available JSON Files ---
    async function loadAvailableFiles() {
        try {
            // Try to fetch a files index first, fallback to common patterns
            let fileList = [];

            try {
                // Try to fetch a file index (if it exists)
                const indexResponse = await fetch('./data/files.json');
                if (indexResponse.ok) {
                    const indexData = await indexResponse.json();
                    if (Array.isArray(indexData)) {
                        fileList = indexData;
                    }
                }
            } catch (e) {
                // Index file doesn't exist, use common patterns
            }

            // If no index file, try common patterns
            if (fileList.length === 0) {
                fileList = [
                    'jeopardy-data.json',
                    'sample-data.json',
                    'programming.json',
                    'it-basics.json',
                    'science.json',
                    'history.json',
                    'math.json',
                    'geography.json',
                    'literature.json',
                    'technology.json',
                    'web-dev.json',
                    'databases.json',
                    'networking.json',
                    'cybersecurity.json',
                    'algorithms.json',
                    'data-structures.json'
                ];
            }

            const availableFiles = [];

            for (const fileName of fileList) {
                try {
                    const response = await fetch(`./data/${fileName}`);
                    if (response.ok) {
                        // Validate that it's a proper Jeopardy data file
                        const data = await response.json();
                        if (JeopardyUtils.isValidJeopardyData(data)) {
                            availableFiles.push({
                                fileName: fileName,
                                displayName: JeopardyUtils.formatDisplayName(fileName),
                                data: data
                            });
                        }
                    }
                } catch (error) {
                    // File doesn't exist or isn't valid JSON, skip it
                    continue;
                }
            }

            populateDropdown(availableFiles);
        } catch (error) {
            console.error('Error loading available files:', error);
            showError('Failed to load available game files. Please ensure data files are in the data folder.');
        }
    }

    // --- Populate Dropdown ---
    function populateDropdown(files) {
        selectElement.innerHTML = '';

        if (files.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No valid game files found in data folder';
            selectElement.appendChild(option);
            selectElement.disabled = true;
            return;
        }

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a game...';
        selectElement.appendChild(defaultOption);

        // Add available files
        files.forEach(file => {
            const option = document.createElement('option');
            option.value = file.fileName;
            option.textContent = file.displayName;
            selectElement.appendChild(option);
        });

        selectElement.disabled = false;

        // Enable start button when selection is made
        selectElement.addEventListener('change', () => {
            startButton.disabled = !selectElement.value;
        });
    }

    // --- Handle Form Submission ---
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const selectedFile = selectElement.value;
        if (!selectedFile) {
            showError('Please select a game file first.');
            return;
        }

        // Redirect to index.html with the selected file as a parameter
        window.location.href = JeopardyUtils.createGameUrl(selectedFile);
    });

    // --- Error Display ---
    function showError(message) {
        overlayContentElement.innerHTML = `
            <div class="error-message">
                <strong>Error:</strong><br>
                ${message}
            </div>
        `;
        overlayElement.classList.remove('hidden');

        // Close overlay on click
        const closeHandler = () => {
            overlayElement.classList.add('hidden');
            overlayElement.removeEventListener('click', closeHandler);
        };
        overlayElement.addEventListener('click', closeHandler);
    }

    // --- Initialize ---
    loadAvailableFiles();
});
