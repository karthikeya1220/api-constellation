export const METHOD_COLORS = {
  GET: '#E8E8FF',      // near-white blue
  POST: '#4A9EFF',     // bright blue
  PUT: '#FF9A3C',      // orange
  PATCH: '#FFD93D',    // amber
  DELETE: '#FF4D4D',   // red
  HEAD: '#9B9B9B',     // gray
  OPTIONS: '#7B68EE',  // medium purple
};

export const METHOD_GLOW_COLORS = {
  GET: '#AAAAFF',
  POST: '#2277DD',
  PUT: '#CC6600',
  PATCH: '#BB9900',
  DELETE: '#CC0000',
  HEAD: '#666666',
  OPTIONS: '#5544CC',
};

/**
 * Convert hex color to RGB array (0-1 range)
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}

/**
 * Get visual properties for a star based on method and frequency
 */
export function getStarVisuals(star) {
  const colorHex = METHOD_COLORS[star.method] || METHOD_COLORS.GET;
  const colorRgb = hexToRgb(colorHex);
  
  return {
    color: colorHex,
    colorRgb,
    brightness: 0.2 + star.frequency * 0.8,  // 0.2-1.0 range
    size: 0.5 + star.frequency * 1.5,         // 0.5-2.0 range
  };
}

