// biasPreview.js - Modern Bias Light Preview Module
// New modern design with side-by-side layout and fade gradients

const biasPreview = {
    // Parse ETS2 light color values (brightness, hue, saturation)
    parseDiffuseColor(diffuseColorStr, biasSetup = 'candela_hue_saturation') {
        const match = diffuseColorStr.match(/\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const brightness = parseInt(match[1]); // candela/lumen/lux
            const hue = parseInt(match[2]);         // 0-360 degrees
            const saturation = parseInt(match[3]);  // 0-100 percent
            
            // Convert HSL to RGB for CSS
            const hslColor = this.hslToRgb(hue, saturation, brightness, biasSetup);
            return hslColor;
        }
        return { r: 255, g: 200, b: 100 }; // Default warm light
    },

    // Convert ETS2 HSL system to RGB
    hslToRgb(hue, saturation, brightness, biasSetup) {
        // Normalize values
        const h = ((hue % 360) + 360) % 360; // 0-360
        const s = Math.max(0, Math.min(100, saturation)) / 100; // 0-1
        
        // Adjust brightness based on setup type
        let lightness;
        if (biasSetup === 'lux_hue_saturation') {
            lightness = Math.max(0.2, Math.min(0.9, brightness / 200)); // Lux tends to be higher values
        } else if (biasSetup === 'lumen_hue_saturation') {
            lightness = Math.max(0.3, Math.min(0.8, brightness / 150)); // Lumen moderate values
        } else { // candela_hue_saturation
            lightness = Math.max(0.4, Math.min(0.7, brightness / 100)); // Candela lower values
        }
        
        // Convert HSL to RGB
        const c = (1 - Math.abs(2 * lightness - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = lightness - c / 2;
        
        let r, g, b;
        if (h < 60) {
            r = c; g = x; b = 0;
        } else if (h < 120) {
            r = x; g = c; b = 0;
        } else if (h < 180) {
            r = 0; g = c; b = x;
        } else if (h < 240) {
            r = 0; g = x; b = c;
        } else if (h < 300) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }
        
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255),
            hue: h,
            saturation: s * 100,
            brightness: brightness
        };
    },

    // Main function to create modern bias preview
    createPreview(flare, index) {
        const innerAngle = flare.innerAngle || 5;
        const outerAngle = flare.outerAngle || 90;
        const range = flare.range || 30;
        const fadeDistance = flare.fadeDistance || 140;
        const fadeSpan = flare.fadeSpan || 30;
        const biasSetup = flare.biasSetup || 'candela_hue_saturation';
        
        const diffuseColor = this.parseDiffuseColor(flare.diffuseColor || "(80, 55, 100)", biasSetup);
        
        return `
            <div class="modern-bias-preview" id="bias-preview-${index}" style="
                display: flex;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid var(--border-color);
                gap: 24px;
                min-height: 280px;
            ">
                <!-- Left Side: 3D Light Cone Visualization -->
                <div class="cone-visualization" style="
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                ">
                    <h6 style="color: var(--text-secondary); margin: 0 0 15px 0; font-size: 13px; text-align: center;">
                        🔦 Light Cone Projection
                    </h6>
                    ${this.createModernConeVisualization(flare, index, diffuseColor)}
                </div>
                
                <!-- Right Side: Fade Analysis & Settings -->
                <div class="fade-analysis" style="
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                ">
                    <h6 style="color: var(--text-secondary); margin: 0 0 15px 0; font-size: 13px; text-align: center;">
                        📊 Fade & Performance Analysis
                    </h6>
                    ${this.createFadeVisualization(flare, index, diffuseColor)}
                    ${this.createPerformanceAnalysis(flare, index, diffuseColor)}
                </div>
            </div>
        `;
    },

    // Create modern cone visualization pointing right
    createModernConeVisualization(flare, index, diffuseColor) {
        const innerAngle = flare.innerAngle || 5;
        const outerAngle = flare.outerAngle || 90;
        const range = flare.range || 30;
        
        // Calculate cone dimensions (facing right)
        const svgWidth = 240;
        const svgHeight = 180;
        const startX = 20;
        const centerY = svgHeight / 2;
        const coneLength = Math.min(180, range * 4);
        
        // Calculate cone angles for right-facing cone
        const innerRadians = (innerAngle * Math.PI) / 180;
        const outerRadians = (outerAngle * Math.PI) / 180;
        
        // Cone points
        const innerTopY = centerY - Math.tan(innerRadians / 2) * coneLength;
        const innerBottomY = centerY + Math.tan(innerRadians / 2) * coneLength;
        const outerTopY = centerY - Math.tan(outerRadians / 2) * coneLength;
        const outerBottomY = centerY + Math.tan(outerRadians / 2) * coneLength;
        const endX = startX + coneLength;
        
        // Color calculations
        const lightColor = `rgb(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b})`;
        const lightColorAlpha = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, 0.6)`;
        const lightColorFade = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, 0.1)`;
        
        return `
            <div style="
                background: radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%);
                border-radius: 8px;
                padding: 10px;
                border: 1px solid #333;
            ">
                <svg width="${svgWidth}" height="${svgHeight}" style="display: block;">
                    <defs>
                        <!-- Gradient for outer cone -->
                        <linearGradient id="outerConeGrad-${index}" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:${lightColorAlpha};stop-opacity:0.7" />
                            <stop offset="100%" style="stop-color:${lightColorFade};stop-opacity:0.1" />
                        </linearGradient>
                        
                        <!-- Gradient for inner cone -->
                        <linearGradient id="innerConeGrad-${index}" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:${lightColor};stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:${lightColorAlpha};stop-opacity:0.3" />
                        </linearGradient>
                        
                        <!-- Glow filter -->
                        <filter id="glow-${index}">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    <!-- Outer cone -->
                    <polygon points="${startX},${centerY} ${endX},${outerTopY} ${endX},${outerBottomY}"
                             fill="url(#outerConeGrad-${index})" 
                             stroke="${lightColorFade}" 
                             stroke-width="1" 
                             opacity="0.7"/>
                    
                    <!-- Inner cone -->
                    <polygon points="${startX},${centerY} ${endX},${innerTopY} ${endX},${innerBottomY}"
                             fill="url(#innerConeGrad-${index})" 
                             stroke="${lightColor}" 
                             stroke-width="1.5"
                             filter="url(#glow-${index})"/>
                    
                    <!-- Light source point -->
                    <circle cx="${startX}" cy="${centerY}" r="6" 
                            fill="${lightColor}" 
                            stroke="${lightColor}" 
                            stroke-width="2"
                            filter="url(#glow-${index})">
                        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    
                    <!-- Range indicator -->
                    <line x1="${startX}" y1="${centerY + 25}" x2="${endX}" y2="${centerY + 25}"
                          stroke="${lightColorAlpha}" stroke-width="2" stroke-dasharray="3,3"/>
                    <text x="${startX + coneLength/2}" y="${centerY + 40}" 
                          fill="var(--text-secondary)" font-size="11px" text-anchor="middle">
                        Range: ${range}m
                    </text>
                    
                    <!-- Angle indicators -->
                    <text x="${endX + 5}" y="${innerTopY}" fill="${lightColor}" font-size="10px">
                        Inner: ${innerAngle}°
                    </text>
                    <text x="${endX + 5}" y="${outerTopY - 5}" fill="${lightColorAlpha}" font-size="10px">
                        Outer: ${outerAngle}°
                    </text>
                </svg>
            </div>
        `;
    },

    // Create fade distance visualization with gradients
    createFadeVisualization(flare, index, diffuseColor) {
        const fadeDistance = flare.fadeDistance || 140;
        const fadeSpan = flare.fadeSpan || 30;
        const range = flare.range || 30;
        
        // Calculate fade percentages
        const fadeStartPercent = Math.max(0, ((fadeDistance - fadeSpan) / fadeDistance) * 100);
        const fadeEndPercent = 100;
        
        const lightColor = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, 0.8)`;
        const lightColorMid = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, 0.4)`;
        const lightColorFade = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, 0.1)`;
        
        return `
            <div class="fade-visualization" style="
                background: var(--bg-primary);
                border-radius: 8px;
                padding: 15px;
                border: 1px solid var(--border-color);
                margin-bottom: 15px;
            ">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">
                    Distance Fade Profile:
                </div>
                
                <!-- Fade gradient bar -->
                <div style="
                    height: 40px;
                    background: linear-gradient(to right, 
                        ${lightColor} 0%, 
                        ${lightColor} ${fadeStartPercent}%, 
                        ${lightColorMid} ${(fadeStartPercent + fadeEndPercent) / 2}%,
                        ${lightColorFade} ${fadeEndPercent}%);
                    border-radius: 6px;
                    border: 1px solid var(--border-color);
                    position: relative;
                    margin-bottom: 10px;
                ">
                    <!-- Fade span indicator -->
                    <div style="
                        position: absolute;
                        left: ${fadeStartPercent}%;
                        right: ${100 - fadeEndPercent}%;
                        top: -2px;
                        bottom: -2px;
                        border: 2px solid ${lightColor};
                        border-radius: 6px;
                        opacity: 0.6;
                    "></div>
                </div>
                
                <!-- Fade metrics -->
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary);">
                    <span>0m</span>
                    <span style="color: ${lightColor};">Fade Start: ${fadeDistance - fadeSpan}m</span>
                    <span>Fade End: ${fadeDistance}m</span>
                </div>
                
                <!-- Fade span info -->
                <div style="
                    margin-top: 8px;
                    padding: 8px;
                    background: var(--bg-secondary);
                    border-radius: 4px;
                    font-size: 11px;
                    color: var(--text-secondary);
                ">
                    💡 Fade Span: <strong style="color: ${lightColor};">${fadeSpan}m</strong> 
                    (${((fadeSpan / fadeDistance) * 100).toFixed(1)}% of total distance)
                </div>
            </div>
        `;
    },

    // Create performance analysis
    createPerformanceAnalysis(flare, index, diffuseColor) {
        const innerAngle = flare.innerAngle || 5;
        const outerAngle = flare.outerAngle || 90;
        const range = flare.range || 30;
        const fadeDistance = flare.fadeDistance || 140;
        const fadeSpan = flare.fadeSpan || 30;
        
        // Calculate performance metrics
        const focusDiff = outerAngle - innerAngle;
        let focusLevel = 'Very Focused';
        if (focusDiff > 60) focusLevel = 'Wide Spread';
        else if (focusDiff > 30) focusLevel = 'Moderate';
        else if (focusDiff > 15) focusLevel = 'Focused';
        
        let rangeType = 'Short Range';
        if (range > 100) rangeType = 'Long Range';
        else if (range > 50) rangeType = 'Medium Range';
        
        let performance = '✅ Optimal';
        if (range > 100 && outerAngle > 120) performance = '⚠️ High Impact';
        else if (range > 50 && outerAngle > 90) performance = '⚠️ Moderate Impact';
        
        return `
            <div class="performance-analysis" style="
                background: var(--bg-primary);
                border-radius: 8px;
                padding: 15px;
                border: 1px solid var(--border-color);
            ">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
                    Performance Analysis:
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Focus:</span>
                        <span style="color: var(--accent-primary); font-weight: 500;">${focusLevel}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Range Type:</span>
                        <span style="color: var(--accent-primary); font-weight: 500;">${rangeType}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Performance:</span>
                        <span style="font-weight: 500;">${performance}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Fade Ratio:</span>
                        <span style="color: var(--accent-primary); font-weight: 500;">${((fadeSpan / fadeDistance) * 100).toFixed(1)}%</span>
                    </div>
                </div>
                
                <!-- Quick stats with ETS2 HSL info -->
                <div style="
                    margin-top: 12px;
                    padding: 8px;
                    background: var(--bg-secondary);
                    border-radius: 4px;
                    font-size: 10px;
                    color: var(--text-secondary);
                    border-left: 3px solid var(--accent-primary);
                ">
                    <strong>Setup:</strong> ${flare.biasSetup || 'candela_hue_saturation'}<br>
                    <strong>Type:</strong> ${flare.biasType || 'spot'} light<br>
                    <strong>HSL Values:</strong> ${diffuseColor.brightness || 80}/${diffuseColor.hue || 55}°/${diffuseColor.saturation || 100}%<br>
                    <small style="opacity: 0.8;">💡 Format: Brightness(${this.getBrightnessUnit(flare.biasSetup)})/Hue/Saturation</small>
                </div>
            </div>
        `;
    },

    // Get brightness unit based on bias setup
    getBrightnessUnit(biasSetup) {
        if (biasSetup === 'lux_hue_saturation') return 'lux';
        if (biasSetup === 'lumen_hue_saturation') return 'lumen';
        return 'candela'; // default
    },

    // Update preview when values change
    updatePreview(index) {
        const flareData = state.getFlareData();
        if (flareData[index] && flareData[index].hasBias) {
            const container = document.getElementById(`bias-preview-${index}`);
            if (container) {
                const flare = flareData[index];
                container.outerHTML = this.createPreview(flare, index);
            }
        }
    }
};
