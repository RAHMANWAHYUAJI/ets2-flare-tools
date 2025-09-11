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

    // Convert ETS2 HSL system to RGB with intensity-based luminance
    hslToRgb(hue, saturation, intensity, biasSetup) {
        // Normalize values
        const h = ((hue % 360) + 360) % 360; // 0-360
        const s = Math.max(0, Math.min(100, saturation)) / 100; // 0-1
        
        // Intensity system: higher values = more luminous but keep color
        // Tidak seperti brightness yang memutih, intensity mempertahankan warna
        let baseColor, lightness;
        
        if (s === 0) {
            // Grayscale: intensity langsung ke lightness
            lightness = Math.max(0, Math.min(1.0, intensity / 100));
        } else {
            // Colored light: intensity mempengaruhi luminance tapi tetap berwarna
            // Gunakan lightness moderat agar warna tidak hilang
            lightness = Math.max(0, Math.min(0.6, intensity / 100 * 0.6));
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
            brightness: intensity,
            intensity: intensity, // Tambahan untuk intensity tracking
            lightness: lightness  // Lightness yang digunakan untuk warna dasar
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
        const brightness = diffuseColor.brightness || 0; // Ambil brightness dari parsed color
        
        return `
            <div class="interactive-cone-container" id="bias-preview-${index}" style="
                background: radial-gradient(ellipse at center, #0a0a0a 0%, #1a1a1a 100%);
                border-radius: 8px;
                padding: 15px;
                border: 1px solid #333;
                min-height: 280px;
                position: relative;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                ${this.createInteractiveConeVisualization(flare, index, diffuseColor, brightness)}
            </div>
        `;
    },

    // Create enhanced cone visualization with gradient control
    createEnhancedConeVisualization(flare, index, diffuseColor) {
        const innerAngle = flare.innerAngle || 5;
        const outerAngle = flare.outerAngle || 90;
        const range = flare.range || 30;
        const fadeDistance = flare.fadeDistance || 140;
        const fadeSpan = flare.fadeSpan || 30;
        
        // Calculate cone dimensions (facing right) - larger size for full width
        const svgWidth = 320;
        const svgHeight = 200;
        const startX = 30;
        const centerY = svgHeight / 2;
        const coneLength = Math.min(250, range * 5);
        
        // Calculate cone angles for right-facing cone
        const innerRadians = (innerAngle * Math.PI) / 180;
        const outerRadians = (outerAngle * Math.PI) / 180;
        
        // Cone points
        const innerTopY = centerY - Math.tan(innerRadians / 2) * coneLength;
        const innerBottomY = centerY + Math.tan(innerRadians / 2) * coneLength;
        const outerTopY = centerY - Math.tan(outerRadians / 2) * coneLength;
        const outerBottomY = centerY + Math.tan(outerRadians / 2) * coneLength;
        const endX = startX + coneLength;
        
        // Color calculations with fade control
        const lightColor = `rgb(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b})`;
        const lightColorAlpha = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, 0.6)`;
        
        // Calculate fade gradient based on fade distance and span
        const fadeRatio = fadeSpan / fadeDistance;
        const fadeStart = Math.max(0.2, 1 - fadeRatio);
        const lightColorFade = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, ${fadeStart * 0.3})`;
        
        return `
            <div style="
                background: radial-gradient(ellipse at center, #0a0a0a 0%, #1a1a1a 100%);
                border-radius: 8px;
                padding: 15px;
                border: 1px solid #333;
                display: flex;
                justify-content: center;
            ">
                <svg width="${svgWidth}" height="${svgHeight}" style="display: block;">
                    <defs>
                        <!-- Enhanced gradient for outer cone with fade control -->
                        <linearGradient id="outerConeGrad-${index}" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:${lightColorAlpha};stop-opacity:0.7" />
                            <stop offset="${fadeStart * 100}%" style="stop-color:${lightColorAlpha};stop-opacity:0.4" />
                            <stop offset="100%" style="stop-color:${lightColorFade};stop-opacity:0.1" />
                        </linearGradient>
                        
                        <!-- Enhanced gradient for inner cone -->
                        <linearGradient id="innerConeGrad-${index}" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:${lightColor};stop-opacity:0.9" />
                            <stop offset="${fadeStart * 100}%" style="stop-color:${lightColor};stop-opacity:0.6" />
                            <stop offset="100%" style="stop-color:${lightColorAlpha};stop-opacity:0.2" />
                        </linearGradient>
                        
                        <!-- Glow filter -->
                        <filter id="glow-${index}">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
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
                    
                    <!-- Inner cone - NO OUTLINE -->
                    <polygon points="${startX},${centerY} ${endX},${innerTopY} ${endX},${innerBottomY}"
                             fill="url(#innerConeGrad-${index})" 
                             stroke="none"
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
                          fill="#888" font-size="11px" text-anchor="middle">
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

    // Create interactive cone visualization with smart auto-framing
    createInteractiveConeVisualization(flare, index, diffuseColor, brightness = 0) {
        const innerAngle = flare.innerAngle || 5;
        const outerAngle = flare.outerAngle || 90;
        const range = flare.range || 30;
        const fadeDistance = flare.fadeDistance || 140;
        const fadeSpan = flare.fadeSpan || 30;
        
        // Get current zoom level or calculate smart auto-zoom
        let zoomLevel = (this.zoomLevels && this.zoomLevels[index]) ? 
                       this.zoomLevels[index] : 
                       this.calculateAutoZoom(outerAngle, range);
        
        // Store zoom level for this cone
        if (!this.zoomLevels) this.zoomLevels = {};
        this.zoomLevels[index] = zoomLevel;
        
        // Fixed container and padding
        const containerWidth = 280;
        const containerHeight = 240;
        const padding = 15; // Reduced padding for better utilization
        
        // Calculate optimal cone dimensions with better space utilization
        const availableWidth = containerWidth - (padding * 2);
        const availableHeight = containerHeight - (padding * 2);
        
        // More aggressive cone length calculation
        const baseConeLength = Math.max(100, Math.min(200, range * 5));
        const coneLength = baseConeLength * zoomLevel;
        
        // Better positioning - center the cone more effectively
        const startX = padding + 15;
        const centerY = containerHeight / 2;
        const endX = startX + coneLength;
        
        // Calculate cone angles for right-facing cone
        const innerRadians = (innerAngle * Math.PI) / 180;
        const outerRadians = (outerAngle * Math.PI) / 180;
        
        // Cone points with better scaling
        const innerTopY = centerY - Math.tan(innerRadians / 2) * coneLength;
        const innerBottomY = centerY + Math.tan(innerRadians / 2) * coneLength;
        const outerTopY = centerY - Math.tan(outerRadians / 2) * coneLength;
        const outerBottomY = centerY + Math.tan(outerRadians / 2) * coneLength;
        
        // Ensure cone fits within container bounds but allow closer to edges
        const clampedOuterTopY = Math.max(padding + 5, outerTopY);
        const clampedOuterBottomY = Math.min(containerHeight - padding - 5, outerBottomY);
        const clampedInnerTopY = Math.max(padding + 5, innerTopY);
        const clampedInnerBottomY = Math.min(containerHeight - padding - 5, innerBottomY);
        
        // Intensity-based luminance system (SCS ETS2 accurate)
        // Intensity 0 = mati, 50 = normal, 100 = bright, 150 = sangat luminous dengan bloom
        const intensity = brightness; // Gunakan nilai brightness sebagai intensity
        let baseOpacity, bloomRadius, bloomIntensity;
        
        if (intensity === 0) {
            // Mati total
            baseOpacity = 0;
            bloomRadius = 0;
            bloomIntensity = 0;
        } else if (intensity <= 50) {
            // 1-50: dari redup ke normal
            baseOpacity = Math.max(0.1, intensity / 50 * 0.7);
            bloomRadius = 0;
            bloomIntensity = 0;
        } else if (intensity <= 100) {
            // 50-100: dari normal ke bright dengan sedikit bloom
            baseOpacity = 0.7 + (intensity - 50) / 50 * 0.25; // 0.7 - 0.95
            bloomRadius = (intensity - 50) / 50 * 3; // 0 - 3px bloom
            bloomIntensity = (intensity - 50) / 50 * 0.3; // 0 - 0.3 bloom opacity
        } else {
            // 100-150: sangat luminous dengan bloom kuat
            baseOpacity = 0.95;
            bloomRadius = 3 + (intensity - 100) / 50 * 7; // 3 - 10px bloom
            bloomIntensity = 0.3 + (intensity - 100) / 50 * 0.5; // 0.3 - 0.8 bloom
        }
        
        // Warna dasar tetap asli (tidak memutih)
        const lightColor = `rgb(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b})`;
        const lightColorAlpha = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, ${baseOpacity})`;
        
        // Calculate fade gradient based on fade distance and span
        const fadeRatio = fadeSpan / fadeDistance;
        const fadeStart = Math.max(0.2, 1 - fadeRatio);
        const fadeOpacity = baseOpacity * 0.6;
        const lightColorFade = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, ${fadeStart * fadeOpacity})`;
        
        // Adaptive sizing based on zoom and container
        const lightRadius = Math.max(5, Math.min(10, 7 * zoomLevel));
        const strokeWidth = Math.max(1, Math.min(4, 2.5 * zoomLevel));
        const fontSize = Math.max(9, Math.min(14, 11 * zoomLevel));
        
        return `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 240px;
                overflow: hidden;
            ">
                <svg width="${containerWidth}" height="${containerHeight}" 
                     style="display: block; transition: all 0.3s ease;" 
                     id="cone-svg-${index}">
                    <defs>
                        <!-- Gradient untuk outer cone dengan fade natural -->
                        <linearGradient id="outerConeGrad-${index}" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:${lightColorAlpha};stop-opacity:${baseOpacity * 0.8}" />
                            <stop offset="${fadeStart * 100}%" style="stop-color:${lightColorAlpha};stop-opacity:${baseOpacity * 0.5}" />
                            <stop offset="100%" style="stop-color:${lightColorFade};stop-opacity:${baseOpacity * 0.1}" />
                        </linearGradient>
                        
                        <!-- Gradient untuk inner cone dengan intensitas penuh -->
                        <linearGradient id="innerConeGrad-${index}" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:${lightColor};stop-opacity:${baseOpacity}" />
                            <stop offset="${fadeStart * 100}%" style="stop-color:${lightColor};stop-opacity:${baseOpacity * 0.7}" />
                            <stop offset="100%" style="stop-color:${lightColorAlpha};stop-opacity:${baseOpacity * 0.2}" />
                        </linearGradient>
                        
                        <!-- Bloom effect untuk intensity tinggi -->
                        ${bloomIntensity > 0 ? `
                        <linearGradient id="bloomGrad-${index}" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:${lightColor};stop-opacity:${bloomIntensity}" />
                            <stop offset="30%" style="stop-color:${lightColor};stop-opacity:${bloomIntensity * 0.6}" />
                            <stop offset="70%" style="stop-color:${lightColor};stop-opacity:${bloomIntensity * 0.3}" />
                            <stop offset="100%" style="stop-color:${lightColor};stop-opacity:0" />
                        </linearGradient>
                        ` : ''}
                        
                        <!-- Glow filter dengan bloom dinamis -->
                        <filter id="glow-${index}" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="${Math.max(2, 3 * zoomLevel + bloomRadius)}" result="coloredBlur"/>
                            <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                        
                        <!-- Bloom filter untuk intensity tinggi -->
                        ${bloomIntensity > 0 ? `
                        <filter id="bloom-${index}" x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur stdDeviation="${bloomRadius * 2}" result="bloomBlur"/>
                            <feColorMatrix in="bloomBlur" type="matrix" 
                                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${bloomIntensity} 0"/>
                        </filter>
                        ` : ''}
                    </defs>
                    
                    <!-- Bloom layer untuk intensity tinggi (di belakang) -->
                    ${bloomIntensity > 0 ? `
                    <polygon points="${startX},${centerY} ${endX},${clampedOuterTopY} ${endX},${clampedOuterBottomY}"
                             fill="url(#bloomGrad-${index})" 
                             stroke="none" 
                             filter="url(#bloom-${index})"
                             opacity="${bloomIntensity}"/>
                    ` : ''}
                    
                    <!-- Outer cone dengan natural fading -->
                    <polygon points="${startX},${centerY} ${endX},${clampedOuterTopY} ${endX},${clampedOuterBottomY}"
                             fill="url(#outerConeGrad-${index})" 
                             stroke="${lightColorFade}" 
                             stroke-width="${strokeWidth}" 
                             opacity="0.8"/>
                    
                    <!-- Inner cone dengan glow effect -->
                    <polygon points="${startX},${centerY} ${endX},${clampedInnerTopY} ${endX},${clampedInnerBottomY}"
                             fill="url(#innerConeGrad-${index})" 
                             stroke="none"
                             filter="url(#glow-${index})"/>
                    
                    <!-- Enhanced light source point dengan intensity bloom -->
                    <circle cx="${startX}" cy="${centerY}" r="${lightRadius}" 
                            fill="${lightColor}" 
                            stroke="${lightColor}" 
                            stroke-width="${strokeWidth}"
                            opacity="${baseOpacity}"
                            filter="url(#glow-${index})">
                        ${intensity > 0 ? `<animate attributeName="opacity" values="${baseOpacity * 0.8};${baseOpacity};${baseOpacity * 0.8}" dur="2s" repeatCount="indefinite"/>` : ''}
                    </circle>
                    
                    <!-- Extra bloom untuk intensity tinggi -->
                    ${bloomIntensity > 0 ? `
                    <circle cx="${startX}" cy="${centerY}" r="${lightRadius * 2}" 
                            fill="${lightColor}" 
                            stroke="none"
                            opacity="${bloomIntensity * 0.4}"
                            filter="url(#bloom-${index})"/>
                    ` : ''}
                    
                    <!-- Range indicator with better visibility -->
                    <line x1="${startX}" y1="${centerY + 25}" 
                          x2="${endX}" y2="${centerY + 25}"
                          stroke="${lightColorAlpha}" stroke-width="${strokeWidth}" 
                          stroke-dasharray="4,4"/>
                    
                    <!-- Range text with better positioning -->
                    <text x="${startX + coneLength/2}" y="${centerY + 40}" 
                          fill="#bbb" font-size="${fontSize}px" text-anchor="middle">
                        Range: ${range}m
                    </text>
                    
                    <!-- Angle indicators with smart positioning -->
                    <text x="${Math.min(containerWidth - padding - 45, endX + 8)}" 
                          y="${Math.max(padding + 15, Math.min(containerHeight - padding - 15, clampedInnerTopY + fontSize/2))}" 
                          fill="${lightColor}" font-size="${fontSize}px">
                        Inner: ${innerAngle}°
                    </text>
                    <text x="${Math.min(containerWidth - padding - 45, endX + 8)}" 
                          y="${Math.max(padding + 5, Math.min(containerHeight - padding - 5, clampedOuterTopY))}" 
                          fill="${lightColorAlpha}" font-size="${fontSize}px">
                        Outer: ${outerAngle}°
                    </text>
                </svg>
            </div>
        `;
    },

    // Calculate auto-zoom based on cone bounds (smart framing)
    calculateAutoZoom(outerAngle, range) {
        // Fixed container dimensions
        const containerWidth = 280;
        const containerHeight = 240;
        const padding = 15; // Reduced padding for better space utilization
        
        // Available space after padding
        const availableWidth = containerWidth - (padding * 2) - 50; // -50 for labels
        const availableHeight = containerHeight - (padding * 2) - 40; // -40 for range indicator
        
        // Calculate cone dimensions based on angle constraints
        const outerRadians = (outerAngle * Math.PI) / 180;
        
        // Base cone length calculation - more aggressive sizing
        const baseConeLength = Math.max(80, Math.min(180, range * 4)); // Minimum 80px, maximum 180px
        
        // Calculate required height for this cone length and angle
        const requiredHeight = 2 * Math.tan(outerRadians / 2) * baseConeLength;
        
        // Calculate scale factors to fit in available space
        const widthScale = availableWidth / baseConeLength;
        const heightScale = availableHeight / requiredHeight;
        
        // Use the more restrictive scale, but ensure minimum visibility
        let optimalScale = Math.min(widthScale, heightScale);
        
        // Apply different scaling strategies based on angle
        if (outerAngle <= 60) {
            // For narrow angles, allow larger scaling
            optimalScale = Math.min(optimalScale * 1.4, 2.0);
        } else if (outerAngle <= 90) {
            // For moderate angles, standard scaling
            optimalScale = Math.min(optimalScale * 1.2, 1.5);
        } else {
            // For wide angles, more conservative scaling
            optimalScale = Math.min(optimalScale * 1.0, 1.2);
        }
        
        // Ensure minimum and maximum bounds for good visibility
        return Math.max(0.6, Math.min(2.2, optimalScale));
    },

    // Refresh cone visualization with current zoom level
    refreshConeVisualization(index) {
        const flareData = state.getFlareData();
        if (!flareData[index] || !flareData[index].hasBias) return;
        
        const svgContainer = document.getElementById(`cone-svg-${index}`);
        if (!svgContainer) return;
        
        const flare = flareData[index];
        const biasSetup = flare.biasSetup || 'candela_hue_saturation';
        const diffuseColor = this.parseDiffuseColor(flare.diffuseColor || "(80, 55, 100)", biasSetup);
        const brightness = diffuseColor.brightness || 0;
        
        // Get current zoom level
        const zoomLevel = this.zoomLevels[index] || 1.0;
        
        // Update SVG content with new zoom
        const newSvgContent = this.createInteractiveConeVisualization(flare, index, diffuseColor, brightness);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newSvgContent;
        const newSvg = tempDiv.querySelector('svg');
        
        if (newSvg) {
            svgContainer.parentNode.replaceChild(newSvg, svgContainer);
        }
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
