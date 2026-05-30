import { useRef, useState } from 'react';
import { useOpenAPIParser } from '../../hooks/useOpenAPIParser';
import './dropzone.css';

export default function DropZone() {
  const { parseAndLoad } = useOpenAPIParser();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleLoadPetstore = async () => {
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

          <div className="button-group">
            <button onClick={handleLoadPetstore} className="btn btn-secondary">
              Load Petstore Sample
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

