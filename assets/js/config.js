/**
 * ETS2 Flare Editor - Configuration & Constants
 * Contains all constants, enums, and configuration data
 */

// ETS2 Light Types untuk kendaraan (berdasarkan dokumentasi SCS official)
const lightTypes = [
    'electrics',        // General electric light
    'parking',          // Parking light
    'low_beam',         // Low beam headlight
    'high_beam',        // High beam headlight
    'brake',            // Brake light
    'reverse',          // Reverse light
    'left_blinker',     // Left turn signal
    'right_blinker',    // Right turn signal
    'aux',              // Auxiliary light
    'beacon'            // Emergency beacon
];

// ETS2 Direction Types (berdasarkan dokumentasi SCS)
const directionTypes = [
    'all',              // All directions
    'wide',             // Wide angle
    'narrow',           // Narrow angle
    'angle'             // Specific angle
];

// ETS2 Flare Types untuk kendaraan (berdasarkan unit hookup ETS2)
const flareTypes = [
    'flare_blink',      // Blinking flare dengan pattern
    'flare_vehicle'     // Static vehicle flare
];

// Bias setup types untuk flare (berdasarkan dokumentasi SCS)
const biasSetupTypes = [
    'candela_hue_saturation',    // Luminance, hue (0-360°), saturation (0-100+)
    'lumen_hue_saturation',      // Lumen based setup
    'lux_hue_saturation'         // Lux based setup
];

// Bias types untuk physical light
const biasPhysicalTypes = [
    'spot',             // Spotlight with inner/outer angles
    'point'             // Point light
];

// Default values for new flares
const defaultFlareValues = {
    flare_blink: {
        blinkPattern: '--',
        blinkStepLength: 0.1,
        stateChangeDuration: 0.001,
        lightType: 'beacon',
        dirType: 'wide',
        hasModel: false,
        hasModelLightSource: false
    },
    flare_vehicle: {
        intensity: 1.0,
        color: '(1, 1, 1)',
        stateChangeDuration: 0.001,
        lightType: 'beacon',
        dirType: 'wide',
        hasModel: false,
        hasModelLightSource: false
    },
    bias: {
        biasType: 'spot',
        biasSetup: 'candela_hue_saturation',
        diffuseColor: '(400, 38, 100)',
        specularColor: '(400, 38, 100)',
        range: 30,
        innerAngle: 5,
        outerAngle: 90,
        fadeDistance: 140,
        fadeSpan: 30
    }
};

// App configuration
const appConfig = {
    version: '2.1',
    name: 'ETS2 Flare Editor',
    defaultTheme: 'dark',
    fileExtension: '.sii',
    maxPatternLength: 500,      // Increased from 50 for longer blink patterns
    minPatternLength: 1,
    maxFlareLimit: 1000         // Maximum flares to parse (safety limit)
};
