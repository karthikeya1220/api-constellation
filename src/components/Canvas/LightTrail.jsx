import { useMemo, useRef } from 'react';
import { TubeGeometry, QuadraticBezierCurve3, ShaderMaterial, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import trailFrag from '../../shaders/trail.frag?raw';
import { useConstellationStore } from '../../store';

const trailVert = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export default function LightTrail() {
  const stars = useConstellationStore(s => s.stars);
  const meshRefs = useRef([]);

  // Generate trails between related endpoints
  const trails = useMemo(() => {
    if (!stars || stars.length < 2) return [];

    const trailArray = [];
    const METHOD_ORDER = { POST: 1, PUT: 2, PATCH: 3, DELETE: 4, GET: 5, HEAD: 6, OPTIONS: 7 };

    // Group stars by constellation
    const constellationMap = new Map();
    stars.forEach(star => {
      const cid = star.constellationId || 'ungrouped';
      if (!constellationMap.has(cid)) {
        constellationMap.set(cid, []);
      }
      constellationMap.get(cid).push(star);
    });

    // Create trails within each constellation
    constellationMap.forEach((groupStars, groupId) => {
      if (groupStars.length < 2) return;

      // Sort by method (POST→GET flows indicate typical REST patterns)
      const sorted = [...groupStars].sort((a, b) => {
        const orderA = METHOD_ORDER[a.method] || 8;
        const orderB = METHOD_ORDER[b.method] || 8;
        return orderA - orderB;
      });

      // Create trails between consecutive stars
      for (let i = 0; i < sorted.length - 1; i++) {
        const from = sorted[i];
        const to = sorted[i + 1];

        // Skip if same endpoint
        if (from.id === to.id) continue;

        // Create bezier curve through control point
        const start = new Vector3(from.x, from.y, from.z);
        const end = new Vector3(to.x, to.y, to.z);
        const mid = new Vector3(
          (from.x + to.x) / 2,
          (from.y + to.y) / 2,
          (from.z + to.z) / 2 + 5 // Curve above the plane
        );

        const curve = new QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(16);

        // Create tube geometry
        const tubeGeo = new TubeGeometry(curve, 16, 0.3, 4, false);

        // Color based on origin star method
        const colorHex = from.color;
        const r = parseInt(colorHex.slice(1, 3), 16) / 255;
        const g = parseInt(colorHex.slice(3, 5), 16) / 255;
        const b = parseInt(colorHex.slice(5, 7), 16) / 255;

        trailArray.push({
          id: `${from.id}->${to.id}`,
          geometry: tubeGeo,
          color: { r, g, b },
          from,
          to,
        });
      }
    });

    return trailArray;
  }, [stars]);

  // Create material for all trails
  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: trailVert,
      fragmentShader: trailFrag,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Vector3(0.4, 0.7, 1.0) },
        uSpeed: { value: 3.0 },
        uDensity: { value: 3.0 },
      },
      transparent: true,
      depthWrite: false,
      side: 2, // DoubleSide
    });
  }, []);

  // Animate time uniform
  useFrame(({ clock }) => {
    meshRefs.current.forEach(meshRef => {
      if (meshRef && meshRef.material) {
        meshRef.material.uniforms.uTime.value = clock.elapsedTime;
      }
    });
  });

  return (
    <group>
      {trails.map((trail, idx) => (
        <mesh
          key={trail.id}
          geometry={trail.geometry}
          material={material}
          ref={(el) => {
            if (el) meshRefs.current[idx] = el;
          }}
          userData={{ color: trail.color }}
        />
      ))}
    </group>
  );
}

