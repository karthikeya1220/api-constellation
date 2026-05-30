import { METHOD_COLORS } from '../../utils/colorMap';
import '../../styles/legend.css';

export default function Legend() {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  return (
    <div className="legend">
      <h3>Methods</h3>
      <div className="legend-items">
        {methods.map(method => (
          <div key={method} className="legend-item">
            <span
              className="legend-dot"
              style={{ backgroundColor: METHOD_COLORS[method] || '#ffffff' }}
            ></span>
            <span className="legend-label">{method}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
