/**
 * ETS2 Flare Editor - Animation System
 * Handles flare animations and preview functionality
 */

const animation = {
    // Start flare animation
    startFlareAnimation(flare, index) {
        // Skip animation for static flares
        if (flare.isStatic) return;
        
        const pattern = flare.blinkPattern;
        const stepLength = flare.blinkStepLength * 1000;
        
        flareAnimations[index] = {
            pattern: pattern,
            stepLength: stepLength,
            currentStep: 0,
            isRunning: true,
            interval: null
        };
        
        const animate = () => {
            if (!flareAnimations[index] || !flareAnimations[index].isRunning) return;
            
            const animationObj = flareAnimations[index];
            const char = animationObj.pattern[animationObj.currentStep];
            const light = document.getElementById(`light-${index}`);
            
            if (light) {
                const stateChangeDuration = flare.stateChangeDuration || 0.083;
                const transitionTime = stateChangeDuration * 1000; // Convert to milliseconds
                
                // Set transition duration untuk fade effect (hanya sekali, tidak setiap animate)
                if (!light.dataset.transitionSet || light.dataset.lastTransition !== transitionTime.toString()) {
                    light.style.transitionDuration = `${transitionTime}ms`;
                    light.style.transitionProperty = 'opacity, box-shadow, transform, background';
                    light.style.transitionTimingFunction = 'ease-in-out';
                    light.dataset.transitionSet = 'true';
                    light.dataset.lastTransition = transitionTime.toString();
                }
                
                if (char === 'X') {
                    light.className = 'flare-light active';
                    light.style.opacity = '1';
                    
                    // Activate light cone and range indicator for bias-enabled flares
                    if (flare.hasBias) {
                        const cone = document.getElementById(`cone-${index}`);
                        const range = document.getElementById(`range-${index}`);
                        if (cone) cone.className = 'light-cone active';
                        if (range) range.className = 'range-indicator active';
                    }
                } else {
                    light.className = 'flare-light off';
                    light.style.opacity = '0.3';
                    
                    // Deactivate light cone and range indicator
                    if (flare.hasBias) {
                        const cone = document.getElementById(`cone-${index}`);
                        const range = document.getElementById(`range-${index}`);
                        if (cone) cone.className = 'light-cone';
                        if (range) range.className = 'range-indicator';
                    }
                }
            }
            
            animationObj.currentStep = (animationObj.currentStep + 1) % animationObj.pattern.length;
        };
        
        // Update individual toggle button
        const individualBtn = document.getElementById(`toggle-btn-${index}`);
        if (individualBtn) {
            individualBtn.innerHTML = '🟢 ON';
            individualBtn.className = 'control-button';
            individualBtn.title = 'Click to turn OFF';
        }
        
        // Start animation immediately and then continue
        animate();
        flareAnimations[index].interval = setInterval(animate, stepLength);
    },

    // Stop flare animation
    stopFlareAnimation(index) {
        if (flareAnimations[index]) {
            clearInterval(flareAnimations[index].interval);
            flareAnimations[index].isRunning = false;
            
            // Turn light off
            const light = document.getElementById(`light-${index}`);
            if (light) {
                light.className = 'flare-light off';
                light.style.opacity = '0.3';
            }
        }
    },

    // Toggle individual flare animation
    toggleFlareAnimation(index) {
        const flareData = state.getFlareData();
        const flare = flareData[index];
        
        if (!flare || flare.type !== 'flare_blink') return;
        
        const btn = document.getElementById(`toggle-btn-${index}`);
        const isCurrentlyRunning = flareAnimations[index] && flareAnimations[index].isRunning;
        
        if (isCurrentlyRunning) {
            // Stop animation
            this.stopFlareAnimation(index);
            btn.innerHTML = '🔴 OFF';
            btn.className = 'control-button warning';
            btn.title = 'Click to turn ON';
            
            // Deactivate light cone and range indicator
            if (flare.hasBias) {
                const cone = document.getElementById(`cone-${index}`);
                const range = document.getElementById(`range-${index}`);
                if (cone) cone.className = 'light-cone';
                if (range) range.className = 'range-indicator';
            }
        } else {
            // Start animation
            this.startFlareAnimation(flare, index);
        }
    },

    // Start all animations (called on file load)
    startAllAnimations() {
        const flareData = state.getFlareData();
        
        flareData.forEach((flare, index) => {
            if (flare.type === 'flare_blink') {
                // Initialize with OFF state
                const btn = document.getElementById(`toggle-btn-${index}`);
                if (btn) {
                    btn.innerHTML = '🔴 OFF';
                    btn.className = 'control-button warning';
                    btn.title = 'Click to turn ON';
                }
                
                // Turn off light initially
                const light = document.getElementById(`light-${index}`);
                if (light) {
                    light.className = 'flare-light off';
                    light.style.opacity = '0.3';
                }
            }
        });
    },

    // Update animation after flare parameter changes
    updateFlareAnimation(index) {
        const flareData = state.getFlareData();
        const flare = flareData[index];
        
        if (flare && flare.type === 'flare_blink') {
            const wasRunning = flareAnimations[index] && flareAnimations[index].isRunning;
            
            // Stop current animation
            this.stopFlareAnimation(index);
            
            // Start with new parameters if it was running
            if (wasRunning) {
                setTimeout(() => this.startFlareAnimation(flareData[index], index), 50);
            }
        }
    },

    // Stop all animations (required by ui.js)
    stopAllAnimations() {
        // Stop ALL running animations
        Object.values(flareAnimations).forEach(animationObj => {
            if (animationObj && animationObj.interval) {
                clearInterval(animationObj.interval);
                animationObj.isRunning = false;
            }
        });
        
        // Turn off ALL lights and update individual buttons
        state.getFlareData().forEach((flare, index) => {
            if (flare.type === 'flare_blink') {
                const light = document.getElementById(`light-${index}`);
                if (light) {
                    light.className = 'flare-light off';
                    light.style.opacity = '0.3';
                }
                
                // Update individual button to OFF
                const individualBtn = document.getElementById(`toggle-btn-${index}`);
                if (individualBtn) {
                    individualBtn.innerHTML = '🔴 OFF';
                    individualBtn.className = 'control-button warning';
                    individualBtn.title = 'Click to turn ON';
                }
                
                // Deactivate light cone and range indicator
                if (flare.hasBias) {
                    const cone = document.getElementById(`cone-${index}`);
                    const range = document.getElementById(`range-${index}`);
                    if (cone) cone.className = 'light-cone';
                    if (range) range.className = 'range-indicator';
                }
            }
        });
        
        state.setAllAnimationsRunning(false);
    },

    // Get flare color based on type
    getFlareColor(flareType) {
        switch(flareType) {
            case 'flare_blink':
                return 'radial-gradient(circle, #ffaa00, #ff6600)'; // Orange for blinking
            case 'flare_vehicle':
                return 'radial-gradient(circle, #00aaff, #0066cc)'; // Blue for vehicle
            default:
                return 'radial-gradient(circle, #ffaa00, #ff6600)'; // Default orange
        }
    },

    // Toggle vehicle flare on/off
    toggleVehicleFlare(index) {
        const flareData = state.getFlareData();
        const flare = flareData[index];
        const light = document.getElementById(`light-${index}`);
        const toggleBtn = document.getElementById(`vehicle-toggle-btn-${index}`);
        
        if (!flare || flare.type !== 'flare_vehicle' || !light || !toggleBtn) return;
        
        // Toggle vehicle flare state
        const isCurrentlyOn = light.classList.contains('active');
        
        if (isCurrentlyOn) {
            // Turn OFF
            light.className = 'flare-light off';
            light.style.opacity = '0.3';
            toggleBtn.innerHTML = '🔴 OFF';
            toggleBtn.className = 'control-button warning';
            toggleBtn.title = 'Click to turn ON';
            
            // Deactivate light cone and range indicator for bias-enabled flares
            if (flare.hasBias) {
                const cone = document.getElementById(`cone-${index}`);
                const range = document.getElementById(`range-${index}`);
                if (cone) cone.className = 'light-cone';
                if (range) range.className = 'range-indicator';
            }
        } else {
            // Turn ON
            light.className = 'flare-light active';
            light.style.opacity = flare.intensity;
            toggleBtn.innerHTML = '🟢 ON';
            toggleBtn.className = 'control-button success';
            toggleBtn.title = 'Click to turn OFF';
            
            // Activate light cone and range indicator for bias-enabled flares
            if (flare.hasBias) {
                const cone = document.getElementById(`cone-${index}`);
                const range = document.getElementById(`range-${index}`);
                if (cone) cone.className = 'light-cone active';
                if (range) range.className = 'range-indicator active';
            }
        }
    }
};
