import { useMemo } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import StarField from './StarField';
import EndpointStar from './EndpointStar';
import Constellation from './Constellation';
import LightTrail from './LightTrail';
import { useConstellationStore } from '../../store';
import { useStarLayout } from '../../hooks/useStarLayout';
import { useCamera } from '../../hooks/useCamera';

export default function Scene() {
  const stars = useConstellationStore(s => s.stars);
  const constellations = useConstellationStore(s => s.constellations);
  
  useCamera();

  // Compute layout once when stars change
  const layoutStars = useMemo(() => {
    if (stars.length === 0) return [];
    const positioned = useStarLayout(stars);
    
    // Update constellation centroids based on new positions
    if (constellations.length > 0) {
      constellations.forEach(group => {
        const groupStars = positioned.filter(s => group.starIds.includes(s.id));
        if (groupStars.length > 0) {
          group.centroid = {
            x: groupStars.reduce((sum, s) => sum + s.x, 0) / groupStars.length,
            y: groupStars.reduce((sum, s) => sum + s.y, 0) / groupStars.length,
            z: groupStars.reduce((sum, s) => sum + s.z, 0) / groupStars.length,
          };
        }
      });
    }
    
    return positioned;
  }, [stars, constellations]);

  return (
    <>
      <PerspectiveCamera position={[0, 0, 80]} fov={60} makeDefault />
      <StarField />
      {layoutStars.length > 0 && <LightTrail />}
      {layoutStars.length > 0 && <EndpointStar stars={layoutStars} />}
      {constellations.length > 0 && <Constellation />}
    </>
  );
}



