/**
 * ETS2 Flare Editor - File Manager
 * Handles file loading, saving, and content generation
 */

const fileManager = {
    // Load .sii file
    loadSiiFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                console.log('File content loaded, parsing...');
                
                // Store original content and filename
                state.setFileContent(content, file.name);
                
                // Parse content
                const success = parser.parseSiiContent(content);
                
                if (success) {
                    ui.displayFlares();
                    ui.showFlareSection();
                    ui.enableSaveButton();
                    ui.updateFileName(file.name); // Update file name display
                    console.log('Loaded flares:', state.getFlareData());
                } else {
                    ui.showAlert('No valid flare data found in the file. Make sure it contains flare_blink or flare_vehicle definitions.', 'warning');
                }
            } catch (error) {
                console.error('Error parsing file:', error);
                ui.showAlert('Error reading file: ' + error.message + '\n\nPlease check that this is a valid .sii file with flare definitions.', 'error');
            }
        };
        
        reader.onerror = () => {
            ui.showAlert('Error reading file. Please try again.', 'error');
        };
        
        reader.readAsText(file);
    },

    // Save file using modern File System Access API or fallback
    async saveFile() {
        if (!state.hasFlares()) {
            ui.showAlert('Tidak ada data flare untuk disimpan! Silakan load file .sii terlebih dahulu.', 'warning');
            return;
        }
        
        const updatedContent = this.generateUpdatedContent();
        const filename = state.getFileName();
        
        try {
            // Try using File System Access API (modern browsers)
            if ('showSaveFilePicker' in window) {
                await this.saveWithFileSystemAPI(updatedContent, filename);
            } else {
                // Fallback to download
                this.saveWithDownload(updatedContent, filename);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error saving file:', error);
                ui.showAlert('Gagal menyimpan file: ' + error.message, 'error');
            }
        }
    },

    // Save using File System Access API
    async saveWithFileSystemAPI(content, filename) {
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
                description: 'SII files',
                accept: { 'text/plain': ['.sii'] }
            }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        
        ui.showAlert(`File "${fileHandle.name}" berhasil disimpan!`, 'success');
        state.setFileContent(content, fileHandle.name);
    },

    // Save using download fallback
    saveWithDownload(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        ui.showAlert(`File "${filename}" berhasil disimpan! (Browser akan download ke folder default)`, 'success');
        state.setFileContent(content, filename);
    },

    // Generate updated .sii content
    generateUpdatedContent() {
        console.log('🗃️ FileManager: generateUpdatedContent called');
        
        // Use the main generator instead of local generation
        const generatedContent = generator.generateSiiContent();
        console.log('🗃️ FileManager: Using generator.generateSiiContent()');
        console.log('🗃️ FileManager: Generated content:', generatedContent);
        
        return generatedContent;
    },

    // Generate flare definitions
    generateFlareDefinitions() {
        let definitions = '\n';
        
        state.getFlareData().forEach(flare => {
            definitions += this.generateFlareDefinition(flare);
            // Bias properties now integrated directly into flare definition
        });
        
        return definitions;
    },

    // Generate individual flare definition
    generateFlareDefinition(flare) {
        let definition = `\n${flare.type} : ${flare.name}\n{\n`;
        
        // First: dir_type and light_type
        definition += `\tdir_type: ${flare.dirType}\n`;
        definition += `\tlight_type: ${flare.lightType}\n`;
        definition += `\n`; // Empty line
        
        // Second: Type-specific properties
        if (flare.type === 'flare_blink') {
            definition += `\tblink_pattern: "${flare.blinkPattern}"\n`;
            definition += `\tblink_step_length: ${flare.blinkStepLength}\n`;
            definition += `\n`; // Empty line
        }
        // flare_vehicle tidak memiliki intensity dan color di export
        // Hanya memiliki state_change_duration yang akan ditambahkan di akhir
        
        // Third: Bias properties (integrated directly if enabled)
        if (flare.hasBias) {
            definition += `\ttype: ${flare.biasType || 'spot'}\n`;
            definition += `\tsetup: ${flare.biasSetup || 'candela_hue_saturation'}\n`;
            definition += `\tdiffuse_color: ${flare.diffuseColor || '(100, 38, 100)'}\n`;
            definition += `\tspecular_color: ${flare.specularColor || '(100, 38, 100)'}\n`;
            definition += `\trange: ${flare.range || 0}\n`;
            definition += `\tforward_distance: false\n`;
            definition += `\tinner_angle: ${flare.innerAngle || 0}\n`;
            definition += `\touter_angle: ${flare.outerAngle || 0}\n`;
            definition += `\tfade_distance: ${flare.fadeDistance || 0}\n`;
            definition += `\tfade_span: ${flare.fadeSpan || 0}\n`;
            definition += `\n`; // Empty line
        }
        
        // Fourth: Model (if not empty)
        if (flare.model && flare.model.trim() !== '') {
            definition += `\tmodel: "${flare.model}"\n`;
            
            // Add default_scale and scale_factor if they have values
            if (flare.defaultScale && flare.defaultScale.toString().trim() !== '') {
                definition += `\tdefault_scale: ${flare.defaultScale}\n`;
            }
            if (flare.scaleFactor && flare.scaleFactor.toString().trim() !== '') {
                definition += `\tscale_factor: ${flare.scaleFactor}\n`;
            }
            
            definition += `\n`; // Empty line
        }
        
        // Fifth: Model light source (if not empty)
        if (flare.modelLightSource && flare.modelLightSource.trim() !== '') {
            definition += `\tmodel_light_source: "${flare.modelLightSource}"\n`;
            definition += `\n`; // Empty line
        }
        
        // Sixth: State change duration (for both types)
        if (flare.stateChangeDuration !== undefined) {
            definition += `\tstate_change_duration: ${flare.stateChangeDuration}\n`;
        }
        
        definition += `}\n`;
        return definition;
    },

    // Generate bias definition
    generateBiasDefinition(flare) {
        let definition = `\nbias : ${flare.name}.bias\n{\n`;
        definition += `\ttype: ${flare.biasType}\n`;
        definition += `\tsetup: ${flare.biasSetup}\n`;
        definition += `\tdiffuse_color: ${flare.diffuseColor}\n`;
        definition += `\tspecular_color: ${flare.specularColor}\n`;
        
        if (flare.range !== undefined) definition += `\trange: ${flare.range}\n`;
        definition += `\tforward_distance: false\n`;
        if (flare.innerAngle !== undefined) definition += `\tinner_angle: ${flare.innerAngle}\n`;
        if (flare.outerAngle !== undefined) definition += `\touter_angle: ${flare.outerAngle}\n`;
        if (flare.fadeDistance !== undefined) definition += `\tfade_distance: ${flare.fadeDistance}\n`;
        if (flare.fadeSpan !== undefined) definition += `\tfade_span: ${flare.fadeSpan}\n`;
        
        definition += `}\n`;
        return definition;
    },

    // Export to different format (future feature)
    exportToJSON() {
        const data = {
            version: appConfig.version,
            flares: state.getFlareData(),
            metadata: {
                created: new Date().toISOString(),
                filename: state.getFileName()
            }
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.getFileName().replace('.sii', '.json');
        a.click();
        URL.revokeObjectURL(url);
    },

    // Import from JSON (future feature)
    importFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.flares && Array.isArray(data.flares)) {
                    state.clearFlares();
                    data.flares.forEach(flare => state.addFlare(flare));
                    ui.displayFlares();
                    ui.showFlareSection();
                    ui.enableSaveButton();
                    ui.showAlert(`Imported ${data.flares.length} flares from JSON`, 'success');
                } else {
                    ui.showAlert('Invalid JSON format', 'error');
                }
            } catch (error) {
                ui.showAlert('Error reading JSON file: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    },

    // Initialize drag and drop functionality
    initDragAndDrop() {
        const dropZone = document.body; // Entire page as drop zone
        let dragCounter = 0;

        // Create drag overlay
        const dragOverlay = document.createElement('div');
        dragOverlay.id = 'drag-overlay';
        dragOverlay.innerHTML = `
            <div class="drag-content">
                <div class="drag-icon">📁</div>
                <h3>Drop your .sii file here</h3>
                <p>Release to load ETS2 flare file</p>
            </div>
        `;
        dragOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        const dragContent = dragOverlay.querySelector('.drag-content');
        dragContent.style.cssText = `
            text-align: center;
            padding: 40px;
            border: 3px dashed #4CAF50;
            border-radius: 15px;
            background: rgba(76, 175, 80, 0.1);
        `;
        
        const dragIcon = dragOverlay.querySelector('.drag-icon');
        dragIcon.style.cssText = `
            font-size: 4em;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(dragOverlay);

        // Prevent default drag behaviors on page
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Handle drag enter/over
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                if (eventName === 'dragenter') {
                    dragCounter++;
                }
                
                // Check if dragged item contains files
                if (e.dataTransfer.types.includes('Files')) {
                    dragOverlay.style.display = 'flex';
                    dragOverlay.style.animation = 'fadeIn 0.3s ease-in-out';
                }
            });
        });

        // Handle drag leave
        dropZone.addEventListener('dragleave', (e) => {
            dragCounter--;
            if (dragCounter <= 0) {
                dragCounter = 0;
                dragOverlay.style.display = 'none';
            }
        });

        // Handle file drop
        dropZone.addEventListener('drop', (e) => {
            dragCounter = 0;
            dragOverlay.style.display = 'none';
            
            const files = Array.from(e.dataTransfer.files);
            const siiFile = files.find(file => file.name.toLowerCase().endsWith('.sii'));
            
            if (siiFile) {
                ui.showAlert(`Loading file: ${siiFile.name}`, 'info');
                this.loadSiiFile(siiFile);
            } else if (files.length > 0) {
                ui.showAlert('Please drop a .sii file (ETS2 flare file)', 'warning');
            }
        });

        console.log('🎯 Drag & Drop initialized! You can now drag .sii files to the page');
    }
};
