import { useRef, useState } from 'react';
import { useOpenAPIParser } from '../../hooks/useOpenAPIParser';
import { useConstellationStore } from '../../store';
import './dropzone.css';

export default function DropZone() {
  const { parseAndLoad } = useOpenAPIParser();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const stars = useConstellationStore(s => s.stars);

  // Hide dropzone if stars are loaded
  const isLoaded = stars.length > 0;

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileInput = async e => {
    const files = e.target.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async file => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await parseAndLoad(json);
    } catch (err) {
      console.error('Error loading file:', err);
      alert(`Error loading file: ${err.message}`);
    }
  };

  const handleLoadPetstore = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch('/sample-specs/petstore.json');
      if (!response.ok) throw new Error('Failed to load petstore');
      const json = await response.json();
      await parseAndLoad(json);
    } catch (err) {
      console.error('Error loading petstore:', err);
      alert(`Error loading petstore: ${err.message}`);
    }
  };

  const handleLoadGithub = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch('/sample-specs/github-api.json');
      if (!response.ok) throw new Error('Failed to load GitHub API spec');
      const json = await response.json();
      await parseAndLoad(json);
    } catch (err) {
      console.error('Error loading GitHub API:', err);
      alert(`Error loading GitHub API: ${err.message}`);
    }
  };

  if (isLoaded) {
    return null;
  }

  return (
    <div className="dropzone-overlay">
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="dropzone-content">
          <h1>API Constellation</h1>
          <p>Drag and drop an OpenAPI/Swagger JSON file here</p>
          <p className="secondary">or click to select a file</p>

          <div className="button-group" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={handleLoadPetstore} className="btn btn-secondary">
              Load Petstore Sample
            </button>
            <button onClick={handleLoadGithub} className="btn btn-secondary">
              Load GitHub Sample
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}


