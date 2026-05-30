import { useMemo } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import StarField from './StarField';
import EndpointStar from './EndpointStar';
import { useConstellationStore } from '../../store';
import { useStarLayout } from '../../hooks/useStarLayout';

export default function Scene() {
  const stars = useConstellationStore(s => s.stars);
  
  // Compute layout once when stars change
  const layoutStars = useMemo(() => {
    if (stars.length === 0) return [];
    return useStarLayout(stars);
  }, [stars]);

  return (
    <>
      <PerspectiveCamera position={[0, 0, 80]} fov={60} makeDefault />
      <StarField />
      {layoutStars.length > 0 && <EndpointStar stars={layoutStars} />}
    </>
  );
}

