/**
 * ETS2 Flare Editor - UI Management
 * Handles user interface creation and management
 */

const ui = {
    // Display all flares in the container
    displayFlares() {
        const container = document.getElementById('flareContainer');
        container.innerHTML = '';
        
        // Stop all existing animations
        animation.stopAllAnimations();
        
        state.getFlareData().forEach((flare, index) => {
            const flareItem = this.createFlareItem(flare, index);
            container.appendChild(flareItem);
        });

        // Start animations after display
        animation.startAllAnimations();
    },

    // Create individual flare item UI
    createFlareItem(flare, index) {
        const item = document.createElement('div');
        item.className = 'flare-item';
        
        const lightTypeOptions = lightTypes.map(type => 
            `<option value="${type}" ${flare.lightType === type ? 'selected' : ''}>${type}</option>`
        ).join('');
        
        const dirTypeOptions = directionTypes.map(type => 
            `<option value="${type}" ${flare.dirType === type ? 'selected' : ''}>${type}</option>`
        ).join('');
        
        // Create different UI based on flare type
        if (flare.type === 'flare_blink') {
            item.innerHTML = this.createBlinkFlareUI(flare, index, lightTypeOptions, dirTypeOptions);
        } else {
            item.innerHTML = this.createVehicleFlareUI(flare, index, lightTypeOptions, dirTypeOptions);
        }
        
        return item;
    },

    // Create UI for blink flare
    createBlinkFlareUI(flare, index, lightTypeOptions, dirTypeOptions) {
        const patternChars = flare.blinkPattern.split('').map((char, i) => 
            `<div class="pattern-char ${char === 'X' ? 'active' : ''}" 
                 onclick="editor.togglePatternChar(${index}, ${i})" 
                 data-char="${char}">${char}</div>`
        ).join('');
        
        return `
            <div class="flare-header">
                <input type="text" class="flare-name-edit" value="${flare.name}" 
                       onchange="editor.renameFlare(${index}, this.value)" onblur="this.style.display='none'; this.nextElementSibling.style.display='block';" style="display:none;">
                <div class="flare-name" onclick="this.style.display='none'; this.previousElementSibling.style.display='block'; this.previousElementSibling.focus();" 
                     style="cursor: pointer;">${flare.name} <small style="opacity: 0.7;">(${flare.type})</small></div>
                <div class="flare-actions">
                    <button class="control-button warning" onclick="editor.deleteFlare(${index})">🗑️ Delete</button>
                </div>
            </div>
            <div class="flare-content">
                <div class="flare-preview">
                    <div class="flare-light" id="light-${index}"></div>
                    <div class="preview-controls">
                        <button class="control-button warning" id="toggle-btn-${index}" onclick="animation.toggleFlareAnimation(${index})" style="padding: 6px 12px; font-size: 12px; min-width: 60px;">
                            🔴 OFF
                        </button>
                    </div>
                </div>
                <div class="flare-editor">
                    ${this.createEditorGrid(flare, index, lightTypeOptions, dirTypeOptions, true)}
                    ${this.createPatternSection(flare, index, patternChars)}
                    ${this.createBiasToggleSection(flare, index)}
                    ${flare.hasBias ? this.createBiasSection(flare, index) : ''}
                </div>
            </div>
        `;
    },

    // Create UI for vehicle flare
    createVehicleFlareUI(flare, index, lightTypeOptions, dirTypeOptions) {
        return `
            <div class="flare-header">
                <input type="text" class="flare-name-edit" value="${flare.name}" 
                       onchange="editor.renameFlare(${index}, this.value)" onblur="this.style.display='none'; this.nextElementSibling.style.display='block';" style="display:none;">
                <div class="flare-name" onclick="this.style.display='none'; this.previousElementSibling.style.display='block'; this.previousElementSibling.focus();" 
                     style="cursor: pointer;">${flare.name} <small style="opacity: 0.7;">(${flare.type})</small></div>
                <div class="flare-actions">
                    <button class="control-button warning" onclick="editor.deleteFlare(${index})">🗑️ Delete</button>
                </div>
            </div>
            <div class="flare-content">
                <div class="flare-preview">
                    <div class="flare-light" id="light-${index}"></div>
                    <div class="preview-controls">
                        <button class="control-button warning" id="vehicle-toggle-btn-${index}" onclick="animation.toggleVehicleFlare(${index})" style="padding: 6px 12px; font-size: 12px; min-width: 60px;">
                            🟢 ON
                        </button>
                    </div>
                </div>
                <div class="flare-editor">
                    ${this.createEditorGrid(flare, index, lightTypeOptions, dirTypeOptions, false)}
                    ${this.createBiasToggleSection(flare, index)}
                    ${flare.hasBias ? this.createBiasSection(flare, index) : ''}
                </div>
            </div>
        `;
    },

    // Create editor grid
    createEditorGrid(flare, index, lightTypeOptions, dirTypeOptions, isBlinkType) {
        const blinkFields = isBlinkType ? `
                <div style="display: flex; align-items: center; gap: 4px; flex: 1;">
                    <label style="font-size: 12px; min-width: 35px;">Step Length:</label>
                    <input type="number" class="editor-input" style="flex: 1; font-size: 12px;" value="${flare.blinkStepLength}" min="0.01" max="5" step="0.01"
                           onchange="editor.updateFlareProperty(${index}, 'blinkStepLength', this.value)">
                </div>
        ` : '';

        return `
            <div style="display: flex; gap: 18px; align-items: center; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 4px; flex: 1;">
                    <label style="font-size: 12px; min-width: 35px;">Flare Type:</label>
                    <select class="editor-select" style="flex: 1; font-size: 12px;" onchange="editor.changeFlareType(${index}, this.value)">
                        <option value="flare_blink" ${flare.type === 'flare_blink' ? 'selected' : ''}>Blink</option>
                        <option value="flare_vehicle" ${flare.type === 'flare_vehicle' ? 'selected' : ''}>Vehicle</option>
                    </select>
                </div>
                <div style="display: flex; align-items: center; gap: 4px; flex: 1;">
                    <label style="font-size: 12px; min-width: 35px;">Light Type:</label>
                    <select class="editor-select" style="flex: 1; font-size: 12px;" onchange="editor.updateFlareProperty(${index}, 'lightType', this.value)">
                        ${lightTypeOptions}
                    </select>
                </div>
                <div style="display: flex; align-items: center; gap: 4px; flex: 1;">
                    <label style="font-size: 12px; min-width: 35px;">Dir Type:</label>
                    <select class="editor-select" style="flex: 1; font-size: 12px;" onchange="editor.updateFlareProperty(${index}, 'dirType', this.value)">
                        ${dirTypeOptions}
                    </select>
                </div>
                ${blinkFields}
                <div style="display: flex; align-items: center; gap: 4px; flex: 1;">
                    <label style="font-size: 12px; min-width: 35px;">Duration:</label>
                    <input type="number" class="editor-input" style="flex: 1; font-size: 12px;" value="${flare.stateChangeDuration}" min="0.001" max="1" step="0.001"
                           onchange="editor.updateFlareProperty(${index}, 'stateChangeDuration', this.value)">
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label class="editor-label" style="margin: 0; min-width: 65px; font-size: 13px;">Model:</label>
                    <input type="text" class="editor-input" style="flex: 1;" value="${flare.model || ''}" placeholder="/vehicle/truck/model/accessory.pmd" onchange="editor.updateFlareProperty(${index}, 'model', this.value)" id="model-input-${index}">
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label class="editor-label" style="margin: 0; min-width: 65px; font-size: 13px;">Light:</label>
                    <input type="text" class="editor-input" style="flex: 1;" value="${flare.modelLightSource || ''}" placeholder="/vehicle/truck/model/light.pmd" onchange="editor.updateFlareProperty(${index}, 'modelLightSource', this.value)" id="modellight-input-${index}">
                </div>
            </div>
        `;
    },

    // Create bias toggle section
    createBiasToggleSection(flare, index) {
        return `
            <div style="display: flex; align-items: center; gap: 12px; margin: 16px 0;">
                <label style="margin: 0; font-size: 16px; color: var(--text-primary);">🔆 Bias</label>
                <label class="toggle-switch">
                    <input type="checkbox" ${flare.hasBias ? 'checked' : ''} onchange="editor.toggleBias(${index}, this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
    },

    // Create bias settings section
    createBiasSection(flare, index) {
        return `
            <div class="bias-section" id="bias-section-${index}" style="margin-top: 20px; padding: 15px; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--border-color);">
                <h4 style="color: var(--accent-primary); margin-bottom: 15px;">🔆 Bias Settings</h4>
                <div style="display: flex; gap: 20px; align-items: flex-start;">
                    <div class="editor-grid" style="flex: 1;">
                        <div class="editor-field">
                            <label class="editor-label">Bias Type</label>
                            <select class="editor-select" onchange="editor.updateFlareProperty(${index}, 'biasType', this.value)">
                                <option value="spot" ${flare.biasType === 'spot' ? 'selected' : ''}>spot</option>
                                <option value="point" ${flare.biasType === 'point' ? 'selected' : ''}>point</option>
                            </select>
                        </div>
                        <div class="editor-field">
                            <label class="editor-label">Setup Type</label>
                            <select class="editor-select" onchange="editor.updateFlareProperty(${index}, 'biasSetup', this.value)">
                                <option value="candela_hue_saturation" ${flare.biasSetup === 'candela_hue_saturation' ? 'selected' : ''}>candela_hue_saturation</option>
                                <option value="lumen_hue_saturation" ${flare.biasSetup === 'lumen_hue_saturation' ? 'selected' : ''}>lumen_hue_saturation</option>
                                <option value="lux_hue_saturation" ${flare.biasSetup === 'lux_hue_saturation' ? 'selected' : ''}>lux_hue_saturation</option>
                            </select>
                        </div>
                        <div class="editor-field">
                            <label class="editor-label">Diffuse Color</label>
                            <input type="text" class="editor-input" value="${flare.diffuseColor}" placeholder="(400, 38, 100)"
                                   oninput="editor.updateFlarePropertyDebounced(${index}, 'diffuseColor', this.value, 200)"
                                   onchange="editor.updateFlareProperty(${index}, 'diffuseColor', this.value)">
                        </div>
                        <div class="editor-field">
                            <label class="editor-label">Specular Color</label>
                            <input type="text" class="editor-input" value="${flare.specularColor}" placeholder="(400, 38, 100)"
                                   oninput="editor.updateFlarePropertyDebounced(${index}, 'specularColor', this.value, 200)"
                                   onchange="editor.updateFlareProperty(${index}, 'specularColor', this.value)">
                        </div>
                        <div class="editor-field">
                            <label class="editor-label">Range</label>
                            <input type="number" class="editor-input" value="${flare.range}" min="1" max="500" step="1"
                                   oninput="editor.updateFlareProperty(${index}, 'range', this.value)"
                                   onchange="editor.updateFlareProperty(${index}, 'range', this.value)">
                        </div>
                        <div class="editor-field">
                            <label class="editor-label">Inner Angle</label>
                            <input type="number" class="editor-input" value="${flare.innerAngle}" min="0" max="180" step="1"
                                   oninput="editor.updateFlareProperty(${index}, 'innerAngle', this.value)"
                                   onchange="editor.updateFlareProperty(${index}, 'innerAngle', this.value)">
                        </div>
                        <div class="editor-field">
                            <label class="editor-label">Outer Angle</label>
                            <input type="number" class="editor-input" value="${flare.outerAngle}" min="0" max="180" step="1"
                                   oninput="editor.updateFlareProperty(${index}, 'outerAngle', this.value)"
                                   onchange="editor.updateFlareProperty(${index}, 'outerAngle', this.value)">
                        </div>
                        <div class="editor-field">
                            <label class="editor-label">Fade Distance</label>
                            <input type="number" class="editor-input" value="${flare.fadeDistance}" min="1" max="1000" step="1"
                                   oninput="editor.updateFlareProperty(${index}, 'fadeDistance', this.value)"
                                   onchange="editor.updateFlareProperty(${index}, 'fadeDistance', this.value)">
                        </div>
                        <div class="editor-field">
                            <label class="editor-label">Fade Span</label>
                            <input type="number" class="editor-input" value="${flare.fadeSpan}" min="1" max="100" step="1"
                                   oninput="editor.updateFlareProperty(${index}, 'fadeSpan', this.value)"
                                   onchange="editor.updateFlareProperty(${index}, 'fadeSpan', this.value)">
                        </div>
                    </div>
                    <div class="bias-preview-container" style="flex: 1;">
                        <h5 style="color: var(--text-secondary); margin-bottom: 10px; text-align: center;">Light Preview & Analysis</h5>
                        ${biasPreview.createPreview(flare, index)}
                    </div>
                </div>
            </div>
        `;
    },

    // Update bias preview when values change
    updateBiasPreview(index) {
        // Delegate to separate bias preview module
        if (typeof biasPreview !== 'undefined' && biasPreview.updatePreview) {
            biasPreview.updatePreview(index);
        }
    },

    // Create pattern section for blink flares
    createPatternSection(flare, index, patternChars) {
        return `
            <div class="pattern-section">
                <div class="pattern-header">
                    <h4 style="color: var(--accent-primary); margin: 0;">⚡ Blink Pattern Editor</h4>
                    <div class="pattern-actions">
                        <button class="control-button" onclick="editor.addPatternStep(${index})">+ Add</button>
                        <button class="control-button warning" onclick="editor.removePatternStep(${index})">- Remove</button>
                        <button class="control-button secondary" onclick="editor.resetPattern(${index})">🔄 Clear</button>
                    </div>
                </div>
                <div class="pattern-builder" id="pattern-builder-${index}">
                    ${patternChars}
                </div>
                <div class="pattern-input-row">
                    <input type="text" class="editor-input" id="pattern-input-${index}" value="${flare.blinkPattern}" 
                           placeholder="Pattern: X = ON, - = OFF" onchange="editor.updatePatternFromInput(${index}, this.value)">
                </div>
            </div>
        `;
    },

    // Show/hide sections
    showFlareSection() {
        document.getElementById('flareSection').style.display = 'block';
    },

    hideFlareSection() {
        document.getElementById('flareSection').style.display = 'none';
        this.updateFileName(null); // Clear file name when hiding section
    },

    // Enable/disable save button
    enableSaveButton() {
        document.getElementById('saveButton').disabled = false;
    },

    disableSaveButton() {
        document.getElementById('saveButton').disabled = true;
    },

    // Modal functions
    showAddFlareModal() {
        document.getElementById('addFlareModal').style.display = 'flex';
    },

    closeAddFlareModal() {
        document.getElementById('addFlareModal').style.display = 'none';
        // Reset form (only type and name fields now)
        document.getElementById('newFlareType').value = 'flare_blink';
        document.getElementById('newFlareName').value = '';
    },

    // Update global flare type selector
    switchGlobalFlareType(type) {
        const newFlareTypeSelect = document.getElementById('newFlareType');
        if (newFlareTypeSelect) {
            newFlareTypeSelect.value = type;
        }
    },

    // Create simple light visualization for bias-enabled flares
    createLightConeVisualization(flare, index) {
        return `
            <div class="simple-light-container" style="
                position: relative;
                width: 100px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto;
            ">
                <div class="flare-light active" id="light-${index}"></div>
            </div>
        `;
    },

    // Update current file name display
    updateFileName(fileName) {
        const fileNameElement = document.getElementById('currentFileName');
        if (fileNameElement && fileName) {
            fileNameElement.innerHTML = `📄 Current File: <strong style="color: var(--accent-primary);">${fileName}</strong>`;
        } else if (fileNameElement) {
            fileNameElement.innerHTML = '';
        }
    },

    // Custom alert function - center screen
    showAlert(message, type = 'warning', title = null) {
        const modal = document.getElementById('alertModal');
        const icon = document.getElementById('alertIcon');
        const titleEl = document.getElementById('alertTitle');
        const messageEl = document.getElementById('alertMessage');
        
        // Set icon and title based on type
        if (type === 'warning') {
            icon.textContent = '⚠️';
            icon.className = 'alert-icon warning';
            titleEl.textContent = title || 'Warning';
        } else if (type === 'error') {
            icon.textContent = '❌';
            icon.className = 'alert-icon warning';
            titleEl.textContent = title || 'Error';
        } else if (type === 'success') {
            icon.textContent = '✅';
            icon.className = 'alert-icon success';
            titleEl.textContent = title || 'Success';
        } else if (type === 'info') {
            icon.textContent = 'ℹ️';
            icon.className = 'alert-icon info';
            titleEl.textContent = title || 'Information';
        }
        
        messageEl.textContent = message;
        modal.className = 'alert-modal show';
    }
};

// Global function to close alert
function closeAlert() {
    const modal = document.getElementById('alertModal');
    modal.className = 'alert-modal';
}
