/**
 * ETS2 Flare Editor - Editor Functions
 * Handles flare editing, manipulation, and pattern management
 */

const editor = {
    // Debounce timers for real-time updates
    debounceTimers: {},

    // Debounced update function for real-time preview
    updateFlarePropertyDebounced(index, property, value, delay = 300) {
        // Clear existing timer for this property
        const timerKey = `${index}-${property}`;
        if (this.debounceTimers[timerKey]) {
            clearTimeout(this.debounceTimers[timerKey]);
        }

        // Set new timer
        this.debounceTimers[timerKey] = setTimeout(() => {
            this.updateFlareProperty(index, property, value);
        }, delay);
    },

    // Update flare property
    updateFlareProperty(index, property, value) {
        state.updateFlare(index, property, value);
        
        if (property === 'blinkStepLength' || property === 'stateChangeDuration') {
            animation.updateFlareAnimation(index);
        } else if (property === 'intensity' && state.getFlareData()[index].isStatic) {
            // Update static flare opacity
            const light = document.getElementById(`light-${index}`);
            if (light) {
                light.style.opacity = value;
            }
        } else if (['range', 'innerAngle', 'outerAngle', 'fadeDistance', 'fadeSpan', 'diffuseColor', 'specularColor', 'biasType', 'biasSetup'].includes(property)) {
            // Update light cone visualization and bias preview for any bias-related properties
            this.updateLightConeVisualization(index);
            // Update bias preview in real-time
            ui.updateBiasPreview(index);
        }
    },

    // Toggle bias settings for flare
    toggleBias(index, enabled) {
        const flareData = state.getFlareData();
        flareData[index].hasBias = enabled;
        
        if (enabled) {
            // Add default bias settings
            const defaults = defaultFlareValues.bias;
            Object.keys(defaults).forEach(key => {
                flareData[index][key] = defaults[key];
            });
        } else {
            // Remove bias settings
            const biasProps = ['biasType', 'biasSetup', 'diffuseColor', 'specularColor', 
                             'range', 'innerAngle', 'outerAngle', 'fadeDistance', 'fadeSpan'];
            biasProps.forEach(prop => {
                delete flareData[index][prop];
            });
        }
        
        ui.displayFlares(); // Refresh display
    },

    // Toggle Model field
    toggleModel(index, enabled) {
        const flareData = state.getFlareData();
        flareData[index].hasModel = enabled;
        
        if (!enabled) {
            // Clear model value when disabled
            flareData[index].model = '';
        }
        
        // Enable/disable input field
        const inputField = document.getElementById(`model-input-${index}`);
        if (inputField) {
            inputField.disabled = !enabled;
            if (!enabled) {
                inputField.value = ''; // Clear value when disabled
            }
        }
    },

    // Toggle Model Light Source field
    toggleModelLightSource(index, enabled) {
        const flareData = state.getFlareData();
        flareData[index].hasModelLightSource = enabled;
        
        if (!enabled) {
            // Clear model light source value when disabled
            flareData[index].modelLightSource = '';
        }
        
        // Enable/disable input field
        const inputField = document.getElementById(`modellight-input-${index}`);
        if (inputField) {
            inputField.disabled = !enabled;
            if (!enabled) {
                inputField.value = ''; // Clear value when disabled
            }
        }
    },

    // Change flare type (flare_blink <-> flare_vehicle)
    changeFlareType(index, newType) {
        const flareData = state.getFlareData();
        const flare = flareData[index];
        
        if (flare.type === newType) return; // No change needed
        
        // Stop existing animation
        animation.stopFlareAnimation(index);
        
        // Update flare type
        flare.type = newType;
        
        if (newType === 'flare_blink') {
            // Convert to blinking flare
            const defaults = defaultFlareValues.flare_blink;
            flare.blinkPattern = defaults.blinkPattern;
            flare.blinkStepLength = defaults.blinkStepLength;
            flare.stateChangeDuration = defaults.stateChangeDuration;
            
            // Remove static properties
            delete flare.intensity;
            delete flare.color;
            delete flare.isStatic;
            
        } else if (newType === 'flare_vehicle') {
            // Convert to static vehicle flare
            const defaults = defaultFlareValues.flare_vehicle;
            flare.intensity = defaults.intensity;
            flare.color = defaults.color;
            flare.stateChangeDuration = defaults.stateChangeDuration;
            flare.isStatic = true;
            
            // Remove blink properties
            delete flare.blinkPattern;
            delete flare.blinkStepLength;
        }
        
        // Refresh display to show new type
        ui.displayFlares();
    },

    // Rename flare
    renameFlare(index, newName) {
        if (state.renameFlare(index, newName)) {
            ui.displayFlares(); // Refresh display
        }
    },

    // Delete flare
    deleteFlare(index) {
        const flareData = state.getFlareData();
        if (confirm(`Delete flare "${flareData[index].name}"?`)) {
            state.removeFlare(index);
            ui.displayFlares();
        }
    },

    // Create new flare
    createNewFlare() {
        // Prevent double execution
        if (this.isCreating) {
            console.log('Already creating flare, ignoring duplicate call');
            return;
        }
        this.isCreating = true;
        
        const flareType = document.getElementById('newFlareType').value;
        const flareName = document.getElementById('newFlareName').value.trim();
        
        if (!flareName) {
            ui.showAlert('Please enter a flare name', 'warning');
            this.isCreating = false; // Reset flag
            return;
        }
        
        // Check for duplicate names
        const currentFlareData = state.getFlareData();
        if (currentFlareData.some(f => f.name === flareName)) {
            ui.showAlert('Flare name already exists', 'error');
            this.isCreating = false; // Reset flag
            return;
        }
        
        const defaults = defaultFlareValues[flareType];
        let newFlare = {
            type: flareType,
            name: flareName,
            dirType: defaults.dirType,
            lightType: defaults.lightType, // Use default light type
            model: '', // Empty by default
            modelLightSource: '', // Empty by default
            defaultScale: '', // Empty by default - akan ditambahkan ke .sii hanya jika diisi
            scaleFactor: '', // Empty by default - akan ditambahkan ke .sii hanya jika diisi
            hasModel: defaults.hasModel, // Default false
            hasModelLightSource: defaults.hasModelLightSource, // Default false
            hasBias: false // Default to no bias
        };
        
        // Add type-specific properties
        if (flareType === 'flare_blink') {
            newFlare.blinkPattern = defaults.blinkPattern;
            newFlare.blinkStepLength = defaults.blinkStepLength;
            newFlare.stateChangeDuration = defaults.stateChangeDuration;
            newFlare.isStatic = false;
        } else if (flareType === 'flare_vehicle') {
            newFlare.intensity = defaults.intensity;
            newFlare.color = defaults.color;
            newFlare.isStatic = true;
        }
        
        // Bias is disabled by default (can be enabled later in editor)
        // User can edit all properties after flare creation
        
        state.addFlare(newFlare);
        ui.displayFlares();
        ui.closeAddFlareModal();
        ui.showFlareSection();
        ui.enableSaveButton();
        
        // Initialize new flare with OFF state
        setTimeout(() => {
            const newIndex = state.getFlareData().length - 1;
            const flare = state.getFlareData()[newIndex];
            
            if (flare.type === 'flare_vehicle') {
                const btn = document.getElementById(`vehicle-toggle-btn-${newIndex}`);
                const light = document.getElementById(`light-${newIndex}`);
                
                if (btn) {
                    btn.innerHTML = '🔴 OFF';
                    btn.className = 'control-button warning';
                    btn.title = 'Click to turn ON';
                }
                
                if (light) {
                    light.className = 'flare-light off';
                    light.style.opacity = '0.3';
                }
            } else if (flare.type === 'flare_blink') {
                const btn = document.getElementById(`toggle-btn-${newIndex}`);
                const light = document.getElementById(`light-${newIndex}`);
                
                if (btn) {
                    btn.innerHTML = '🔴 OFF';
                    btn.className = 'control-button warning';
                    btn.title = 'Click to turn ON';
                }
                
                if (light) {
                    light.className = 'flare-light off';
                    light.style.opacity = '0.3';
                }
            }
        }, 50);
        
        // Reset creation flag
        this.isCreating = false;
    },

    // Create empty .sii file
    createEmptySii() {
        const emptyContent = `SiiNunit
{
// Empty .sii file for ETS2 flares
// Add your flare definitions here

}`;
        
        state.clearFlares();
        state.setFileContent(emptyContent, 'new_flare.sii');
        
        ui.showFlareSection();
        ui.enableSaveButton();
        ui.displayFlares();
        
        ui.showAlert('Empty .sii file created! You can now add flares.', 'success');
    },

    // Pattern manipulation functions
    togglePatternChar(flareIndex, charIndex) {
        const flareData = state.getFlareData();
        if (flareData[flareIndex].type === 'flare_blink') {
            const flare = flareData[flareIndex];
            const pattern = flare.blinkPattern || '1';
            
            // Don't allow editing of simple patterns
            if (pattern === '1' || pattern.length === 1) {
                return;
            }
            
            const patternArray = pattern.split('');
            
            patternArray[charIndex] = patternArray[charIndex] === 'X' ? '-' : 'X';
            flare.blinkPattern = patternArray.join('');
            
            this.updatePatternDisplay(flareIndex);
            animation.updateFlareAnimation(flareIndex);
        }
    },

    updatePatternDisplay(flareIndex) {
        const flareData = state.getFlareData();
        if (flareData[flareIndex].type === 'flare_blink') {
            const flare = flareData[flareIndex];
            const pattern = flare.blinkPattern || '1';
            const builder = document.getElementById(`pattern-builder-${flareIndex}`);
            const input = document.getElementById(`pattern-input-${flareIndex}`);
            
            if (builder && pattern !== '1' && pattern.length > 1) {
                builder.innerHTML = pattern.split('').map((char, i) => 
                    `<div class="pattern-char ${char === 'X' ? 'active' : ''}" 
                         onclick="editor.togglePatternChar(${flareIndex}, ${i})" 
                         data-char="${char}">${char}</div>`
                ).join('');
            }
            
            if (input) {
                input.value = pattern;
            }
        }
    },

    addPatternStep(index) {
        const flareData = state.getFlareData();
        if (flareData[index].type === 'flare_blink') {
            const pattern = flareData[index].blinkPattern || '1';
            
            // If it's a simple pattern, convert to editable pattern first
            if (pattern === '1' || pattern.length === 1) {
                flareData[index].blinkPattern = 'X-';
                flareData[index].isStatic = false;
            } else {
                const currentLength = pattern.length;
                if (currentLength < appConfig.maxPatternLength) {
                    flareData[index].blinkPattern += '-';
                } else {
                    ui.showAlert(`Maximum pattern length is ${appConfig.maxPatternLength} characters`, 'warning');
                    return;
                }
            }
            
            this.updatePatternDisplay(index);
            animation.updateFlareAnimation(index);
            
            // Refresh UI if we converted from simple pattern
            if (pattern === '1' || pattern.length === 1) {
                ui.displayFlares();
            }
        }
    },

    removePatternStep(index) {
        const flareData = state.getFlareData();
        if (flareData[index].type === 'flare_blink') {
            const pattern = flareData[index].blinkPattern || '1';
            
            // Don't remove from simple patterns
            if (pattern === '1' || pattern.length === 1) {
                return;
            }
            
            const currentLength = pattern.length;
            if (currentLength > appConfig.minPatternLength) {
                flareData[index].blinkPattern = pattern.slice(0, -1);
                this.updatePatternDisplay(index);
                animation.updateFlareAnimation(index);
            } else {
                ui.showAlert(`Minimum pattern length is ${appConfig.minPatternLength} character`, 'warning');
            }
        }
    },

    resetPattern(index) {
        const flareData = state.getFlareData();
        if (flareData[index].type === 'flare_blink') {
            const pattern = flareData[index].blinkPattern || '1';
            
            // Don't reset simple patterns
            if (pattern === '1' || pattern.length === 1) {
                return;
            }
            
            // Replace all 'X' with '-' to clear the pattern
            flareData[index].blinkPattern = pattern.replace(/X/g, '-');
            this.updatePatternDisplay(index);
            animation.updateFlareAnimation(index);
        }
    },

    updatePatternFromInput(index, value) {
        const flareData = state.getFlareData();
        if (flareData[index].type === 'flare_blink') {
            // Handle empty or invalid input - set to simple pattern
            if (!value || value.trim() === '') {
                flareData[index].blinkPattern = '1';
                flareData[index].isStatic = true;
                ui.displayFlares();
                return;
            }
            
            const cleanPattern = value.replace(/[^X\-]/g, '');
            if (cleanPattern.length > 0 && cleanPattern.length <= appConfig.maxPatternLength) {
                flareData[index].blinkPattern = cleanPattern;
                flareData[index].isStatic = false;
                this.updatePatternDisplay(index);
                animation.updateFlareAnimation(index);
            } else if (cleanPattern.length > appConfig.maxPatternLength) {
                ui.showAlert(`Maximum pattern length is ${appConfig.maxPatternLength} characters`, 'warning');
                // Revert to previous value
                const input = document.getElementById(`pattern-input-${index}`);
                if (input) {
                    input.value = flareData[index].blinkPattern;
                }
            }
        }
    },

    // Validation functions
    // Enable pattern editing for static flares
    enablePatternEditing(index) {
        const flareData = state.getFlareData();
        if (flareData[index].type === 'flare_blink') {
            // Set default blink pattern
            flareData[index].blinkPattern = 'X-';
            flareData[index].isStatic = false;
            
            // Refresh the UI to show pattern editor
            ui.displayFlares();
            
            // Start animation
            animation.updateFlareAnimation(index);
        }
    },

    validateFlareName(name) {
        return name && name.trim().length > 0 && /^[a-zA-Z0-9._-]+$/.test(name.trim());
    },

    validatePattern(pattern) {
        return pattern && /^[X\-]+$/.test(pattern) && 
               pattern.length >= appConfig.minPatternLength && 
               pattern.length <= appConfig.maxPatternLength;
    },

    validateNumericRange(value, min, max) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    // Update light cone visualization when bias properties change
    updateLightConeVisualization(index) {
        const flareData = state.getFlareData();
        const flare = flareData[index];
        
        if (!flare.hasBias) return;
        
        const cone = document.getElementById(`cone-${index}`);
        const range = document.getElementById(`range-${index}`);
        
        if (cone && range) {
            const coneSize = Math.min(150, (flare.range || 30) * 3);
            const rangeSize = Math.min(180, (flare.range || 30) * 4);
            const innerAngle = flare.innerAngle || 5;
            const outerAngle = flare.outerAngle || 90;
            
            // Update cone size and angles
            cone.style.width = `${coneSize}px`;
            cone.style.height = `${coneSize}px`;
            cone.style.setProperty('--inner-angle', `${innerAngle * 2}deg`);
            cone.style.setProperty('--outer-angle', `${outerAngle * 2}deg`);
            
            // Update range indicator size
            range.style.width = `${rangeSize}px`;
            range.style.height = `${rangeSize}px`;
        }
    }
};
