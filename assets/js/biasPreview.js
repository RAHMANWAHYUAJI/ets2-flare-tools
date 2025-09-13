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

    // Convert HSV to RGB (Custom curve untuk lebih cerah di value rendah)
    hslToRgb(hue, saturation, intensity, biasSetup) {
        // Normalize HSV values exactly like Blender
        const h = ((hue % 360) + 360) % 360; // 0-360
        const s = Math.max(0, Math.min(100, saturation)) / 100; // 0-1
        let v = Math.max(0, Math.min(100, intensity)) / 100; // 0-1 (pure Blender range)
        
        // Smooth curve matematika untuk transisi mulus dengan boost di value kecil
        // Menggunakan square root curve + gradual boost yang berkurang ke atas
        v = Math.pow(v, 0.5);
        
        // Tambah boost 5% di value kecil, berkurang gradual ke 0% di value tinggi
        // Formula: boost = 0.05 * (1 - v) untuk distribusi yang smooth
        const boost = 0.05 * (1 - v);
        v = Math.min(1.0, v + boost); // Clamp ke maksimal 1.0
        
        // Pure HSV to RGB conversion (Blender algorithm)
        const c = v * s; // Chroma
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        
        let r, g, b;
        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }
        
        // Convert to 0-255 range (pure Blender output)
        const finalR = Math.round((r + m) * 255);
        const finalG = Math.round((g + m) * 255);
        const finalB = Math.round((b + m) * 255);
        
        return {
            r: Math.max(0, Math.min(255, finalR)),
            g: Math.max(0, Math.min(255, finalG)), 
            b: Math.max(0, Math.min(255, finalB)),
            hue: h,
            saturation: s * 100,
            brightness: intensity,
            intensity: intensity,
            value: v * 100, // HSV Value in percentage
            hasBloom: false // No bloom effects
        };
    },

    // Main function to create modern bias preview
    createPreview(flare, index) {
        const innerAngle = Number(flare.innerAngle !== undefined ? flare.innerAngle : 5);
        const outerAngle = Number(flare.outerAngle !== undefined ? flare.outerAngle : 90);
        const range = Number(flare.range !== undefined ? flare.range : 30);
        const fadeDistance = Number(flare.fadeDistance !== undefined ? flare.fadeDistance : 140);
        const fadeSpan = Number(flare.fadeSpan !== undefined ? flare.fadeSpan : 30);
        const biasSetup = flare.biasSetup || 'candela_hue_saturation';
        
        const diffuseColor = this.parseDiffuseColor(flare.diffuseColor || "(80, 55, 100)", biasSetup);
        const brightness = diffuseColor.brightness || 0; // Ambil brightness dari parsed color
        
        return `
            <div class="interactive-cone-container" id="bias-preview-${index}">
                ${this.createInteractiveConeVisualization(flare, index, diffuseColor, brightness)}
            </div>
        `;
    },

    // Create enhanced cone visualization with gradient control
    createEnhancedConeVisualization(flare, index, diffuseColor) {
        const innerAngle = Number(flare.innerAngle !== undefined ? flare.innerAngle : 5);
        const outerAngle = Number(flare.outerAngle !== undefined ? flare.outerAngle : 90);
        const range = Number(flare.range !== undefined ? flare.range : 30);
        const fadeDistance = Number(flare.fadeDistance !== undefined ? flare.fadeDistance : 140);
        const fadeSpan = Number(flare.fadeSpan !== undefined ? flare.fadeSpan : 30);
        
        // Calculate cone dimensions (facing right) - OPTIMIZED FIT TO CONTAINER
        const containerWidth = 400; // Fixed container width
        const padding = 15;
        const availableWidth = containerWidth - (padding * 2) - 50; // Reduced reserved space for labels
        
        // Realistic scaling: 1 range unit = 1cm on screen (≈10px for visibility)
        // Using 10px per cm for better visibility on screen
        const scaledRange = range * 10; // 1cm = 10px for good visibility
        
        const maxConeLength = availableWidth - 30; // Reduced reserved space for light source
        const coneLength = Math.max(40, Math.min(maxConeLength, scaledRange)); // OPTIMIZED FIT TO CONTAINER
        
        const svgWidth = containerWidth;
        const svgHeight = 200;
        const startX = 30;
        const centerY = svgHeight / 2;
        
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
        
        // Calculate fade gradient based on fade distance and span - allow 0 fade span
        const fadeRatio = fadeDistance > 0 ? fadeSpan / fadeDistance : 0;
        const fadeStart = Math.max(0, 1 - fadeRatio);
        const lightColorFade = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, ${fadeStart * 0.3})`;
        
        // Handle zero range case
        if (range === 0) {
            return `
                <div class="enhanced-cone-wrapper">
                    <svg width="${svgWidth}" height="${svgHeight}" class="cone-svg">
                        <text x="${svgWidth/2}" y="${svgHeight/2}" 
                              fill="#666" font-size="12px" text-anchor="middle">
                            Range: 0m (No light cone)
                        </text>
                    </svg>
                </div>
            `;
        }
        
        // Handle zero angles case
        if (innerAngle === 0 && outerAngle === 0) {
            return `
                <div class="enhanced-cone-wrapper">
                    <svg width="${svgWidth}" height="${svgHeight}" class="cone-svg">
                        <text x="${svgWidth/2}" y="${svgHeight/2}" 
                              fill="#666" font-size="12px" text-anchor="middle">
                            Angles: 0° (No light cone)
                        </text>
                    </svg>
                </div>
            `;
        }
        
        return `
            <div class="enhanced-cone-wrapper">
                <svg width="${svgWidth}" height="${svgHeight}" class="cone-svg">
                    <defs>
                        <!-- Enhanced gradient for outer cone with fade control -->
                        <linearGradient id="outerConeGrad-${index}" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:${lightColorAlpha};stop-opacity:1.0" />
                            <stop offset="${fadeStart * 100}%" style="stop-color:${lightColorAlpha};stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:${lightColorFade};stop-opacity:0.2" />
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
                    </circle>
                    
                    <!-- Range indicator -->
                    <line x1="${startX}" y1="${centerY + 25}" x2="${endX}" y2="${centerY + 25}"
                          stroke="${lightColorAlpha}" stroke-width="2" stroke-dasharray="3,3"/>
                    <text x="${startX + coneLength/2}" y="${centerY + 40}" 
                          fill="#ffffff" font-size="11px" text-anchor="middle">
                        Range: ${range}m
                    </text>
                    
                    <!-- Scale indicator: 1cm = 10px -->
                    <text x="${startX}" y="${centerY + 55}" 
                          fill="#888" font-size="9px">
                        Scale: 1:1 cm
                    </text>
                    
                    <!-- Scale ruler marks (every 1cm = 10px) -->
                    ${(() => {
                        let marks = '';
                        const maxMarks = Math.floor(coneLength / 10);
                        for (let i = 1; i <= maxMarks && i <= 30; i++) {
                            const x = startX + (i * 10);
                            const isMainMark = i % 5 === 0; // Every 5cm is longer mark
                            const markHeight = isMainMark ? 8 : 4;
                            marks += `<line x1="${x}" y1="${centerY + 20}" x2="${x}" y2="${centerY + 20 + markHeight}" stroke="#666" stroke-width="1"/>`;
                            if (isMainMark) {
                                marks += `<text x="${x}" y="${centerY + 35}" fill="#666" font-size="8px" text-anchor="middle">${i}cm</text>`;
                            }
                        }
                        return marks;
                    })()}
                    
                    <!-- Angle indicators - optimized positioning -->
                    <text x="${Math.min(svgWidth - 40, endX + 8)}" y="${innerTopY}" 
                          fill="#ffffff" font-size="10px">
                        Inner: ${innerAngle}°
                    </text>
                    <text x="${Math.min(svgWidth - 40, endX + 8)}" y="${outerTopY - 5}" 
                          fill="#ffffff" font-size="10px">
                        Outer: ${outerAngle}°
                    </text>
                </svg>
            </div>
        `;
    },

    // Create interactive cone visualization with smart auto-framing
    createInteractiveConeVisualization(flare, index, diffuseColor, brightness = 0) {
        const innerAngle = Number(flare.innerAngle !== undefined ? flare.innerAngle : 5);
        const outerAngle = Number(flare.outerAngle !== undefined ? flare.outerAngle : 90);
        const range = Number(flare.range !== undefined ? flare.range : 30);
        const fadeDistance = Number(flare.fadeDistance !== undefined ? flare.fadeDistance : 140);
        const fadeSpan = Number(flare.fadeSpan !== undefined ? flare.fadeSpan : 30);
        
        // Get current zoom level or calculate smart auto-zoom
        let zoomLevel = (this.zoomLevels && this.zoomLevels[index]) ? 
                       this.zoomLevels[index] : 
                       this.calculateAutoZoom(outerAngle, range);
        
        // Store zoom level for this cone
        if (!this.zoomLevels) this.zoomLevels = {};
        this.zoomLevels[index] = zoomLevel;
        
        // Fixed container size for consistent fit-to-container behavior
        const containerWidth = 400; // Fixed width for consistent layout
        const containerHeight = 240;
        const padding = 15;
        
        // Calculate optimal cone size that fits in container - SMART FIT TO CONTAINER
        const availableWidth = containerWidth - (padding * 2) - 60; // Space for labels
        const availableHeight = containerHeight - (padding * 2) - 40; // Space for range indicator
        
        // Smart scaling formula that fits any range value to container
        const maxConeLength = availableWidth - 40; // Reserve space for light source and labels
        
        // Use logarithmic scaling for large ranges to fit better
        let scaledRange;
        if (range <= 5) {
            scaledRange = range * 40; // Linear scaling for small ranges
        } else if (range <= 20) {
            scaledRange = 200 + (range - 5) * 15; // Moderate scaling for medium ranges
        } else {
            scaledRange = 425 + Math.log(range - 19) * 60; // Logarithmic scaling for large ranges
        }
        
        const baseConeLength = Math.max(40, Math.min(maxConeLength, scaledRange)); // SMART FIT TO CONTAINER
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
        // Intensity 0 = mati, 50 = normal, 100 = bright, 500 = sangat luminous dengan bloom
        const intensity = brightness; // Gunakan nilai brightness sebagai intensity
        let baseOpacity, bloomRadius, bloomIntensity;
        
        if (intensity === 0) {
            // Mati total
            baseOpacity = 0;
            bloomRadius = 0;
            bloomIntensity = 0;
        } else if (intensity <= 20) {
            // 1-20: 20% - 30% lightness, opacity rendah
            baseOpacity = Math.max(0.2, intensity / 20 * 0.4); // 0.2 - 0.4
            bloomRadius = 0;
            bloomIntensity = 0;
        } else if (intensity <= 50) {
            // 21-50: 30% - 50% lightness, opacity sedang
            baseOpacity = 0.4 + (intensity - 20) / 30 * 0.3; // 0.4 - 0.7
            bloomRadius = 0;
            bloomIntensity = 0;
        } else if (intensity <= 100) {
            // 51-100: 50% - 100% lightness, opacity tinggi
            baseOpacity = 0.7 + (intensity - 50) / 50 * 0.25; // 0.7 - 0.95
            bloomRadius = 0;
            bloomIntensity = 0;
        } else {
            // 101+: BLOOM EFFECT AKTIF! 
            baseOpacity = 0.95; // Max opacity
            bloomRadius = 3 + (intensity - 100) / 50 * 7; // 3 - 10px bloom
            bloomIntensity = 0.4 + (intensity - 100) / 50 * 0.5; // 0.4 - 0.9 bloom
        }
        
        // Warna dasar tetap asli (tidak memutih)
        const lightColor = `rgb(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b})`;
        const lightColorAlpha = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, ${baseOpacity})`;
        
        // Calculate fade gradient based on fade distance and span - allow 0 fade span
        const fadeRatio = fadeDistance > 0 ? fadeSpan / fadeDistance : 0;
        const fadeStart = Math.max(0, 1 - fadeRatio);
        const fadeOpacity = baseOpacity * 0.6;
        const lightColorFade = `rgba(${diffuseColor.r}, ${diffuseColor.g}, ${diffuseColor.b}, ${fadeStart * fadeOpacity})`;
        
        // Adaptive sizing based on zoom and container
        const lightRadius = Math.max(5, Math.min(10, 7 * zoomLevel));
        const strokeWidth = Math.max(1, Math.min(4, 2.5 * zoomLevel));
        const fontSize = Math.max(9, Math.min(14, 11 * zoomLevel));
        
        // Handle zero range case
        if (range === 0) {
            return `
                <div class="cone-visualization-wrapper">
                    <svg width="${containerWidth}" height="${containerHeight}" 
                         class="cone-svg" 
                         id="cone-svg-${index}">
                        <text x="${containerWidth/2}" y="${containerHeight/2}" 
                              fill="#666" font-size="14px" text-anchor="middle">
                            Range: 0m (No light cone)
                        </text>
                    </svg>
                </div>
            `;
        }
        
        // Handle zero angles case
        if (innerAngle === 0 && outerAngle === 0) {
            return `
                <div class="cone-visualization-wrapper">
                    <svg width="${containerWidth}" height="${containerHeight}" 
                         class="cone-svg" 
                         id="cone-svg-${index}">
                        <text x="${containerWidth/2}" y="${containerHeight/2}" 
                              fill="#666" font-size="14px" text-anchor="middle">
                            Angles: 0° (No light cone)
                        </text>
                    </svg>
                </div>
            `;
        }
        
        return `
            <div class="cone-visualization-wrapper">
                <svg width="${containerWidth}" height="${containerHeight}" 
                     class="cone-svg" 
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
                          fill="#ffffff" font-size="${fontSize}px" text-anchor="middle">
                        Range: ${range}m
                    </text>
                    
                    <!-- Scale indicator: 1cm = 10px -->
                    <text x="${startX}" y="${centerY + 55}" 
                          fill="#888" font-size="${Math.max(8, fontSize - 2)}px">
                        Scale: 1:1 cm
                    </text>
                    
                    <!-- Scale ruler marks (every 1cm = 10px) -->
                    ${(() => {
                        let marks = '';
                        const maxMarks = Math.floor(coneLength / 10);
                        for (let i = 1; i <= maxMarks && i <= 30; i++) {
                            const x = startX + (i * 10);
                            const isMainMark = i % 5 === 0; // Every 5cm is longer mark
                            const markHeight = isMainMark ? 8 : 4;
                            marks += `<line x1="${x}" y1="${centerY + 20}" x2="${x}" y2="${centerY + 20 + markHeight}" stroke="#666" stroke-width="1"/>`;
                            if (isMainMark) {
                                marks += `<text x="${x}" y="${centerY + 35}" fill="#666" font-size="${Math.max(7, fontSize - 3)}px" text-anchor="middle">${i}cm</text>`;
                            }
                        }
                        return marks;
                    })()}
                    
                    <!-- Angle indicators with optimized positioning -->
                    <text x="${Math.min(containerWidth - padding - 45, endX + 8)}" 
                          y="${Math.max(padding + 15, Math.min(containerHeight - padding - 15, clampedInnerTopY + fontSize/2))}" 
                          fill="#ffffff" font-size="${fontSize}px">
                        Inner: ${innerAngle}°
                    </text>
                    <text x="${Math.min(containerWidth - padding - 45, endX + 8)}" 
                          y="${Math.max(padding + 5, Math.min(containerHeight - padding - 5, clampedOuterTopY))}" 
                          fill="#ffffff" font-size="${fontSize}px">
                        Outer: ${outerAngle}°
                    </text>
                </svg>
            </div>
        `;
    },

    // Calculate auto-zoom based on cone bounds (smart framing)
    calculateAutoZoom(outerAngle, range) {
        // Fixed container dimensions for fit-to-container behavior
        const containerWidth = 400; // Fixed width
        const containerHeight = 240;
        const padding = 15;
        
        // Available space after padding - optimized fit to container
        const availableWidth = containerWidth - (padding * 2) - 50; // Reduced reserved space for labels
        const availableHeight = containerHeight - (padding * 2) - 40; // -40 for range indicator
        
        // Calculate cone dimensions based on angle constraints
        const outerRadians = (outerAngle * Math.PI) / 180;
        
        // Base cone length calculation - optimized fit to container
        const maxAllowedLength = availableWidth - 30; // Reduced reserved space for light source and margins
        
        // Realistic scaling: 1 range unit = 1cm on screen (≈10px for visibility)
        // Using 10px per cm for better visibility on screen
        const scaledRange = range * 10; // 1cm = 10px for good visibility
        
        const baseConeLength = Math.max(40, Math.min(maxAllowedLength, scaledRange)); // REALISTIC 1:1 CM SCALING
        
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
