import { PerspectiveCamera } from '@react-three/drei';
import StarField from './StarField';

export default function Scene() {
  return (
    <>
      <PerspectiveCamera position={[0, 0, 80]} fov={60} makeDefault />
      <StarField />
    </>
  );
}
