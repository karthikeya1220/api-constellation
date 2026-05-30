/**
 * Groups stars by tag (tags[0]) into constellations.
 * Assigns a unique color to each constellation group.
 * Returns an array of ConstellationGroup objects.
 */
export function groupIntoConstellations(stars) {
  const groups = new Map();

  // Group stars by tag
  stars.forEach(star => {
    const tag = star.constellationId || 'ungrouped';
    if (!groups.has(tag)) {
      groups.set(tag, []);
    }
    groups.get(tag).push(star);
  });

  // Convert to constellation objects with colors
  return Array.from(groups.entries()).map(([tagId, starList]) => {
    // Generate a color for this constellation by hashing the tag name
    const color = hashToHsl(tagId);
    
    // Calculate centroid
    const centroid = {
      x: starList.reduce((sum, s) => sum + s.x, 0) / starList.length,
      y: starList.reduce((sum, s) => sum + s.y, 0) / starList.length,
      z: starList.reduce((sum, s) => sum + s.z, 0) / starList.length,
    };

    return {
      id: tagId,
      label: tagId,
      starIds: starList.map(s => s.id),
      color,
      centroid,
    };
  });
}

/**
 * Convert a string to a consistent HSL color
 */
function hashToHsl(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 50 + (Math.abs(hash) % 30); // 50-80%
  const lightness = 60; // Keep consistent brightness

  const h = hue;
  const s = saturation;
  const l = lightness;

  // Convert HSL to hex
  const c = ((100 - Math.abs(2 * l - 100)) / 100) * (s / 100);
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = (l / 100) - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (val) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

