import { Canvas } from '@react-three/fiber';
import Scene from './components/Canvas/Scene';
import DropZone from './components/UI/DropZone';
import './styles/global.css';

export default function App() {
  return (
    <>
      <Canvas>
        <color attach="background" args={[0, 0, 0]} />
        <Scene />
      </Canvas>
      <DropZone />
    </>
  );
}
