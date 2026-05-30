import { useMemo, useRef } from 'react';
import { BufferGeometry, Float32BufferAttribute, ShaderMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import starVert from '../../shaders/star.vert?raw';
import starFrag from '../../shaders/star.frag?raw';

const STARFIELD_COUNT = 2000;
const STARFIELD_RADIUS = 300;

export default function StarField() {
  const materialRef = useRef(null);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();

    // Generate random star positions in a flat sphere (z constrained)
    const positions = new Float32Array(STARFIELD_COUNT * 3);
    const colors = new Float32Array(STARFIELD_COUNT * 3);
    const brightness = new Float32Array(STARFIELD_COUNT);
    const sizes = new Float32Array(STARFIELD_COUNT);
    const isHovered = new Float32Array(STARFIELD_COUNT);
    const isSelected = new Float32Array(STARFIELD_COUNT);
    const isFiltered = new Float32Array(STARFIELD_COUNT);

    for (let i = 0; i < STARFIELD_COUNT; i++) {
      // Random position in sphere, but flatten Z
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * STARFIELD_RADIUS;
      positions[i * 3] = Math.cos(angle) * distance;
      positions[i * 3 + 1] = Math.sin(angle) * distance;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // Constrain Z to ±20

      // Near-white with subtle random tints (yellow, blue, pink)
      const tint = Math.random();
      if (tint < 0.33) {
        // Yellowish
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.95 + Math.random() * 0.05;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.1;
      } else if (tint < 0.66) {
        // Blueish
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.92 + Math.random() * 0.08;
        colors[i * 3 + 2] = 1.0;
      } else {
        // Pinkish
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.92 + Math.random() * 0.08;
      }

      // Low brightness for atmosphere
      brightness[i] = 0.05 + Math.random() * 0.35;

      // Variable sizes
      sizes[i] = 0.3 + Math.random() * 0.9;

      // Background stars: never hovered/selected, always visible
      isHovered[i] = 0.0;
      isSelected[i] = 0.0;
      isFiltered[i] = 1.0;
    }

    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new Float32BufferAttribute(colors, 3));
    geo.setAttribute('aBrightness', new Float32BufferAttribute(brightness, 1));
    geo.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aIsHovered', new Float32BufferAttribute(isHovered, 1));
    geo.setAttribute('aIsSelected', new Float32BufferAttribute(isSelected, 1));
    geo.setAttribute('aIsFiltered', new Float32BufferAttribute(isFiltered, 1));

    return geo;
  }, []);

  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: starVert,
      fragmentShader: starFrag,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: window.devicePixelRatio },
      },
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  // Subtle slow rotation of the background field
  const groupRef = useRef(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = clock.elapsedTime * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} ref={materialRef} />
    </group>
  );
}
