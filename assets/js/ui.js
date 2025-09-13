/**
 * ETS2 Flare Editor - UI Management
 * Handles user interface creation and management
 */

const ui = {
    // Display all flares in the container
    displayFlares() {
        const container = document.getElementById('flareContainer');
        container.innerHTML = '';
        
        // Add include information if available
        const includeInfo = state.getIncludeInfo();
        console.log('🎨 UI: Displaying flares, include info:', includeInfo);
        
        if (includeInfo && includeInfo.length > 0) {
            console.log('🎨 UI: Creating include section...');
            const includeSection = document.createElement('div');
            includeSection.innerHTML = this.createIncludeInfo(includeInfo);
            container.appendChild(includeSection);
            console.log('🎨 UI: Include section added to container');
        }
        
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
        // Handle flare tanpa blink pattern atau pattern sederhana
        const pattern = flare.blinkPattern || '1';
        const isSimplePattern = pattern === '1' || pattern.length === 1;
        
        let patternChars = '';
        if (!isSimplePattern) {
            patternChars = pattern.split('').map((char, i) => 
                `<div class="pattern-char ${char === 'X' ? 'active' : ''}" 
                     onclick="editor.togglePatternChar(${index}, ${i})" 
                     data-char="${char}">${char}</div>`
            ).join('');
        }
        
        return `
            <div class="flare-header">
                <input type="text" class="flare-name-edit" value="${flare.name}" 
                       onchange="editor.renameFlare(${index}, this.value)" onblur="this.style.display='none'; this.nextElementSibling.style.display='block';" style="display:none;">
                <div class="flare-name" onclick="this.style.display='none'; this.previousElementSibling.style.display='block'; this.previousElementSibling.focus();" 
                     style="cursor: pointer;">${flare.name} <small style="opacity: 0.7;">(${flare.type})</small></div>
                <div class="flare-actions">
                    <button class="control-button warning" onclick="editor.deleteFlare(${index})" style="padding: 8px 16px; font-size: 13px;">Delete</button>
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
                    <button class="control-button warning" onclick="editor.deleteFlare(${index})" style="padding: 8px 16px; font-size: 13px;">🗑️ Delete</button>
                </div>
            </div>
            <div class="flare-content">
                <div class="flare-preview">
                    <div class="flare-light" id="light-${index}"></div>
                    <div class="preview-controls">
                        <button class="control-button warning" id="vehicle-toggle-btn-${index}" onclick="animation.toggleVehicleFlare(${index})" style="padding: 6px 12px; font-size: 12px; min-width: 60px;">
                            � OFF
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

    // Create include information display
    createIncludeInfo(includeData) {
        if (!includeData || includeData.length === 0) {
            return '';
        }

        const includeList = includeData.map(include => {
            const isFound = include.properties && include.properties.length > 0;
            const statusText = isFound ? `${include.properties.length} properties` : 'not found';
            const statusColor = isFound ? 'var(--accent-primary)' : '#ff6b6b';
            const icon = isFound ? '✅' : '❌';
            
            return `
            <div class="include-item" style="
                display: flex; 
                align-items: center; 
                gap: 8px; 
                padding: 6px 10px; 
                background: var(--bg-secondary); 
                border-radius: 4px; 
                margin: 2px 0;
                border-left: 3px solid ${isFound ? 'var(--accent-primary)' : '#ff6b6b'};
            ">
                <span style="font-size: 12px;">${icon}</span>
                <span style="font-size: 12px; color: var(--text-primary); font-family: 'Courier New', monospace; flex: 1;">
                    ${include.path}
                </span>
                <span style="font-size: 11px; color: ${statusColor}; font-weight: bold;">
                    ${statusText}
                </span>
            </div>
        `;
        }).join('');

        const foundCount = includeData.filter(inc => inc.properties && inc.properties.length > 0).length;
        const totalCount = includeData.length;
        const headerColor = foundCount === totalCount ? 'var(--accent-primary)' : (foundCount > 0 ? '#ffa500' : '#ff6b6b');

        return `
            <div class="include-section" style="
                margin: 10px 0;
                padding: 12px;
                background: rgba(255, 200, 0, 0.1);
                border: 1px solid rgba(255, 200, 0, 0.3);
                border-radius: 6px;
            ">
                <h4 style="
                    color: ${headerColor};
                    margin: 0 0 8px 0;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                ">
                    📂 Included SUI Files (${foundCount}/${totalCount} found)
                </h4>
                <div class="include-list">
                    ${includeList}
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
                <div style="display: flex; align-items: center; gap: 30px; flex: 1;">
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
                <div style="display: flex; align-items: center; gap: 20px;">
                    <label class="editor-label" style="margin: 0; min-width: 65px; font-size: 13px;">Model:</label>
                    <input type="text" class="editor-input" style="flex: 2;" value="${flare.model || ''}" placeholder="Contoh: /model/flare.pmd | Kosongi jika tidak dipakai" onchange="editor.updateFlareProperty(${index}, 'model', this.value)" id="model-input-${index}">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <label class="editor-label" style="margin: 0; font-size: 11px; white-space: nowrap;">default_scale:</label>
                        <input type="number" class="editor-input" style="width: 70px; font-size: 12px;" value="${flare.defaultScale || ''}" placeholder="0.0" step="0.01" min="0"
                               onchange="editor.updateFlareProperty(${index}, 'defaultScale', this.value)" id="defaultscale-input-${index}">
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <label class="editor-label" style="margin: 0; font-size: 11px; white-space: nowrap;">scale_factor:</label>
                        <input type="number" class="editor-input" style="width: 70px; font-size: 12px;" value="${flare.scaleFactor || ''}" placeholder="0.0" step="0.01" min="0"
                               onchange="editor.updateFlareProperty(${index}, 'scaleFactor', this.value)" id="scalefactor-input-${index}">
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label class="editor-label" style="margin: 0; min-width: 65px; font-size: 13px;">Light Source:</label>
                    <input type="text" class="editor-input" style="flex: 1;" value="${flare.modelLightSource || ''}" placeholder="Contoh: /model/light.pmd | Kosongi jika tidak dipakai" onchange="editor.updateFlareProperty(${index}, 'modelLightSource', this.value)" id="modellight-input-${index}">
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
                    <!-- Left Side: Settings Grid -->
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
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <label class="editor-label">Diffuse Color</label>
                                <div style="
                                    width: 20px;
                                    height: 20px;
                                    background: ${this.getColorPreview(flare, 'diffuse')};
                                    border-radius: 3px;
                                    border: 1px solid #555;
                                " id="diffuse-preview-${index}"></div>
                            </div>
                            ${this.createAdvancedColorControls(flare, index, 'diffuse')}
                        </div>
                        <div class="editor-field">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <label class="editor-label">Specular Color</label>
                                <div style="
                                    width: 20px;
                                    height: 20px;
                                    background: ${this.getColorPreview(flare, 'specular')};
                                    border-radius: 3px;
                                    border: 1px solid #555;
                                " id="specular-preview-${index}"></div>
                            </div>
                            ${this.createAdvancedColorControls(flare, index, 'specular')}
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
                    
                    <!-- Right Side: Interactive Light Cone Visualization -->
                    <div class="bias-preview-container" style="flex: 0;">
                        <h5 style="color: var(--accent-primary); margin: 0 0 15px 0; font-size: 14px; text-align: center;">
                            🔦 Light Cone Projection
                        </h5>
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
        const pattern = flare.blinkPattern || '1';
        const isSimplePattern = pattern === '1' || pattern.length === 1;
        
        if (isSimplePattern) {
            return `
                <div class="pattern-section">
                    <div class="pattern-header">
                        <h4 style="color: var(--accent-primary); margin: 0;">⚡ Static Light (No Blink Pattern)</h4>
                        <div class="pattern-actions">
                            <button class="control-button" onclick="editor.enablePatternEditing(${index})">📝 Add Pattern</button>
                        </div>
                    </div>
                    <div class="pattern-info">
                        <p style="color: #999; margin: 8px 0; font-size: 13px;">
                            🔆 This flare has no blink pattern and will remain constantly on.
                        </p>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="pattern-section">
                <div class="pattern-header">
                    <h4 style="color: var(--accent-primary); margin: 0;">⚡ Blink Pattern Editor</h4>
                    <div class="pattern-actions">
                        <button class="control-button" onclick="editor.addPatternStep(${index})">ADD</button>
                        <button class="control-button warning" onclick="editor.removePatternStep(${index})">REMOVE</button>
                        <button class="control-button primary" onclick="editor.resetPattern(${index})">CLEAR</button>
                    </div>
                </div>
                <div class="pattern-builder" id="pattern-builder-${index}">
                    ${patternChars}
                </div>
                <div class="pattern-input-row">
                    <input type="text" class="editor-input" id="pattern-input-${index}" value="${pattern}" 
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
    },

    // Get color preview for header
    getColorPreview(flare, colorType) {
        const colorProperty = colorType === 'diffuse' ? 'diffuseColor' : 'specularColor';
        const colorValue = flare[colorProperty] || '(80, 55, 100)';
        const match = colorValue.match(/\((\d+),\s*(\d+),\s*(\d+)\)/);
        
        if (match) {
            const brightness = parseInt(match[1]);
            const hue = parseInt(match[2]);
            const saturation = parseInt(match[3]);
            const biasSetup = flare.biasSetup || 'candela_hue_saturation';
            
            // Gunakan algoritma yang sama dengan biasPreview untuk konsistensi
            const colorData = biasPreview.hslToRgb(hue, saturation, brightness, biasSetup);
            return `rgb(${colorData.r}, ${colorData.g}, ${colorData.b})`;
        }
        
        return 'hsl(55, 100%, 50%)';
    },

    createAdvancedColorControls(flare, index, colorType) {
        const colorProperty = colorType === 'diffuse' ? 'diffuseColor' : 'specularColor';
        const colorValue = flare[colorProperty] || '(80, 200, 100)';
        const biasSetup = flare.biasSetup || 'candela_hue_saturation';
        
        // Parse current color values
        const match = colorValue.match(/\((\d+),\s*(\d+),\s*(\d+)\)/);
        const brightness = match ? parseInt(match[1]) : 80;
        const hue = match ? parseInt(match[2]) : 200;
        const saturation = match ? parseInt(match[3]) : 100;
        
        // Determine brightness range and unit based on setup type
        let brightnessMax = 150;
        // Blender-style HSV: Both slider and input limited to 100
        let sliderMax = 100;      // Slider max (same as Blender)
        let inputMax = 100;       // Manual input max (pure Blender range)
        let brightnessUnit = 'cd';
        if (biasSetup === 'lumen_hue_saturation') {
            brightnessMax = 150;
            brightnessUnit = 'lm';
        } else if (biasSetup === 'lux_hue_saturation') {
            brightnessMax = 150;
            brightnessUnit = 'lx';
        }
        
        // Convert hue to color for preview
        const hueColor = `hsl(${hue}, 100%, 50%)`;
        const previewColor = `hsl(${hue}, ${saturation}%, 50%)`;
        
        return `
            <div class="compact-color-controls" style="
                display: flex;
                flex-direction: column;
                gap: 6px;
                padding: 0;
            ">
                <!-- Brightness Slider -->
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="
                        width: 12px;
                        height: 12px;
                        background: linear-gradient(to right, #000, #fff);
                        border-radius: 2px;
                        border: 1px solid #555;
                        flex-shrink: 0;
                    "></div>
                    <input type="range" 
                           class="compact-slider"
                           min="0" max="${sliderMax}" value="${Math.min(brightness, sliderMax)}" step="1"
                           style="
                               flex: 1;
                               height: 8px;
                               -webkit-appearance: none;
                               background: linear-gradient(to right, #000000, #FFFFFF);
                               border-radius: 4px;
                               outline: none;
                           "
                           oninput="ui.updateColorComponent(${index}, '${colorType}', 'brightness', this.value)"
                           id="${colorType}-brightness-${index}">
                    <input type="number" 
                           class="compact-input" 
                           min="0" max="${inputMax}" value="${brightness}" step="1"
                           style="
                               width: 45px;
                               height: 20px;
                               font-size: 10px;
                               padding: 2px 4px;
                               border: 1px solid #555;
                               border-radius: 2px;
                               background: rgba(0,0,0,0);
                               color: #000;
                               text-align: center;
                           "
                           onchange="ui.updateColorComponent(${index}, '${colorType}', 'brightness', this.value)"
                           id="${colorType}-brightness-input-${index}">
                </div>
                
                <!-- Hue Slider -->
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="
                        width: 12px;
                        height: 12px;
                        background: linear-gradient(to right, 
                            hsl(0, 100%, 50%), 
                            hsl(60, 100%, 50%), 
                            hsl(120, 100%, 50%), 
                            hsl(180, 100%, 50%), 
                            hsl(240, 100%, 50%), 
                            hsl(300, 100%, 50%), 
                            hsl(360, 100%, 50%)
                        );
                        border-radius: 2px;
                        border: 1px solid #555;
                        flex-shrink: 0;
                    "></div>
                    <input type="range" 
                           class="compact-slider"
                           min="0" max="360" value="${hue}" step="1"
                           style="
                               flex: 1;
                               height: 8px;
                               -webkit-appearance: none;
                               background: linear-gradient(to right, 
                                   hsl(0, 100%, 50%), 
                                   hsl(60, 100%, 50%), 
                                   hsl(120, 100%, 50%), 
                                   hsl(180, 100%, 50%), 
                                   hsl(240, 100%, 50%), 
                                   hsl(300, 100%, 50%), 
                                   hsl(360, 100%, 50%)
                               );
                               border-radius: 4px;
                               outline: none;
                           "
                           oninput="ui.updateColorComponent(${index}, '${colorType}', 'hue', this.value)"
                           id="${colorType}-hue-${index}">
                    <input type="number" 
                           class="compact-input" 
                           min="0" max="360" value="${hue}" step="1"
                           style="
                               width: 45px;
                               height: 20px;
                               font-size: 10px;
                               padding: 2px 4px;
                               border: 1px solid #555;
                               border-radius: 2px;
                               background: rgba(0,0,0,0);
                               color: #000;
                               text-align: center;
                           "
                           onchange="ui.updateColorComponent(${index}, '${colorType}', 'hue', this.value)"
                           id="${colorType}-hue-input-${index}">
                </div>
                
                <!-- Saturation Slider -->
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="
                        width: 12px;
                        height: 12px;
                        background: linear-gradient(to right, #fff, ${hueColor});
                        border-radius: 2px;
                        border: 1px solid #555;
                        flex-shrink: 0;
                    " id="${colorType}-sat-icon-${index}"></div>
                    <input type="range" 
                           class="compact-slider"
                           min="0" max="100" value="${saturation}" step="1"
                           style="
                               flex: 1;
                               height: 8px;
                               -webkit-appearance: none;
                               background: linear-gradient(to right, #fff, ${hueColor});
                               border-radius: 4px;
                               outline: none;
                           "
                           oninput="ui.updateColorComponent(${index}, '${colorType}', 'saturation', this.value)"
                           id="${colorType}-saturation-${index}">
                    <input type="number" 
                           class="compact-input" 
                           min="0" max="100" value="${saturation}" step="1"
                           style="
                               width: 45px;
                               height: 20px;
                               font-size: 10px;
                               padding: 2px 4px;
                               border: 1px solid #555;
                               border-radius: 2px;
                               background: rgba(0,0,0,0);
                               color: #000;
                               text-align: center;
                           "
                           onchange="ui.updateColorComponent(${index}, '${colorType}', 'saturation', this.value)"
                           id="${colorType}-saturation-input-${index}">
                </div>
            </div>
        `;
    },

    // Update individual color component from slider
    updateColorComponent(index, colorType, component, value) {
        const flareData = state.getFlareData();
        const flare = flareData[index];
        const colorProperty = colorType === 'diffuse' ? 'diffuseColor' : 'specularColor';
        const biasSetup = flare.biasSetup || 'candela_hue_saturation';
        
        // Parse current color
        const currentColor = flare[colorProperty] || '(80, 55, 100)';
        const match = currentColor.match(/\((\d+),\s*(\d+),\s*(\d+)\)/);
        let brightness = match ? parseInt(match[1]) : 80;
        let hue = match ? parseInt(match[2]) : 55;
        let saturation = match ? parseInt(match[3]) : 100;
        
        // Update the changed component
        if (component === 'brightness') {
            brightness = parseInt(value);
            
            // Sync slider and input (slider max 100, input max 500)
            const brightnessSlider = document.getElementById(`${colorType}-brightness-${index}`);
            const brightnessInput = document.getElementById(`${colorType}-brightness-input-${index}`);
            
            if (brightnessSlider && brightness <= 100) {
                brightnessSlider.value = brightness;
            } else if (brightnessSlider) {
                brightnessSlider.value = 100; // Cap slider at 100
            }
            
            if (brightnessInput) {
                brightnessInput.value = brightness;
            }
        } else if (component === 'hue') {
            hue = parseInt(value);
        } else if (component === 'saturation') {
            saturation = parseInt(value);
        }
        
        // Create new color string
        const newColor = `(${brightness}, ${hue}, ${saturation})`;
        
        // Update the flare data
        editor.updateFlareProperty(index, colorProperty, newColor);
        
        // Update UI displays
        this.updateColorDisplays(index, colorType, brightness, hue, saturation, biasSetup);
    },

    // Update color from text input
    updateColorFromText(index, colorType, textValue) {
        const colorProperty = colorType === 'diffuse' ? 'diffuseColor' : 'specularColor';
        const flareData = state.getFlareData();
        const flare = flareData[index];
        const biasSetup = flare.biasSetup || 'candela_hue_saturation';
        
        // Parse the text input
        const match = textValue.match(/\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const brightness = parseInt(match[1]);
            const hue = parseInt(match[2]);
            const saturation = parseInt(match[3]);
            
            // Update sliders
            const brightnessSlider = document.getElementById(`${colorType}-brightness-${index}`);
            const hueSlider = document.getElementById(`${colorType}-hue-${index}`);
            const saturationSlider = document.getElementById(`${colorType}-saturation-${index}`);
            
            if (brightnessSlider) brightnessSlider.value = brightness;
            if (hueSlider) hueSlider.value = hue;
            if (saturationSlider) saturationSlider.value = saturation;
            
            // Update input boxes
            const brightnessInput = document.getElementById(`${colorType}-brightness-input-${index}`);
            const hueInput = document.getElementById(`${colorType}-hue-input-${index}`);
            const saturationInput = document.getElementById(`${colorType}-saturation-input-${index}`);
            
            if (brightnessInput) brightnessInput.value = brightness;
            if (hueInput) hueInput.value = hue;
            if (saturationInput) saturationInput.value = saturation;
            
            // Update displays
            this.updateColorDisplays(index, colorType, brightness, hue, saturation, biasSetup);
        }
        
        // Update flare data
        editor.updateFlareProperty(index, colorProperty, textValue);
    },

    // Update all color displays (preview, values, gradients)
    updateColorDisplays(index, colorType, brightness, hue, saturation, biasSetup) {
        // Update input number boxes
        const brightnessInput = document.getElementById(`${colorType}-brightness-input-${index}`);
        const hueInput = document.getElementById(`${colorType}-hue-input-${index}`);
        const saturationInput = document.getElementById(`${colorType}-saturation-input-${index}`);
        
        if (brightnessInput) brightnessInput.value = brightness;
        if (hueInput) hueInput.value = hue;
        if (saturationInput) saturationInput.value = saturation;
        
        // Update slider values juga
        const brightnessSlider = document.getElementById(`${colorType}-brightness-${index}`);
        const hueSlider = document.getElementById(`${colorType}-hue-${index}`);
        const saturationSlider = document.getElementById(`${colorType}-saturation-${index}`);
        
        if (brightnessSlider) brightnessSlider.value = brightness;
        if (hueSlider) hueSlider.value = hue;
        if (saturationSlider) saturationSlider.value = saturation;
        
        // Update color preview di header dengan algoritma yang sama seperti bias preview
        const colorData = biasPreview.hslToRgb(hue, saturation, brightness, biasSetup);
        const previewColor = `rgb(${colorData.r}, ${colorData.g}, ${colorData.b})`;
        const headerPreview = document.getElementById(`${colorType}-preview-${index}`);
        if (headerPreview) {
            headerPreview.style.background = previewColor;
        }
        
        // Update saturation slider and icon gradient
        const hueColor = `hsl(${hue}, 100%, 50%)`;
        const saturationIcon = document.getElementById(`${colorType}-sat-icon-${index}`);
        
        if (saturationSlider) {
            const saturationGradient = `linear-gradient(to right, #fff, ${hueColor})`;
            saturationSlider.style.background = saturationGradient;
        }
        
        if (saturationIcon) {
            const saturationGradient = `linear-gradient(to right, #fff, ${hueColor})`;
            saturationIcon.style.background = saturationGradient;
        }
    }
};

// Global function to close alert
function closeAlert() {
    const modal = document.getElementById('alertModal');
    modal.className = 'alert-modal';
}
