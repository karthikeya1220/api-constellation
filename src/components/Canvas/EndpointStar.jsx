import { useMemo, useRef, useEffect } from 'react';
import { BufferGeometry, Float32BufferAttribute, ShaderMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import starVert from '../../shaders/star.vert?raw';
import starFrag from '../../shaders/star.frag?raw';
import { useConstellationStore, useFilteredStars } from '../../store';
import { useStarInteraction } from '../../hooks/useStarInteraction';

export default function EndpointStar({ stars }) {
  const materialRef = useRef(null);
  const pointsRef = useRef(null);
  const hoveredStarId = useConstellationStore(s => s.hoveredStarId);
  const selectedStarId = useConstellationStore(s => s.selectedStarId);
  const filteredStars = useFilteredStars();

  // Set up raycasting
  const { pointsRef: interactionRef } = useStarInteraction();

  useEffect(() => {
    if (pointsRef.current && interactionRef) {
      interactionRef.current = pointsRef.current;
    }
  }, [interactionRef]);

  // Create geometry from stars
  const { geometry, starIndex } = useMemo(() => {
    if (!stars || stars.length === 0) return { geometry: new BufferGeometry(), starIndex: {} };

    const geo = new BufferGeometry();
    const positions = new Float32Array(stars.length * 3);
    const colors = new Float32Array(stars.length * 3);
    const brightness = new Float32Array(stars.length);
    const sizes = new Float32Array(stars.length);
    const isHovered = new Float32Array(stars.length);
    const isSelected = new Float32Array(stars.length);
    const isFiltered = new Float32Array(stars.length);
    const starIdx = {};

    stars.forEach((star, i) => {
      starIdx[star.id] = i;

      // Position
      positions[i * 3] = star.x;
      positions[i * 3 + 1] = star.y;
      positions[i * 3 + 2] = star.z;

      // Color from colorRgb (already in 0-1 range)
      const [r, g, b] = star.colorRgb || [1, 1, 1];
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;

      // Brightness from frequency
      brightness[i] = star.brightness;

      // Size from frequency
      sizes[i] = star.size;

      // Hover/select flags (updated later)
      isHovered[i] = 0.0;
      isSelected[i] = 0.0;

      // All stars visible by default
      isFiltered[i] = 1.0;
    });

    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new Float32BufferAttribute(colors, 3));
    geo.setAttribute('aBrightness', new Float32BufferAttribute(brightness, 1));
    geo.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aIsHovered', new Float32BufferAttribute(isHovered, 1));
    geo.setAttribute('aIsSelected', new Float32BufferAttribute(isSelected, 1));
    geo.setAttribute('aIsFiltered', new Float32BufferAttribute(isFiltered, 1));

    return { geometry: geo, starIndex: starIdx };
  }, [stars]);

  // Create material once
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

  // Update hover/selection state
  useEffect(() => {
    const hoveredAttr = geometry.attributes.aIsHovered;
    const selectedAttr = geometry.attributes.aIsSelected;

    if (!hoveredAttr || !selectedAttr) return;

    // Reset all
    for (let i = 0; i < hoveredAttr.array.length; i++) {
      hoveredAttr.array[i] = 0.0;
      selectedAttr.array[i] = 0.0;
    }

    // Set hovered
    if (hoveredStarId && starIndex[hoveredStarId] !== undefined) {
      hoveredAttr.array[starIndex[hoveredStarId]] = 1.0;
    }

    // Set selected
    if (selectedStarId && starIndex[selectedStarId] !== undefined) {
      selectedAttr.array[starIndex[selectedStarId]] = 1.0;
    }

    hoveredAttr.needsUpdate = true;
    selectedAttr.needsUpdate = true;
  }, [hoveredStarId, selectedStarId, geometry, starIndex]);

  // Update filter state based on search/method filters
  useEffect(() => {
    const filteredAttr = geometry.attributes.aIsFiltered;
    if (!filteredAttr) return;

    // Create set of filtered star IDs for O(1) lookup
    const filteredStarIds = new Set(filteredStars.map(s => s.id));

    // Update buffer
    stars.forEach((star, i) => {
      filteredAttr.array[i] = filteredStarIds.has(star.id) ? 1.0 : 0.0;
    });

    filteredAttr.needsUpdate = true;
  }, [filteredStars, stars, geometry]);

  // Animate time uniform
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}



