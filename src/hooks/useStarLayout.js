import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
} from 'd3-force';

/**
 * Run D3 force simulation on stars and assign x,y,z positions.
 * This runs synchronously once and returns the positioned stars.
 */
export function useStarLayout(stars) {
  if (!stars || stars.length === 0) return [];

  // Create node objects with initial positions
  const nodes = stars.map((star, i) => ({
    id: star.id,
    x: Math.random() * 10 - 5,
    y: Math.random() * 10 - 5,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    index: i,
    star, // Keep reference to original star
  }));

  // Create links between stars in the same constellation
  const links = [];
  const constellationMap = new Map();

  stars.forEach(star => {
    const cid = star.constellationId || 'ungrouped';
    if (!constellationMap.has(cid)) {
      constellationMap.set(cid, []);
    }
    constellationMap.get(cid).push(star);
  });

  // Create links between consecutive stars in each constellation
  constellationMap.forEach(groupStars => {
    for (let i = 0; i < groupStars.length - 1; i++) {
      links.push({
        source: groupStars[i].id,
        target: groupStars[i + 1].id,
      });
    }
  });

  // Scale the charge force down for very large graphs to prevent explosions
  const chargeStrength = stars.length > 200 ? -20 : -80;

  // Create the D3 force simulation
  const simulation = forceSimulation(nodes)
    .force('charge', forceManyBody().strength(chargeStrength))
    .force(
      'link',
      forceLink(links)
        .id(d => d.id)
        .distance(20)
        .strength(0.3)
    )
    .force('center', forceCenter(0, 0))
    .force('collide', forceCollide().radius(d => (d.star.size || 1) * 3));

  // Run the simulation for a fixed number of ticks
  for (let i = 0; i < 300; i++) {
    simulation.tick();
  }

  simulation.stop();

  // Map the positioned nodes back to stars
  const positionedStars = nodes.map(node => {
    const posScale = 0.3; // Scale down the positions
    return {
      ...node.star,
      x: node.x * posScale,
      y: node.y * posScale,
      z: (Math.random() - 0.5) * 4, // Add some depth variation ±2
    };
  });

  // DEBUG check for NaNs
  const nanStars = positionedStars.filter(s => isNaN(s.x) || isNaN(s.y));
  if (nanStars.length > 0) {
    console.error('D3 simulation produced NaN for', nanStars.length, 'stars!', nanStars[0]);
  }

  return positionedStars;
}

