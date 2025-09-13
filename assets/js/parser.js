/**
 * ETS2 Flare Editor - File Parser
 * Handles parsing of .sii files
 */

const parser = {
    // Parse .sii content
    parseSiiContent(content) {
        state.clearFlares();
        state.setFileContent(content, currentFileName);
        
        try {
            console.log('=== PARSING DEBUG START ===');
            console.log('Content length:', content.length);
            console.log('Content preview:', content.substring(0, 500));
            
            // Process @include directives first
            let processedContent = content;
            let includeInfo = null;
            
            if (typeof includeProcessor !== 'undefined') {
                console.log('🔄 Processing @include directives...');
                const result = includeProcessor.processIncludes(content);
                processedContent = result.content;
                includeInfo = result.includes;
                console.log('✅ Include processing complete:', includeInfo?.length || 0, 'includes');
                
                // Store include information in state for UI display
                state.setIncludeInfo(includeInfo);
            } else {
                console.warn('⚠️ Include processor not available');
            }
            
            // Fixed regex patterns for format: flare_blink : name
            const patterns = [
                // Pattern 1: flare_type : name format (your file format)
                /(flare_(?:blink|vehicle))\s*:\s*([\w.]+)\s*\{([\s\S]*?)\}/g,
                // Pattern 2: name : flare_type format (standard format)
                /([\w.]+)\s*:\s*(flare_(?:blink|vehicle))\s*\{([\s\S]*?)\}/g,
                // Pattern 3: With quotes
                /"([\w.]+)"\s*:\s*(flare_(?:blink|vehicle))\s*\{([\s\S]*?)\}/g
            ];
            
            let foundAny = false;
            
            for (let i = 0; i < patterns.length; i++) {
                console.log(`Trying pattern ${i + 1}...`);
                const regex = patterns[i];
                let match;
                let flareCount = 0;
                
                while ((match = regex.exec(processedContent)) !== null && flareCount < appConfig.maxFlareLimit) {
                    foundAny = true;
                    flareCount++;
                    
                    let flareName, flareType;
                    
                    if (i === 0) {
                        // Pattern 1: flare_type : name
                        flareType = match[1].trim();
                        flareName = match[2].trim();
                    } else {
                        // Pattern 2 & 3: name : flare_type
                        flareName = match[1].trim();
                        flareType = match[2].trim();
                    }
                    
                    const flareBlock = match[3];
                    
                    console.log(`Found with pattern ${i + 1}:`, flareName, flareType);
                    console.log('Block content preview:', flareBlock.substring(0, 200));
                    
                    const flare = this.createFlareFromBlock(flareName, flareType, flareBlock, content);
                    if (flare) {
                        state.addFlare(flare);
                    }
                }
                
                if (foundAny) {
                    console.log(`Pattern ${i + 1} found ${state.getFlareCount()} flares, stopping search`);
                    break;
                }
            }
            
            if (!foundAny) {
                console.log('=== NO MATCHES FOUND ===');
                this.debugNoMatches(content);
            }
            
            console.log('=== PARSING DEBUG END ===');
            console.log('Final flareData count:', state.getFlareCount());
            
            return state.hasFlares();
            
        } catch (error) {
            console.error('Error parsing SII content:', error);
            throw new Error('Failed to parse .sii file: ' + error.message);
        }
    },

    // Create flare object from parsed block
    createFlareFromBlock(flareName, flareType, flareBlock, content) {
        const flare = {
            name: flareName,
            type: flareType,
            lightType: this.extractProperty(flareBlock, 'light_type') || 'beacon',
            model: this.extractProperty(flareBlock, 'model').replace(/"/g, '') || '',
            modelLightSource: this.extractProperty(flareBlock, 'model_light_source').replace(/"/g, '') || '',
            defaultScale: this.extractProperty(flareBlock, 'default_scale') || '',
            scaleFactor: this.extractProperty(flareBlock, 'scale_factor') || '',
            dirType: this.extractProperty(flareBlock, 'dir_type') || 'wide',
            hasBias: false
        };
        
        // Check for bias settings - look for setup property or bias reference
        const hasBiasReference = content.includes(`bias: ${flareName}.bias`);
        const hasBiasConfig = this.hasBiasConfiguration(content, flareName);
        const hasInlineBias = this.hasInlineBiasProperties(flareBlock);
        
        if (hasBiasReference || hasBiasConfig || hasInlineBias) {
            this.addBiasProperties(flare, content, flareName, flareBlock);
        }
        
        // Add type-specific properties
        if (flareType === 'flare_blink') {
            this.addBlinkProperties(flare, flareBlock);
        } else if (flareType === 'flare_vehicle') {
            this.addVehicleProperties(flare, flareBlock);
        }
        
        // Extract additional properties
        this.addAdditionalProperties(flare, flareBlock);
        
        console.log('Created flare object:', flare);
        return flare;
    },

    // Check if flare block has inline bias properties
    hasInlineBiasProperties(flareBlock) {
        // Check for key bias properties directly in the flare block
        const biasIndicators = ['setup:', 'diffuse_color:', 'specular_color:', 'inner_angle:', 'outer_angle:'];
        return biasIndicators.some(indicator => flareBlock.includes(indicator));
    },

    // Check if flare has bias configuration by looking for setup or other bias indicators
    hasBiasConfiguration(content, flareName) {
        // Look for bias block with setup or diffuse_color property
        const biasRegex = new RegExp(`${flareName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.bias\\s*{([^}]+)}`, 'gs');
        const biasMatch = biasRegex.exec(content);
        
        if (biasMatch) {
            const biasBlock = biasMatch[1];
            const hasSetup = biasBlock.includes('setup');
            const hasDiffuseColor = biasBlock.includes('diffuse_color');
            return hasSetup || hasDiffuseColor;
        }
        
        return false;
    },

    // Add bias properties to flare
    addBiasProperties(flare, content, flareName, flareBlock = null) {
        flare.hasBias = true;
        
        // Try to extract from inline properties first (if flareBlock provided)
        if (flareBlock) {
            // For biasType, we need 'type' property, not 'dir_type'
            const typeMatch = flareBlock.match(/(?:^|\n)\s*type\s*:\s*([^\n\r]+)/i);
            flare.biasType = typeMatch ? typeMatch[1].trim() : 'spot';
            
            flare.biasSetup = this.extractProperty(flareBlock, 'setup') || 'candela_hue_saturation';
            flare.diffuseColor = this.extractProperty(flareBlock, 'diffuse_color') || '(400, 38, 100)';
            flare.specularColor = this.extractProperty(flareBlock, 'specular_color') || '(400, 38, 100)';
            flare.range = parseFloat(this.extractProperty(flareBlock, 'range')) || 30;
            flare.innerAngle = parseFloat(this.extractProperty(flareBlock, 'inner_angle')) || 5;
            flare.outerAngle = parseFloat(this.extractProperty(flareBlock, 'outer_angle')) || 90;
            flare.fadeDistance = parseFloat(this.extractProperty(flareBlock, 'fade_distance')) || 140;
            flare.fadeSpan = parseFloat(this.extractProperty(flareBlock, 'fade_span')) || 30;
        }
        
        // If no inline properties found, try external bias block
        if (!flareBlock || !flare.biasSetup || flare.biasSetup === 'candela_hue_saturation') {
            const externalBiasType = this.extractBiasProperty(content, flareName, 'type');
            const externalBiasSetup = this.extractBiasProperty(content, flareName, 'setup');
            
            if (externalBiasType) flare.biasType = externalBiasType;
            if (externalBiasSetup) flare.biasSetup = externalBiasSetup;
            if (!flare.diffuseColor || flare.diffuseColor === '(400, 38, 100)') {
                flare.diffuseColor = this.extractBiasProperty(content, flareName, 'diffuse_color') || '(400, 38, 100)';
            }
            if (!flare.specularColor || flare.specularColor === '(400, 38, 100)') {
                flare.specularColor = this.extractBiasProperty(content, flareName, 'specular_color') || '(400, 38, 100)';
            }
            
            const externalRange = parseFloat(this.extractBiasProperty(content, flareName, 'range'));
            if (externalRange && externalRange !== 30) flare.range = externalRange;
            
            const externalInnerAngle = parseFloat(this.extractBiasProperty(content, flareName, 'inner_angle'));
            if (externalInnerAngle && externalInnerAngle !== 5) flare.innerAngle = externalInnerAngle;
            
            const externalOuterAngle = parseFloat(this.extractBiasProperty(content, flareName, 'outer_angle'));
            if (externalOuterAngle && externalOuterAngle !== 90) flare.outerAngle = externalOuterAngle;
            
            const externalFadeDistance = parseFloat(this.extractBiasProperty(content, flareName, 'fade_distance'));
            if (externalFadeDistance && externalFadeDistance !== 140) flare.fadeDistance = externalFadeDistance;
            
            const externalFadeSpan = parseFloat(this.extractBiasProperty(content, flareName, 'fade_span'));
            if (externalFadeSpan && externalFadeSpan !== 30) flare.fadeSpan = externalFadeSpan;
        }
    },

    // Add blink-specific properties
    addBlinkProperties(flare, flareBlock) {
        const blinkPattern = this.extractProperty(flareBlock, 'blink_pattern');
        const blinkStepLength = parseFloat(this.extractProperty(flareBlock, 'blink_step_length')) || 0.1;
        const stateChangeDuration = parseFloat(this.extractProperty(flareBlock, 'state_change_duration')) || 0.001;
        
        // Set default values untuk flare tanpa blink pattern
        if (blinkPattern) {
            flare.blinkPattern = blinkPattern.replace(/['"]/g, '');
            flare.blinkStepLength = blinkStepLength;
            flare.stateChangeDuration = stateChangeDuration;
            flare.isStatic = false;
        } else {
            // Default pattern untuk flare tanpa blink pattern (always on)
            flare.blinkPattern = '1';
            flare.blinkStepLength = blinkStepLength;
            flare.stateChangeDuration = stateChangeDuration;
            flare.isStatic = true; // Mark as static since no pattern
        }
    },

    // Add vehicle-specific properties
    addVehicleProperties(flare, flareBlock) {
        const intensity = parseFloat(this.extractProperty(flareBlock, 'intensity')) || 1.0;
        const color = this.extractProperty(flareBlock, 'color') || '(1, 1, 1)';
        const stateChangeDuration = parseFloat(this.extractProperty(flareBlock, 'state_change_duration')) || 0.001;
        
        flare.intensity = intensity;
        flare.color = color;
        flare.stateChangeDuration = stateChangeDuration;
        flare.isStatic = true;
    },

    // Add additional properties
    addAdditionalProperties(flare, flareBlock) {
        flare.setup = this.extractProperty(flareBlock, 'setup') || '';
        flare.diffuseColor = this.extractProperty(flareBlock, 'diffuse_color') || '';
        flare.specularColor = this.extractProperty(flareBlock, 'specular_color') || '';
        flare.range = parseFloat(this.extractProperty(flareBlock, 'range')) || 0;
        flare.fadeSpan = parseInt(this.extractProperty(flareBlock, 'fade_span')) || 30;
    },

    // Extract bias property from content
    extractBiasProperty(content, flareName, property) {
        // Try both patterns: bias: name.bias {...} and name.bias {...}
        const patterns = [
            new RegExp(`bias\\s*:\\s*${flareName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.bias\\s*{([^}]+)}`, 'gs'),
            new RegExp(`${flareName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.bias\\s*{([^}]+)}`, 'gs')
        ];
        
        for (const biasRegex of patterns) {
            const biasMatch = biasRegex.exec(content);
            if (biasMatch) {
                const biasBlock = biasMatch[1];
                const propRegex = new RegExp(property + '\\s*:\\s*([^\\n\\r]+)', 'i');
                const propMatch = biasBlock.match(propRegex);
                
                if (propMatch) {
                    return propMatch[1].trim();
                }
            }
        }
        
        return '';
    },

    // Extract property from text block
    extractProperty(block, property) {
        const regex = new RegExp(property + '\\s*:\\s*([^\\n\\r]+)', 'i');
        const match = block.match(regex);
        return match ? match[1].trim() : '';
    },

    // Debug function for no matches
    debugNoMatches(content) {
        console.log('Checking for flare keywords...');
        console.log('Contains "flare_blink":', content.includes('flare_blink'));
        console.log('Contains "flare_vehicle":', content.includes('flare_vehicle'));
        
        // Show sample lines that contain flare
        const lines = content.split('\n');
        const flareLines = lines.filter(line => 
            line.includes('flare_blink') || line.includes('flare_vehicle')
        );
        console.log('Lines with flare keywords:', flareLines);
    }
};
