import { useState, useCallback, useEffect } from 'react';
import { useConstellationStore } from '../../store';
import '../styles/search-bar.css';

export default function SearchBar() {
  const [input, setInput] = useState('');
  const setSearchQuery = useConstellationStore(s => s.setSearchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(input);
    }, 150);

    return () => clearTimeout(timer);
  }, [input, setSearchQuery]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className="search-bar">
      <input
        id="search-input"
        type="text"
        placeholder="Search endpoints..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="search-input"
      />
      {input && (
        <button
          className="search-clear-btn"
          onClick={handleClear}
          title="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
