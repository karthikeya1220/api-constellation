import { useMemo, useEffect, useState } from 'react';
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, AdditiveBlending } from 'three';
import { Text } from '@react-three/drei';
import { useConstellationStore, useFilteredStars } from '../../store';

export default function Constellation({ stars }) {
  const constellations = useConstellationStore(s => s.constellations);
  const filteredStars = useFilteredStars();

  // Create set of filtered star IDs for O(1) lookup
  const filteredStarIds = useMemo(() => {
    return new Set(filteredStars.map(s => s.id));
  }, [filteredStars]);

  // Create line geometries and materials ONCE when data changes
  const constellationGeometries = useMemo(() => {
    if (!constellations || constellations.length === 0) return [];

    return constellations.map(group => {
      // Get stars in this constellation in order
      const groupStars = group.starIds
        .map(id => stars.find(s => s.id === id))
        .filter(s => s !== undefined);

      if (groupStars.length < 2) return null;

      // Create line segments to form realistic constellations
      // Instead of sequential order, connect each star to its 2 nearest neighbors
      const edges = new Set();
      const segments = [];

      groupStars.forEach(starA => {
        // Find nearest neighbors
        const neighbors = groupStars
          .filter(starB => starB.id !== starA.id)
          .map(starB => {
            const dist = Math.pow(starA.x - starB.x, 2) + 
                         Math.pow(starA.y - starB.y, 2) + 
                         Math.pow(starA.z - starB.z, 2);
            return { starB, dist };
          })
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 2); // Connect to up to 2 nearest stars

        neighbors.forEach(({ starB }) => {
          const edgeKey = starA.id < starB.id ? `${starA.id}-${starB.id}` : `${starB.id}-${starA.id}`;
          if (!edges.has(edgeKey)) {
            edges.add(edgeKey);
            segments.push(starA, starB);
          }
        });
      });

      const positions = new Float32Array(segments.length * 3);
      segments.forEach((star, i) => {
        positions[i * 3] = star.x;
        positions[i * 3 + 1] = star.y;
        positions[i * 3 + 2] = star.z;
      });

      const geo = new BufferGeometry();
      geo.setAttribute('position', new Float32BufferAttribute(positions, 3));

      // Parse hex color to RGB
      const colorHex = group.color;
      const r = parseInt(colorHex.slice(1, 3), 16) / 255;
      const g = parseInt(colorHex.slice(3, 5), 16) / 255;
      const b = parseInt(colorHex.slice(5, 7), 16) / 255;

      const material = new LineBasicMaterial({
        color: (r << 16) | (g << 8) | b,
        linewidth: 1,
        transparent: true,
        opacity: 0.15, // Faint glow
        depthWrite: false,
        blending: AdditiveBlending, // Makes overlapping lines glow like stars
      });

      return {
        id: group.id,
        geometry: geo,
        material,
        centroid: group.centroid,
        label: group.label,
        color: group.color,
        groupStars,
      };
    }).filter(Boolean);
  }, [constellations, stars]);

  // Compute visibility map for text and material opacity
  const visibleMap = useMemo(() => {
    const map = {};
    constellationGeometries.forEach(line => {
      map[line.id] = line.groupStars.some(star => filteredStarIds.has(star.id));
    });
    return map;
  }, [constellationGeometries, filteredStarIds]);

  // Update material opacity directly to avoid re-rendering meshes when not needed
  useEffect(() => {
    constellationGeometries.forEach(line => {
      line.material.opacity = visibleMap[line.id] ? 0.15 : 0.02;
      line.material.needsUpdate = true;
    });
  }, [constellationGeometries, visibleMap]);

  return (
    <group>
      {/* Constellation lines */}
      {constellationGeometries.map(line => (
        <lineSegments
          key={`lines-${line.id}`}
          geometry={line.geometry}
          material={line.material}
        />
      ))}

      {/* Constellation labels */}
      {constellationGeometries.map(line => (
        <Text
          key={`label-${line.id}`}
          position={[line.centroid.x, line.centroid.y, line.centroid.z]}
          fontSize={1.5}
          color={line.color}
          anchorX="center"
          anchorY="middle"
          maxWidth={20}
          opacity={visibleMap[line.id] ? 0.5 : 0.1}
        >
          {line.label}
        </Text>
      ))}
    </group>
  );
}

