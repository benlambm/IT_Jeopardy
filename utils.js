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
     * @returns {string} The data file name or default 'jeopardy-data.json'
     */
    function getCurrentDataFile() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('data') || 'jeopardy-data.json';
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

    // Public API
    return {
        formatDisplayName,
        isValidJeopardyData,
        getCurrentDataFile,
        createGameUrl
    };
})();
