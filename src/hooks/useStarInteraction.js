import { useEffect, useRef } from 'react';
import { Raycaster, Vector2 } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useConstellationStore } from '../store';

/**
 * Hook for raycasting against the Points geometry to detect hover/click on stars
 */
export function useStarInteraction() {
  const raycasterRef = useRef(new Raycaster());
  const mouseRef = useRef(new Vector2());
  const pointsRef = useRef(null);

  const setHovered = useConstellationStore(s => s.setHovered);
  const setSelected = useConstellationStore(s => s.setSelected);
  const stars = useConstellationStore(s => s.stars);

  const { camera, gl } = useThree();

  // Handle pointer move for hover detection
  const handlePointerMove = (e) => {
    if (!pointsRef.current || stars.length === 0) return;

    // Calculate normalized mouse position
    const rect = gl.domElement.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast
    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const intersects = raycasterRef.current.intersectObject(pointsRef.current);

    // Find closest star within threshold
    const threshold = 2.0;
    let hoveredId = null;

    if (intersects.length > 0) {
      // For Points, we need to check the distance to the closest point
      const point = intersects[0].point;
      const cameraPos = camera.position;

      // Find the closest star to the intersection point
      let minDist = Infinity;
      let closestStar = null;

      stars.forEach(star => {
        const dist = Math.sqrt(
          Math.pow(star.x - point.x, 2) +
          Math.pow(star.y - point.y, 2) +
          Math.pow(star.z - point.z, 2)
        );

        if (dist < minDist) {
          minDist = dist;
          closestStar = star;
        }
      });

      if (closestStar && minDist < threshold) {
        hoveredId = closestStar.id;
      }
    }

    setHovered(hoveredId);

    // Update cursor
    gl.domElement.style.cursor = hoveredId ? 'pointer' : 'default';
  };

  // Handle click for selection
  const handleClick = () => {
    const hoveredStarId = useConstellationStore.getState().hoveredStarId;
    setSelected(hoveredStarId);
  };

  // Attach event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gl.domElement, stars.length]);

  return { pointsRef };
}

