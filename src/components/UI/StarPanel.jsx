import { useMemo } from 'react';
import { useConstellationStore } from '../../store';
import '../../styles/panel.css';

export default function StarPanel() {
  const selectedStarId = useConstellationStore(s => s.selectedStarId);
  const setSelected = useConstellationStore(s => s.setSelected);
  const stars = useConstellationStore(s => s.stars);

  const selectedStar = useMemo(() => {
    if (!selectedStarId || !stars) return null;
    return stars.find(s => s.id === selectedStarId);
  }, [selectedStarId, stars]);

  if (!selectedStar) return null;

  // Get method color for badge
  const methodColors = {
    GET: '#E8E8FF',
    POST: '#4A9EFF',
    PUT: '#FF9A3C',
    PATCH: '#FFD93D',
    DELETE: '#FF4D4D',
    HEAD: '#9B9B9B',
    OPTIONS: '#7B68EE',
  };

  const methodColor = methodColors[selectedStar.method] || '#E8E8FF';

  return (
    <div className="star-panel">
      <div className="panel-header">
        <div className="method-badge" style={{ backgroundColor: methodColor }}>
          {selectedStar.method}
        </div>
        <h2>{selectedStar.path}</h2>
        <button className="close-btn" onClick={() => setSelected(null)}>
          ✕
        </button>
      </div>

      <div className="panel-content">
        {selectedStar.summary && (
          <div className="section">
            <h3>Summary</h3>
            <p>{selectedStar.summary}</p>
          </div>
        )}

        {selectedStar.description && (
          <div className="section">
            <h3>Description</h3>
            <p>{selectedStar.description}</p>
          </div>
        )}

        {selectedStar.parameters && selectedStar.parameters.length > 0 && (
          <div className="section">
            <h3>Parameters</h3>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>In</th>
                  <th>Required</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {selectedStar.parameters.map((param, i) => (
                  <tr key={i}>
                    <td>{param.name}</td>
                    <td>{param.in}</td>
                    <td>{param.required ? '✓' : '-'}</td>
                    <td>{param.schema?.type || 'string'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedStar.responses && selectedStar.responses.length > 0 && (
          <div className="section">
            <h3>Responses</h3>
            <div className="responses-list">
              {selectedStar.responses.map((resp, i) => (
                <div key={i} className="response-item">
                  <span
                    className={`status-badge status-${resp.statusCode[0]}`}
                  >
                    {resp.statusCode}
                  </span>
                  <span className="response-desc">{resp.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

