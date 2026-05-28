/**
 * ColorMap.js
 * 
 * Maps AutoCAD Color Index (ACI) values to clean, modern HEX colors
 * optimized for standard dark-mode high-fidelity rendering.
 * Provides a stable string hashing function to generate premium, distinct
 * layer colors when drawings use the default "Bylayer" color value.
 */

/**
 * Generates a stable, high-quality, bright pastel color for a layer name.
 * Uses HSL mapping to guarantee optimal visibility against dark backgrounds.
 * 
 * @param {string} layerName - Name of the layer
 * @returns {string} HSL color string
 */
export function getLayerColor(layerName) {
  const normalized = (layerName || '0').trim();
  
  // Quick hash function
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Extract stable values
  const hue = Math.abs(hash) % 360;
  
  // Set saturation (75-85%) and lightness (60-70%) to look vibrant on dark zinc-950 background
  const saturation = 80;
  const lightness = 65;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Resolves the display color for a DXF entity, respecting ACI index codes,
 * and falling back to stable layer colors when "Bylayer" (256) or "Byblock" (0) is specified.
 * 
 * @param {object} entity - DXF entity containing color indices
 * @param {string} layerName - Layer name the entity belongs to
 * @returns {string} HEX or HSL color code
 */
export function getEntityColor(entity, layerName) {
  const colorIndex = entity.color;
  
  // 0 = Byblock, 256 = Bylayer, undefined = Default to Layer
  if (colorIndex === undefined || colorIndex === 0 || colorIndex === 256) {
    return getLayerColor(layerName || '0');
  }

  // Modernized AutoCAD Color Index (ACI) Palette mapped to Tailwind-like vibrant colors
  const aciPalette = {
    1: '#f43f5e', // Red (rose-500)
    2: '#eab308', // Yellow (yellow-500)
    3: '#10b981', // Green (emerald-500)
    4: '#06b6d4', // Cyan (cyan-500)
    5: '#3b82f6', // Blue (blue-500)
    6: '#d946ef', // Magenta (fuchsia-500)
    7: '#fafafa', // White/Black (zinc-50, maps to bright off-white in dark mode)
    8: '#71717a', // Dark Gray (zinc-500)
    9: '#a1a1aa', // Light Gray (zinc-400)
  };

  // If the index lies in standard range 1-9, return from ACI palette,
  // else generate a beautiful layer-specific fallback.
  return aciPalette[colorIndex] || getLayerColor(layerName || '0');
}
