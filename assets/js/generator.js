/**
 * ETS2 Flare Editor - SII Generator
 * Generates .sii file content from flare data
 */

const generator = {
    // Generate complete .sii file content
    generateSiiContent() {
        const flareData = state.getFlareData();
        const includeInfo = state.getIncludeInfo();
        
        console.log('🏗️ Generator: Starting generation...');
        console.log('🏗️ Generator: Flare data:', flareData);
        console.log('🏗️ Generator: Include info:', includeInfo);
        
        if (!flareData || flareData.length === 0) {
            return this.generateEmptyFile();
        }
        
        let content = 'SiiNunit\n{\n';
        
        // Add flare definitions
        flareData.forEach(flare => {
            content += this.generateFlareDefinition(flare, includeInfo);
            content += '\n';
        });
        
        content += '}\n';
        console.log('🏗️ Generator: Final content:', content);
        return content;
    },
    
    // Generate individual flare definition
    generateFlareDefinition(flare, includeInfo = null) {
        console.log('🏗️ Generator: Creating flare definition for:', flare.name);
        console.log('🏗️ Generator: Include info received:', includeInfo);
        
        let definition = `${flare.type} : ${flare.name}\n{\n`;
        
        // Add properties in a more structured way
        const properties = [];
        const includeDirectives = [];
        
        // Process @include directives
        if (includeInfo && includeInfo.length > 0) {
            console.log('🏗️ Generator: Processing includes...');
            for (const include of includeInfo) {
                console.log('🏗️ Generator: Processing include:', include.path, 'properties:', include.properties);
                if (!include.properties) {
                    // NOT FOUND - keep as @include directive with proper indentation
                    console.log('🏗️ Generator: Adding NOT FOUND include:', include.path);
                    includeDirectives.push(`@include "${include.path}"`);
                } else {
                    // FOUND - expand to properties
                    console.log('🏗️ Generator: Expanding FOUND include:', include.path, 'to properties');
                    include.properties.forEach(prop => {
                        properties.push(`${prop.key}: ${prop.value}`);
                    });
                }
            }
        }
        
        // Add common properties
        properties.push(`dir_type: ${flare.dirType}`);
        properties.push(`light_type: ${flare.lightType}`);
        
        // Add type-specific properties
        if (flare.type === 'flare_blink') {
            if (flare.blinkPattern && flare.blinkPattern !== '1' && flare.blinkPattern.length > 1) {
                properties.push(`blink_pattern: "${flare.blinkPattern}"`);
            }
            if (flare.blinkStepLength) {
                properties.push(`blink_step_length: ${flare.blinkStepLength}`);
            }
        } else if (flare.type === 'flare_vehicle') {
            if (flare.intensity) {
                properties.push(`intensity: ${flare.intensity}`);
            }
            if (flare.color) {
                properties.push(`color: ${flare.color}`);
            }
        }
        
        // Add model properties if set
        if (flare.model && flare.model.trim()) {
            properties.push(`model: "${flare.model}"`);
        }
        
        if (flare.modelLightSource && flare.modelLightSource.trim()) {
            properties.push(`model_light_source: "${flare.modelLightSource}"`);
        }
        
        if (flare.defaultScale && flare.defaultScale.toString().trim()) {
            properties.push(`default_scale: ${flare.defaultScale}`);
        }
        
        if (flare.scaleFactor && flare.scaleFactor.toString().trim()) {
            properties.push(`scale_factor: ${flare.scaleFactor}`);
        }
        
        // Add state change duration (if from found includes, it's already added above)
        if (flare.stateChangeDuration) {
            properties.push(`state_change_duration: ${flare.stateChangeDuration}`);
        }
        
        // Now build the definition with proper formatting
        // Start with basic properties (dir_type, light_type)
        definition += `\tdir_type: ${flare.dirType}\n`;
        definition += `\tlight_type: ${flare.lightType}\n`;
        
        // Add first @include (not found) if exists
        let addedFirstInclude = false;
        if (includeDirectives.length > 0) {
            definition += `\n${includeDirectives[0]}\n\n`;
            addedFirstInclude = true;
        }
        
        // Add other properties (model, scale, etc.)
        if (flare.model && flare.model.trim()) {
            definition += `\tmodel: "${flare.model}"\n`;
        }
        
        if (flare.defaultScale && flare.defaultScale.toString().trim()) {
            definition += `\tdefault_scale: ${flare.defaultScale}\n`;
        }
        
        if (flare.scaleFactor && flare.scaleFactor.toString().trim()) {
            definition += `\tscale_factor: ${flare.scaleFactor}\n`;
        }
        
        // Add type-specific properties 
        if (flare.type === 'flare_blink') {
            if (flare.blinkPattern && flare.blinkPattern !== '1' && flare.blinkPattern.length > 1) {
                definition += `\tblink_pattern: "${flare.blinkPattern}"\n`;
            }
            if (flare.blinkStepLength) {
                definition += `\tblink_step_length: ${flare.blinkStepLength}\n`;
            }
        } else if (flare.type === 'flare_vehicle') {
            if (flare.intensity) {
                definition += `\tintensity: ${flare.intensity}\n`;
            }
            if (flare.color) {
                definition += `\tcolor: ${flare.color}\n`;
            }
        }
        
        if (flare.modelLightSource && flare.modelLightSource.trim()) {
            definition += `\tmodel_light_source: "${flare.modelLightSource}"\n`;
        }
        
        // Add expanded properties from found includes
        if (includeInfo && includeInfo.length > 0) {
            for (const include of includeInfo) {
                if (include.properties) {
                    include.properties.forEach(prop => {
                        definition += `\t${prop.key}: ${prop.value}\n`;
                    });
                }
            }
        }
        
        // Add remaining @include directives (not found) at the end
        for (let i = 1; i < includeDirectives.length; i++) {
            definition += `\n${includeDirectives[i]}\n`;
        }
        
        definition += '}';
        return definition;
    },
    
    // Generate bias properties
    generateBiasProperties(flare) {
        let bias = '';
        
        if (flare.biasType) {
            bias += `\tbias: ${flare.biasType}\n`;
        }
        
        if (flare.biasSetup) {
            bias += `\tbias_setup: ${flare.biasSetup}\n`;
        }
        
        if (flare.diffuseColor) {
            bias += `\tdiffuse_color: ${flare.diffuseColor}\n`;
        }
        
        if (flare.specularColor) {
            bias += `\tspecular_color: ${flare.specularColor}\n`;
        }
        
        if (flare.range) {
            bias += `\trange: ${flare.range}\n`;
        }
        
        if (flare.innerAngle !== undefined) {
            bias += `\tinner_angle: ${flare.innerAngle}\n`;
        }
        
        if (flare.outerAngle !== undefined) {
            bias += `\touter_angle: ${flare.outerAngle}\n`;
        }
        
        if (flare.fadeDistance) {
            bias += `\tfade_distance: ${flare.fadeDistance}\n`;
        }
        
        if (flare.fadeSpan) {
            bias += `\tfade_span: ${flare.fadeSpan}\n`;
        }
        
        return bias;
    },
    
    // Generate empty .sii file
    generateEmptyFile() {
        return `SiiNunit
{
// Empty .sii file for ETS2 flares
// Add your flare definitions here

}`;
    }
};
