// Global variables
let correctionHistory = [];

// DOM Elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const predictionsDiv = document.getElementById('predictions');
const historyDiv = document.getElementById('history');
const correctBtn = document.getElementById('correctBtn');
const clearBtn = document.getElementById('clearBtn');

// Load history from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Correct button click
    correctBtn.addEventListener('click', correctText);
    
    // Clear button click
    clearBtn.addEventListener('click', clearText);
    
// Removed real-time prediction event listener and click handler for predictions
}

// Correct text using the backend API
async function correctText() {
    const text = inputText.value.trim();
    
    if (!text) {
        alert('Please enter some text to correct.');
        return;
    }
    
    // Show loading indicator
    outputText.innerHTML = '<div class="loading"></div> Processing...';
    
    try {
        const response = await fetch('/correct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Display corrected text
        displayResult(result);
        
        // Add to history
        addToHistory(result);
        
        // Save to localStorage
        saveHistory();
        
    } catch (error) {
        console.error('Error:', error);
        outputText.innerHTML = `Error: ${error.message}`;
    }
}

// Display correction result
function displayResult(result) {
    let html = '';
    
    if (result.original !== result.spelling_corrected) {
        html += `<div><strong>Spelling Correction:</strong> ${result.spelling_corrected}</div>`;
    }
    
    if (result.spelling_corrected !== result.grammar_corrected) {
        html += `<div><strong>Grammar Correction:</strong> ${result.grammar_corrected}</div>`;
    }
    
    if (result.grammar_corrected !== result.fluency_improved) {
        html += `<div><strong>Fluency Improvement:</strong> ${result.fluency_improved}</div>`;
    }
    
    // If all corrections are the same, just show the final result
    if (!html) {
        html = `<div>${result.fluency_improved || result.original}</div>`;
    }
    
    outputText.innerHTML = html;
    
    // Removed predictions display
}

// Removed getPredictions and displayPredictions functions

// Add correction to history
function addToHistory(result) {
    const historyItem = {
        id: Date.now(),
        original: result.original,
        corrected: result.fluency_improved || result.grammar_corrected || result.spelling_corrected || result.original,
        timestamp: new Date().toLocaleString()
    };
    
    correctionHistory.unshift(historyItem);
    
    // Limit history to 20 items
    if (correctionHistory.length > 20) {
        correctionHistory = correctionHistory.slice(0, 20);
    }
    
    displayHistory();
}

// Display history
function displayHistory() {
    if (correctionHistory.length === 0) {
        historyDiv.innerHTML = '<p class="text-muted">No history yet. Correct some text to see history here.</p>';
        return;
    }
    
    let html = '';
    correctionHistory.forEach(item => {
        html += `
            <div class="history-item">
                <div class="timestamp">${item.timestamp}</div>
                <div class="original">${item.original}</div>
                <div class="corrected">${item.corrected}</div>
            </div>
        `;
    });
    
    historyDiv.innerHTML = html;
}

// Load history from localStorage
function loadHistory() {
    try {
        const savedHistory = localStorage.getItem('autocorrectHistory');
        if (savedHistory) {
            correctionHistory = JSON.parse(savedHistory);
            displayHistory();
        }
    } catch (error) {
        console.error('Error loading history:', error);
        correctionHistory = [];
    }
}

// Save history to localStorage
function saveHistory() {
    try {
        localStorage.setItem('autocorrectHistory', JSON.stringify(correctionHistory));
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

// Clear input text
function clearText() {
    inputText.value = '';
    outputText.innerHTML = '';
    predictionsDiv.innerHTML = '<span class="badge bg-secondary">Start typing to see predictions...</span>';
    inputText.focus();
}
