import React from 'react';
import { useConstellationStore } from '../../store';

export default function ZoomControls() {
  const zoomLevel = useConstellationStore(s => s.zoomLevel);
  const setZoomLevel = useConstellationStore(s => s.setZoomLevel);

  const handleZoomIn = () => {
    setZoomLevel(Math.max(15, zoomLevel - 15));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.min(250, zoomLevel + 15));
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 100
    }}>
      <button 
        onClick={handleZoomIn}
        style={{
          width: '40px',
          height: '40px',
          background: 'rgba(10, 10, 26, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        +
      </button>
      <button 
        onClick={handleZoomOut}
        style={{
          width: '40px',
          height: '40px',
          background: 'rgba(10, 10, 26, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        −
      </button>
    </div>
  );
}
