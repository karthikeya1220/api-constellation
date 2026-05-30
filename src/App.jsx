import { Canvas } from '@react-three/fiber';
import './styles/global.css';

export default function App() {
  return (
    <Canvas>
      <color attach="background" args={[0, 0, 0]} />
    </Canvas>
  );
}
