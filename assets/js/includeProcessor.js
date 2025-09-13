/**
 * ETS2 Flare Editor - Include Processor
 * Handles @include directives for .sui files
 */

const includeProcessor = {
    // Cache for loaded .sui files - changed to object for consistency
    cache: {},
    
    // Embedded .sui file contents (to avoid CORS issues)
    embeddedSuiFiles: {
        'vehicle_bulb_type_incandescent.sui': `	# Incandescent bulbs need some time before they come up to full intensity.
	# However we don't have such system in place yet, thus use almost instant state change.

	state_change_duration: 0.083`,
        
        'vehicle_bulb_type_led.sui': `	# LED bulbs come up to full intensity almost instantly.

	state_change_duration: 0.001`,
        
        'vehicle_spot_blinker_orange.sui': `	# Simulating averaged blinker - ECE R6

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (60, 38, 100)
	specular_color: (60, 38, 100)
	range: 10
	forward_distance: false
	inner_angle: 5
	outer_angle: 100
	fade_distance: 100
	fade_span: 50`,
        
        'vehicle_spot_brake_red.sui': `	# Simulating brake - ECE R7

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (60, 0, 100)
	specular_color: (60, 0, 100)
	range: 12
	forward_distance: false
	inner_angle: 5
	outer_angle: 90
	fade_distance: 100
	fade_span: 50`,
        
        'vehicle_spot_brake_3rd_red.sui': `	# Third brake light

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (60, 0, 100)
	specular_color: (60, 0, 100)
	range: 8
	forward_distance: false
	inner_angle: 3
	outer_angle: 45
	fade_distance: 80
	fade_span: 40`,
        
        'vehicle_spot_end_outline_front_white.sui': `	# Simulating front outline/position light - ECE R7

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (80, 60, 100)
	specular_color: (80, 60, 100)
	range: 8
	forward_distance: false
	inner_angle: 5
	outer_angle: 80
	fade_distance: 100
	fade_span: 50`,
        
        'vehicle_spot_end_outline_rear_red.sui': `	# Simulating rear outline/position light - ECE R7

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (60, 0, 100)
	specular_color: (60, 0, 100)
	range: 6
	forward_distance: false
	inner_angle: 5
	outer_angle: 80
	fade_distance: 100
	fade_span: 50`,
        
        'vehicle_spot_positional_front_white.sui': `	# Front positional light

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (80, 60, 100)
	specular_color: (80, 60, 100)
	range: 5
	forward_distance: false
	inner_angle: 10
	outer_angle: 45
	fade_distance: 50
	fade_span: 25`,
        
        'vehicle_spot_positional_rear_red.sui': `	# Rear positional light

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (60, 0, 100)
	specular_color: (60, 0, 100)
	range: 4
	forward_distance: false
	inner_angle: 10
	outer_angle: 45
	fade_distance: 50
	fade_span: 25`,
        
        'vehicle_spot_reverse_white.sui': `	# Reverse light

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (80, 60, 100)
	specular_color: (80, 60, 100)
	range: 15
	forward_distance: false
	inner_angle: 8
	outer_angle: 60
	fade_distance: 80
	fade_span: 40`,
        
        'vehicle_spot_side_marker_orange.sui': `	# Side marker light

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (60, 38, 100)
	specular_color: (60, 38, 100)
	range: 6
	forward_distance: false
	inner_angle: 15
	outer_angle: 90
	fade_distance: 50
	fade_span: 25`,
        
        'vehicle_spot_beacon_flashing_blue.sui': `	# Blue flashing beacon

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (80, 240, 100)
	specular_color: (80, 240, 100)
	range: 20
	forward_distance: false
	inner_angle: 5
	outer_angle: 45
	fade_distance: 150
	fade_span: 75`,
        
        'vehicle_spot_beacon_flashing_orange.sui': `	# Orange flashing beacon

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (80, 38, 100)
	specular_color: (80, 38, 100)
	range: 18
	forward_distance: false
	inner_angle: 5
	outer_angle: 45
	fade_distance: 140
	fade_span: 70`,
        
        'vehicle_spot_beacon_flashing_red.sui': `	# Red flashing beacon

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (80, 0, 100)
	specular_color: (80, 0, 100)
	range: 18
	forward_distance: false
	inner_angle: 5
	outer_angle: 45
	fade_distance: 140
	fade_span: 70`,
        
        'vehicle_spot_beacon_flashing_white.sui': `	# White flashing beacon

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (100, 0, 0)
	specular_color: (100, 0, 0)
	range: 22
	forward_distance: false
	inner_angle: 5
	outer_angle: 45
	fade_distance: 160
	fade_span: 80`,
        
        'vehicle_spot_beacon_rotating_blue.sui': `	# Blue rotating beacon

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (80, 240, 100)
	specular_color: (80, 240, 100)
	range: 25
	forward_distance: false
	inner_angle: 3
	outer_angle: 30
	fade_distance: 180
	fade_span: 90`,
        
        'vehicle_spot_beacon_rotating_orange.sui': `	# Orange rotating beacon

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (80, 38, 100)
	specular_color: (80, 38, 100)
	range: 22
	forward_distance: false
	inner_angle: 3
	outer_angle: 30
	fade_distance: 160
	fade_span: 80`,
        
        'vehicle_spot_beacon_rotating_red.sui': `	# Red rotating beacon

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (80, 0, 100)
	specular_color: (80, 0, 100)
	range: 22
	forward_distance: false
	inner_angle: 3
	outer_angle: 30
	fade_distance: 160
	fade_span: 80`,
        
        'vehicle_spot_beacon_rotating_white.sui': `	# White rotating beacon

	type: spot
	setup: candela_hue_saturation
	diffuse_color: (100, 0, 0)
	specular_color: (100, 0, 0)
	range: 28
	forward_distance: false
	inner_angle: 3
	outer_angle: 30
	fade_distance: 200
	fade_span: 100`
    },

    // Initialize the processor
    async init() {
        console.log('🔧 Initializing include processor...');
        this.loadEmbeddedSuiFiles();
    },

    // Load embedded .sui files into cache
    loadEmbeddedSuiFiles() {
        console.log('📁 Loading embedded .sui files...');
        
        for (const [filename, content] of Object.entries(this.embeddedSuiFiles)) {
            try {
                console.log(`� Processing: ${filename}`);
                
                const properties = this.parseSuiContent(content);
                this.cache[filename] = {
                    properties: Object.entries(properties).map(([key, value]) => ({ key, value })),
                    content: content,
                    rawProperties: properties
                };
                console.log(`✅ Loaded: ${filename} (${Object.keys(properties).length} properties)`);
                console.log(`📋 Properties:`, Object.keys(properties));
            } catch (error) {
                console.error(`💥 Error processing ${filename}:`, error);
            }
        }
        
        console.log(`📦 Cached ${Object.keys(this.cache).length} .sui files`);
        console.log(`🗂️ Cache contents:`, Object.keys(this.cache));
    },

    // Parse .sui file content into properties object
    parseSuiContent(content) {
        const properties = {};
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip comments and empty lines
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Parse property lines (key: value)
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex !== -1) {
                const key = trimmed.substring(0, colonIndex).trim();
                const value = trimmed.substring(colonIndex + 1).trim();
                
                // Clean up the value (remove trailing semicolons, etc.)
                const cleanValue = value.replace(/;$/, '');
                properties[key] = cleanValue;
            }
        }
        
        return properties;
    },

    // Process @include directives in .sii content
    processIncludes(siiContent) {
        console.log('🔄 Processing @include directives...');
        console.log('📄 Input content:', siiContent.substring(0, 200));
        
        let processedContent = siiContent;
        const includePattern = /@include\s+"([^"]+)"/g;
        const foundIncludes = [];
        const includeInfo = [];
        let match;
        
        // Find all @include directives
        while ((match = includePattern.exec(siiContent)) !== null) {
            const fullMatch = match[0];
            const filename = match[1];
            foundIncludes.push({ fullMatch, filename });
            console.log(`🔍 Found @include: ${filename}`);
        }
        
        console.log(`📋 Found ${foundIncludes.length} @include directive(s)`);
        console.log(`🗂️ Available in cache:`, Object.keys(this.cache));
        
        // Process each include
        for (const include of foundIncludes) {
            const { fullMatch, filename } = include;
            console.log(`🔧 Processing: ${filename}`);
            
            const suiProperties = this.getSuiProperties(filename);
            
            // Add to include info for UI
            const includeData = {
                path: filename,
                properties: suiProperties ? Object.entries(suiProperties).map(([key, value]) => ({ key, value })) : null
            };
            includeInfo.push(includeData);
            
            if (suiProperties) {
                // Convert properties back to .sii format
                const propertyLines = this.propertiesToSiiFormat(suiProperties);
                console.log(`📝 Property lines for ${filename}:`, propertyLines);
                
                // Replace @include with actual properties
                processedContent = processedContent.replace(fullMatch, propertyLines);
                console.log(`✅ Processed include: ${filename}`);
            } else {
                console.warn(`⚠️ Could not resolve include: ${filename}`);
                // Keep the @include unchanged for unfound files
                // (it will be preserved during generation)
            }
        }
        
        console.log('📄 Final processed content:', processedContent.substring(0, 300));
        
        // Return both processed content and include information
        return {
            content: processedContent,
            includes: includeInfo
        };
    },

    // Get properties from cached .sui file
    getSuiProperties(filename) {
        console.log(`🔍 Looking for: ${filename}`);
        
        // Try exact filename first
        if (this.cache[filename]) {
            console.log(`✅ Found exact match: ${filename}`);
            return this.cache[filename].rawProperties;
        }
        
        // Try to find similar filename (case insensitive)
        for (const [cachedFilename, data] of Object.entries(this.cache)) {
            if (cachedFilename.toLowerCase() === filename.toLowerCase()) {
                console.log(`✅ Found case-insensitive match: ${cachedFilename} for ${filename}`);
                return data.rawProperties;
            }
        }
        
        console.warn(`❌ .sui file not found: ${filename}`);
        console.log(`Available files:`, Object.keys(this.cache));
        return null;
    },

    // Convert properties object back to .sii format
    propertiesToSiiFormat(properties) {
        const lines = [];
        
        for (const [key, value] of Object.entries(properties)) {
            // Add proper indentation
            lines.push(`\t${key}: ${value}`);
        }
        
        return lines.join('\n');
    },

    // Get list of available .sui files for UI
    getAvailableSuiFiles() {
        return Array.from(this.suiCache.keys()).map(filename => ({
            filename,
            properties: Object.keys(this.suiCache.get(filename) || {})
        }));
    },

    // Preview what properties would be added by including a .sui file
    previewSuiFile(filename) {
        const properties = this.getSuiProperties(filename);
        if (!properties) return null;
        
        return {
            filename,
            properties,
            description: this.getSuiDescription(filename),
            formattedContent: this.propertiesToSiiFormat(properties)
        };
    },

    // Get description of what a .sui file does
    getSuiDescription(filename) {
        const descriptions = {
            'vehicle_bulb_type_incandescent.sui': 'Incandescent bulb timing (slow warm-up)',
            'vehicle_bulb_type_led.sui': 'LED bulb timing (instant on/off)',
            'vehicle_spot_brake_red.sui': 'Brake light configuration (red, high intensity)',
            'vehicle_spot_brake_3rd_red.sui': 'Third brake light (center high-mounted)',
            'vehicle_spot_end_outline_front_white.sui': 'Front outline/position light (white)',
            'vehicle_spot_end_outline_rear_red.sui': 'Rear outline/position light (red)',
            'vehicle_spot_positional_front_white.sui': 'Front position/parking light',
            'vehicle_spot_positional_rear_red.sui': 'Rear position/parking light',
            'vehicle_spot_reverse_white.sui': 'Reverse/backup light (white)',
            'vehicle_spot_side_marker_orange.sui': 'Side marker light (orange)',
            'vehicle_spot_blinker_orange.sui': 'Turn signal/blinker (orange)',
            'vehicle_spot_beacon_flashing_blue.sui': 'Emergency beacon (blue, flashing)',
            'vehicle_spot_beacon_flashing_orange.sui': 'Warning beacon (orange, flashing)',
            'vehicle_spot_beacon_flashing_red.sui': 'Emergency beacon (red, flashing)',
            'vehicle_spot_beacon_flashing_white.sui': 'Warning beacon (white, flashing)',
            'vehicle_spot_beacon_rotating_blue.sui': 'Emergency beacon (blue, rotating)',
            'vehicle_spot_beacon_rotating_orange.sui': 'Warning beacon (orange, rotating)',
            'vehicle_spot_beacon_rotating_red.sui': 'Emergency beacon (red, rotating)',
            'vehicle_spot_beacon_rotating_white.sui': 'Warning beacon (white, rotating)'
        };
        
        return descriptions[filename] || 'Custom .sui configuration';
    },

    // Validate if a .sii file has valid include syntax
    validateIncludeSyntax(siiContent) {
        const issues = [];
        const includePattern = /@include\s+"([^"]+)"/g;
        let match;
        
        while ((match = includePattern.exec(siiContent)) !== null) {
            const filename = match[1];
            
            if (!this.getSuiProperties(filename)) {
                issues.push({
                    type: 'missing_file',
                    filename,
                    message: `Include file not found: ${filename}`,
                    suggestion: this.suggestSimilarFile(filename)
                });
            }
        }
        
        return issues;
    },

    // Suggest similar .sui files if exact match not found
    suggestSimilarFile(filename) {
        const lowerFilename = filename.toLowerCase();
        
        for (const availableFile of this.availableSuiFiles) {
            const lowerAvailable = availableFile.toLowerCase();
            
            // Check for partial matches
            if (lowerAvailable.includes(lowerFilename.replace('.sui', '')) ||
                lowerFilename.includes(lowerAvailable.replace('.sui', ''))) {
                return availableFile;
            }
        }
        
        return null;
    }
};

// Export for global access
window.includeProcessor = includeProcessor;
