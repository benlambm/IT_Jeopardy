#!/usr/bin/env node

/**
 * Local Files Index Generator
 * 
 * This script automatically generates the files.json index by scanning
 * the data directory for valid Jeopardy game files.
 * 
 * Usage:
 *   node generate-files-index.js
 * 
 * Or make it executable and run:
 *   ./generate-files-index.js
 */

const fs = require('fs');
const path = require('path');

/**
 * NOTE: The following validation and formatting functions are duplicated from utils.js.
 * This duplication is intentional because:
 * - utils.js is browser-side code (uses window.JeopardyUtils namespace)
 * - This script runs in Node.js and cannot import browser modules
 * - Keeping both in sync ensures consistent validation across environments
 *
 * If you modify these functions, update both files accordingly.
 */

// Function to validate Jeopardy data structure
// (Matches JeopardyUtils.isValidJeopardyData in utils.js)
function isValidJeopardyFile(data) {
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

// Function to get display name for a file
// (Matches JeopardyUtils.formatDisplayName in utils.js)
function getDisplayName(fileName) {
    let name = fileName.replace('.json', '');
    name = name.replace(/[-_]/g, ' ');
    name = name.replace(/\b\w/g, l => l.toUpperCase());
    return name;
}

console.log('🎮 Jeopardy Files Index Generator');
console.log('==================================\n');

try {
    // Read all JSON files in data directory
    const dataDir = './data';

    if (!fs.existsSync(dataDir)) {
        console.error('❌ Error: data directory not found!');
        process.exit(1);
    }

    const allFiles = fs.readdirSync(dataDir);
    const jsonFiles = allFiles.filter(file => file.endsWith('.json') && file !== 'files.json');

    console.log(`📁 Found ${jsonFiles.length} JSON files in data directory`);

    const validFiles = [];
    const invalidFiles = [];

    jsonFiles.forEach(file => {
        try {
            const filePath = path.join(dataDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            if (isValidJeopardyFile(data)) {
                validFiles.push(file);
                console.log(`✅ ${file} - ${getDisplayName(file)}`);
            } else {
                invalidFiles.push(file);
                console.log(`❌ ${file} - Invalid Jeopardy format`);
            }
        } catch (error) {
            invalidFiles.push(file);
            console.log(`❌ ${file} - ${error.message}`);
        }
    });

    // Sort valid files alphabetically
    validFiles.sort();

    // Generate files.json
    const filesIndex = JSON.stringify(validFiles, null, 2);
    fs.writeFileSync('./data/files.json', filesIndex);

    console.log(`\n🎯 Results:`);
    console.log(`   Valid games: ${validFiles.length}`);
    console.log(`   Invalid files: ${invalidFiles.length}`);
    console.log(`   Generated: data/files.json\n`);

    if (validFiles.length === 0) {
        console.log('⚠️  Warning: No valid game files found!');
        console.log('   Make sure your JSON files follow the Jeopardy format.');
    } else {
        console.log('🚀 Success! Your game selector will now show these games:');
        validFiles.forEach(file => {
            console.log(`   • ${getDisplayName(file)}`);
        });
    }

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
