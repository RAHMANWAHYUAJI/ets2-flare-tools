/**
 * ETS2 Flare Editor - Main Application
 * Handles initialization and event binding
 */

const app = {
    // Initialize application
    init() {
        console.log(`${appConfig.name} v${appConfig.version} - Loading...`);
        
        // Initialize state
        state.init();
        
        // Bind events
        this.bindEvents();
        
        // Check file system access support
        this.checkFileSystemSupport();
        
        console.log(`${appConfig.name} - Ready with full functionality!`);
    },

    // Bind all event handlers
    bindEvents() {
        // Theme toggle
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => state.toggleTheme());
        }

        // File input handler
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.name.endsWith(appConfig.fileExtension)) {
                        fileManager.loadSiiFile(file);
                    } else {
                        ui.showAlert(`Please select a valid ${appConfig.fileExtension} file`, 'warning');
                    }
                }
            });
        }

        // File input button
        const fileInputBtn = document.querySelector('.file-input-button');
        if (fileInputBtn) {
            fileInputBtn.addEventListener('click', () => {
                if (fileInput) fileInput.click();
            });
        }

        // Save button
        const saveBtn = document.getElementById('saveButton');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => fileManager.saveFile());
        }

        // Global flare type selector
        const globalFlareType = document.getElementById('globalFlareType');
        if (globalFlareType) {
            globalFlareType.addEventListener('change', (e) => {
                ui.switchGlobalFlareType(e.target.value);
            });
        }

        // Toggle all animations button
        const toggleAllBtn = document.getElementById('toggleAllBtn');
        if (toggleAllBtn) {
            toggleAllBtn.addEventListener('click', () => animation.toggleAllAnimations());
        }

        // Add flare modal controls
        this.bindModalEvents();

        // Create empty file button
        const createEmptyBtn = document.querySelector('button[onclick="createEmptySii()"]');
        if (createEmptyBtn) {
            createEmptyBtn.addEventListener('click', () => editor.createEmptySii());
        }

        // Keyboard shortcuts
        this.bindKeyboardShortcuts();
    },

    // Bind modal events
    bindModalEvents() {
        // Show add flare modal
        const addFlareBtn = document.querySelector('button[onclick="showAddFlareModal()"]');
        if (addFlareBtn) {
            addFlareBtn.addEventListener('click', () => ui.showAddFlareModal());
        }

        // Close modal buttons
        const modalCloseBtn = document.querySelector('.modal-close');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => ui.closeAddFlareModal());
        }

        const cancelBtn = document.querySelector('button[onclick="closeAddFlareModal()"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => ui.closeAddFlareModal());
        }

        // Create flare button
        const createFlareBtn = document.querySelector('button[onclick="createNewFlare()"]');
        if (createFlareBtn) {
            createFlareBtn.addEventListener('click', () => editor.createNewFlare());
        }

        // Close modal on outside click
        const modal = document.getElementById('addFlareModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    ui.closeAddFlareModal();
                }
            });
        }

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('addFlareModal');
                if (modal && modal.style.display === 'flex') {
                    ui.closeAddFlareModal();
                }
            }
        });
    },

    // Bind keyboard shortcuts
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (state.hasFlares()) {
                    fileManager.saveFile();
                }
            }
            
            // Ctrl+O to open file
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.click();
            }
            
            // Ctrl+N to create new
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                editor.createEmptySii();
            }
            
            // Ctrl+Shift+A to add new flare
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                ui.showAddFlareModal();
            }
            
            // Space to toggle all animations
            if (e.key === ' ' && e.target === document.body) {
                e.preventDefault();
                animation.toggleAllAnimations();
            }
            
            // F1 for help (future feature)
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
        });
    },

    // Check file system access support
    checkFileSystemSupport() {
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            if ('showSaveFilePicker' in window) {
                saveButton.title = 'Simpan file - akan membuka dialog Save As (Ctrl+S)';
            } else {
                saveButton.title = 'Simpan file - akan download ke folder default (Ctrl+S)';
            }
        }
    },

    // Show help modal (future feature)
    showHelp() {
        const helpText = `
${appConfig.name} v${appConfig.version} - Keyboard Shortcuts:

Ctrl+S    - Save file
Ctrl+O    - Open file
Ctrl+N    - Create new file
Ctrl+Shift+A - Add new flare
Space     - Toggle all animations
Escape    - Close modal
F1        - Show this help

Mouse Controls:
- Click flare name to rename
- Click pattern chars to toggle ON/OFF
- Click Toggle button to start/stop individual flare
        `;
        ui.showAlert(helpText, 'info', 'Help - Flare Editor Controls');
    },

    // Error handler
    handleError(error, context = 'Application') {
        console.error(`${context} Error:`, error);
        ui.showAlert(`${context} Error: ${error.message}`, 'error');
    }
};

// Global functions for backward compatibility with inline onclick handlers
// These will be removed once we fully convert to modular system

function toggleTheme() {
    state.toggleTheme();
}

function showAddFlareModal() {
    ui.showAddFlareModal();
}

function closeAddFlareModal() {
    ui.closeAddFlareModal();
}

function createNewFlare() {
    editor.createNewFlare();
}

function createEmptySii() {
    editor.createEmptySii();
}

function switchGlobalFlareType(type) {
    ui.switchGlobalFlareType(type);
}

function toggleAllAnimations() {
    animation.toggleAllAnimations();
}

function saveFile() {
    fileManager.saveFile();
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        app.init();
    } catch (error) {
        app.handleError(error, 'Initialization');
    }
});
