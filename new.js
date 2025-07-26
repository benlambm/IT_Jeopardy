document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('data-file-select');
    const startButton = document.getElementById('start-game-btn');
    const form = document.getElementById('game-selection-form');

    // --- Load Available JSON Files ---
    async function loadAvailableFiles() {
        try {
            const response = await fetch('./data/files.json');
            if (!response.ok) {
                throw new Error('The `data/files.json` index file is missing or could not be loaded. This file is required to list available games.');
            }
            const fileList = await response.json();

            if (!Array.isArray(fileList) || fileList.length === 0) {
                throw new Error('The `data/files.json` file is not a valid, non-empty array. Please check its format.');
            }

            const availableFiles = [];
            // Use Promise.all to validate files in parallel for faster loading
            await Promise.all(fileList.map(async (fileName) => {
                try {
                    const res = await fetch(`./data/${fileName}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (JeopardyUtils.isValidJeopardyData(data)) {
                            availableFiles.push({
                                fileName: fileName,
                                displayName: JeopardyUtils.formatDisplayName(fileName),
                            });
                        }
                    }
                } catch (error) {
                    // Log and skip invalid or missing files
                    console.warn(`Skipping file "${fileName}" due to validation or fetch error.`, error);
                }
            }));

            // Sort files alphabetically by display name for a better user experience
            availableFiles.sort((a, b) => a.displayName.localeCompare(b.displayName));

            populateDropdown(availableFiles);
        } catch (error) {
            console.error('Error loading available files:', error);
            JeopardyUtils.showFatalError(error.message);
            // Disable the form if we can't load files
            selectElement.disabled = true;
            startButton.disabled = true;
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
            // This case should ideally not be hit if the button is disabled
            JeopardyUtils.showFatalError('Please select a game from the list.');
            return;
        }

        // Redirect to index.html with the selected file as a parameter
        window.location.href = JeopardyUtils.createGameUrl(selectedFile);
    });

    // Error display is now handled by the centralized JeopardyUtils.showFatalError

    // --- Initialize ---
    loadAvailableFiles();
});
