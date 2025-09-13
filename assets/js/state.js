/**
 * ETS2 Flare Editor - State Management
 * Manages global application state
 */

// Global state variables
let flareAnimations = {};
let flareData = [];
let originalSiiContent = '';
let currentFileName = '';
let currentTheme = 'dark';
let allAnimationsRunning = false;  // Start with OFF state
let currentIncludeInfo = null;  // Store include information

// State management functions
const state = {
    // Initialize state
    init() {
        this.loadTheme();
    },

    // Theme management
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || appConfig.defaultTheme;
        if (savedTheme === 'light') {
            this.setTheme('light');
        }
    },

    setTheme(theme) {
        currentTheme = theme;
        const body = document.body;
        const button = document.querySelector('.theme-toggle');
        
        if (theme === 'light') {
            body.setAttribute('data-theme', 'light');
            button.textContent = '☀️ Light Theme';
        } else {
            body.setAttribute('data-theme', 'dark');
            button.textContent = '🌙 Dark Theme';
        }
        
        localStorage.setItem('theme', theme);
    },

    toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    // Include information management
    setIncludeInfo(includeInfo) {
        currentIncludeInfo = includeInfo;
        console.log('📂 Include info stored:', includeInfo);
    },

    getIncludeInfo() {
        return currentIncludeInfo;
    },

    clearIncludeInfo() {
        currentIncludeInfo = null;
    },

    // Flare data management
    addFlare(flare) {
        flareData.push(flare);
    },

    removeFlare(index) {
        if (flareAnimations[index]) {
            clearInterval(flareAnimations[index].interval);
            delete flareAnimations[index];
        }
        flareData.splice(index, 1);
    },

    updateFlare(index, property, value) {
        if (flareData[index]) {
            flareData[index][property] = isNaN(value) ? value : parseFloat(value);
        }
    },

    renameFlare(index, newName) {
        if (newName.trim() && newName !== flareData[index].name) {
            // Check for duplicate names
            if (flareData.some((f, i) => i !== index && f.name === newName.trim())) {
                ui.showAlert('Flare name already exists', 'warning');
                return false;
            }
            flareData[index].name = newName.trim();
            return true;
        }
        return false;
    },

    clearFlares() {
        // Stop all animations
        Object.values(flareAnimations).forEach(animation => {
            if (animation.interval) clearInterval(animation.interval);
        });
        flareAnimations = {};
        flareData = [];
    },

    // File state management
    setFileContent(content, filename) {
        originalSiiContent = content;
        currentFileName = filename;
    },

    getFileContent() {
        return originalSiiContent;
    },

    getFileName() {
        return currentFileName || 'flare_edited.sii';
    },

    // Animation state
    setAllAnimationsRunning(running) {
        allAnimationsRunning = running;
    },

    isAllAnimationsRunning() {
        return allAnimationsRunning;
    },

    // Get current state
    getFlareData() {
        // Ensure all flares have stateChangeDuration
        flareData.forEach(flare => {
            if (flare.stateChangeDuration === undefined || flare.stateChangeDuration === null) {
                flare.stateChangeDuration = 0.001;
            }
        });
        return flareData;
    },

    getFlareCount() {
        return flareData.length;
    },

    hasFlares() {
        return flareData.length > 0;
    }
};
