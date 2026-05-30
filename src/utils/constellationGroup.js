/**
 * Groups stars by tag/resource into constellations.
 * Returns an array of objects: { tag, color, stars: [...] }
 */
export function groupIntoConstellations(stars) {
  const groups = new Map();
  
  stars.forEach(star => {
    const tag = star.tags?.[0] || 'other';
    if (!groups.has(tag)) {
      groups.set(tag, []);
    }
    groups.get(tag).push(star);
  });

  return Array.from(groups.entries()).map(([tag, starList]) => ({
    tag,
    stars: starList,
  }));
}
