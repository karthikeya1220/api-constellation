import { useConstellationStore } from '../../store';
import { METHOD_COLORS } from '../../utils/colorMap';
import '../styles/filter-bar.css';

export default function FilterBar() {
  const activeMethodFilters = useConstellationStore(s => s.activeMethodFilters);
  const toggleMethodFilter = useConstellationStore(s => s.toggleMethodFilter);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  return (
    <div className="filter-bar">
      {methods.map(method => (
        <button
          key={method}
          className={`method-filter-btn ${activeMethodFilters.has(method) ? 'active' : ''}`}
          onClick={() => toggleMethodFilter(method)}
          style={{
            '--method-color': METHOD_COLORS[method] || '#ffffff',
          }}
          title={`Toggle ${method} endpoints`}
        >
          <span className="method-dot"></span>
          {method}
        </button>
      ))}
    </div>
  );
}
