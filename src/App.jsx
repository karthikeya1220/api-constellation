import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';
import Scene from './components/Canvas/Scene';
import DropZone from './components/UI/DropZone';
import StarPanel from './components/UI/StarPanel';
import SearchBar from './components/UI/SearchBar';
import FilterBar from './components/Controls/FilterBar';
import LoadingNebula from './components/UI/LoadingNebula';
import Legend from './components/UI/Legend';
import ZoomControls from './components/Controls/ZoomControls';
import { useConstellationStore } from './store';
import { handlePointerDown, handlePointerMove, handlePointerUp, handleWheel, resetCamera } from './hooks/useCamera';
import './styles/global.css';

export default function App() {
  const setSelected = useConstellationStore(s => s.setSelected);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape: close panel
      if (e.key === 'Escape') {
        setSelected(null);
      }

      // /: focus search
      if (e.key === '/' && e.target === document.body) {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // R: reset camera
      if (e.key === 'r' || e.key === 'R') {
        if (e.target === document.body) {
          resetCamera();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelected]);

  return (
    <>
      <Canvas
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <color attach="background" args={[0, 0, 0]} />
        <Scene />
      </Canvas>
      <DropZone />
      <SearchBar />
      <FilterBar />
      <StarPanel />
      <LoadingNebula />
      <Legend />
      <ZoomControls />
    </>
  );
}
