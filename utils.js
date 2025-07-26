/**
 * Jeopardy Game Utilities
 * 
 * Shared utility functions for the Jeopardy game application.
 * This file maintains the zero-dependency, client-side architecture.
 */

// Namespace for Jeopardy utilities to avoid global pollution
window.JeopardyUtils = (function () {
    'use strict';

    /**
     * Formats a filename into a human-readable display name
     * @param {string} fileName - The JSON filename (e.g., "programming.json")
     * @returns {string} Formatted display name (e.g., "Programming")
     */
    function formatDisplayName(fileName) {
        // Remove .json extension and format nicely
        let name = fileName.replace('.json', '');
        // Replace hyphens and underscores with spaces
        name = name.replace(/[-_]/g, ' ');
        // Capitalize each word
        name = name.replace(/\b\w/g, l => l.toUpperCase());
        return name;
    }

    /**
     * Validates if data matches the Jeopardy game format
     * @param {*} data - The data to validate
     * @returns {boolean} True if valid Jeopardy format, false otherwise
     */
    function isValidJeopardyData(data) {
        if (!Array.isArray(data) || data.length !== 5) {
            return false;
        }

        return data.every(category => {
            return category.topic &&
                Array.isArray(category.clues) &&
                category.clues.length === 5 &&
                category.clues.every(clue =>
                    clue.points && clue.answer && clue.question
                );
        });
    }

    /**
     * Gets the current data file parameter from URL
     * @returns {string} The data file name or default 'a-plus.json'
     */
    function getCurrentDataFile() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('data') || 'a-plus.json';
    }

    /**
     * Creates a URL for launching a game with specific data file
     * @param {string} dataFile - The data file name
     * @returns {string} Complete URL with data parameter
     */
    function createGameUrl(dataFile) {
        const baseUrl = window.location.origin + window.location.pathname.replace('new.html', 'index.html');
        return `${baseUrl}?data=${encodeURIComponent(dataFile)}`;
    }

    /**
     * Displays a fatal error message in a full-screen overlay.
     * @param {string} message - The error message to display.
     */
    function showFatalError(message) {
        const overlayElement = document.getElementById('overlay');
        const overlayContentElement = document.getElementById('overlay-content');

        if (!overlayElement || !overlayContentElement) {
            console.error('Cannot display fatal error because overlay elements are not in the DOM.');
            alert(`Critical Error: ${message}`); // Fallback for when the DOM is broken
            return;
        }

        overlayContentElement.innerHTML = `<div class="error-message"><strong>Error:</strong><br>${message}</div>`;
        overlayElement.classList.remove('hidden');

        // Add a one-time listener to close the overlay on click
        const closeHandler = () => {
            overlayElement.classList.add('hidden');
            overlayElement.removeEventListener('click', closeHandler);
        };
        overlayElement.addEventListener('click', closeHandler);
    }

    /**
     * Updates the main H1 title of the game page.
     * @param {string} dataFile - The name of the game data file being used.
     */
    function updateGameTitle(dataFile) {
        const headerTitle = document.querySelector('header h1');
        if (headerTitle && dataFile !== 'a-plus.json') {
            const gameName = formatDisplayName(dataFile);
            headerTitle.textContent = `CLASSROOM JEOPARDY - ${gameName.toUpperCase()}`;
        }
    }

    // Public API
    return {
        formatDisplayName,
        isValidJeopardyData,
        getCurrentDataFile,
        createGameUrl,
        showFatalError,
        updateGameTitle
    };
})();
