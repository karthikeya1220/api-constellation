import { useMemo, useState, useCallback } from 'react';
import { useConstellationStore } from '../../store';
import '../../styles/panel.css';

export default function StarPanel() {
  const selectedStarId = useConstellationStore(s => s.selectedStarId);
  const setSelected = useConstellationStore(s => s.setSelected);
  const baseUrl = useConstellationStore(s => s.baseUrl);
  const stars = useConstellationStore(s => s.stars);
  
  const [activeTab, setActiveTab] = useState('details');
  const [testParams, setTestParams] = useState({});
  const [testResponse, setTestResponse] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const selectedStar = useMemo(() => {
    if (!selectedStarId || !stars) return null;
    return stars.find(s => s.id === selectedStarId);
  }, [selectedStarId, stars]);

  const methodColors = {
    GET: '#E8E8FF',
    POST: '#4A9EFF',
    PUT: '#FF9A3C',
    PATCH: '#FFD93D',
    DELETE: '#FF4D4D',
    HEAD: '#9B9B9B',
    OPTIONS: '#7B68EE',
  };

  const methodColor = methodColors[selectedStar?.method] || '#E8E8FF';

  // Build request URL with path parameters
  const buildUrl = useCallback(() => {
    let url = selectedStar.path;
    
    // Replace path parameters
    selectedStar.parameters?.forEach(param => {
      if (param.in === 'path' && testParams[param.name]) {
        url = url.replace(`{${param.name}}`, testParams[param.name]);
      }
    });

    // Add query parameters
    const queryParams = selectedStar.parameters
      ?.filter(p => p.in === 'query' && testParams[p.name])
      .map(p => `${p.name}=${encodeURIComponent(testParams[p.name])}`)
      .join('&');

    if (queryParams) {
      url += '?' + queryParams;
    }

    return url;
  }, [selectedStar, testParams]);

  // Make API request
  const handleTestRequest = useCallback(async () => {
    if (!selectedStar) return;

    setTestLoading(true);
    setTestResponse(null);

    try {
      const url = baseUrl ? baseUrl + buildUrl() : buildUrl();
      const startTime = performance.now();

      const options = {
        method: selectedStar.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Add request body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(selectedStar.method) && testParams.body) {
        try {
          options.body = JSON.stringify(JSON.parse(testParams.body));
        } catch {
          options.body = testParams.body;
        }
      }

      const response = await fetch(url, options);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      let responseBody = '';
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseBody = JSON.stringify(await response.json(), null, 2);
      } else {
        responseBody = await response.text();
      }

      setTestResponse({
        status: response.status,
        statusText: response.statusText,
        time: responseTime,
        body: responseBody,
        success: response.ok,
      });
    } catch (error) {
      setTestResponse({
        status: 'ERROR',
        statusText: error.message,
        time: 0,
        body: error.toString(),
        success: false,
      });
    } finally {
      setTestLoading(false);
    }
  }, [selectedStar, baseUrl, buildUrl]);

  // Copy as curl
  const handleCopyCurl = useCallback(() => {
    const url = baseUrl ? baseUrl + buildUrl() : buildUrl();
    let curl = `curl -X ${selectedStar.method} "${url}"`;

    if (['POST', 'PUT', 'PATCH'].includes(selectedStar.method) && testParams.body) {
      curl += ` \\
  -H "Content-Type: application/json" \\
  -d '${testParams.body}'`;
    }

    navigator.clipboard.writeText(curl);
    alert('cURL copied to clipboard!');
  }, [selectedStar, baseUrl, buildUrl, testParams.body]);

  if (!selectedStar) return null;

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

      {/* Tab navigation */}
      <div className="panel-tabs">
        <button
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`tab-btn ${activeTab === 'try' ? 'active' : ''}`}
          onClick={() => setActiveTab('try')}
        >
          Try It
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'details' && (
          <>
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
          </>
        )}

        {activeTab === 'try' && (
          <div className="try-it-section">
            {!baseUrl && (
              <div className="cors-warning">
                ⚠️ <strong>No base URL configured.</strong> Most APIs block browser requests.
                Try a local API or use a CORS proxy.
              </div>
            )}

            {/* Parameter inputs */}
            {selectedStar.parameters && selectedStar.parameters.length > 0 && (
              <div className="section">
                <h3>Parameters</h3>
                {selectedStar.parameters.map((param) => (
                  <div key={param.name} className="param-input-group">
                    <label>
                      {param.name}
                      {param.required && <span className="required">*</span>}
                    </label>
                    <input
                      type="text"
                      placeholder={`${param.in} parameter`}
                      value={testParams[param.name] || ''}
                      onChange={(e) =>
                        setTestParams(prev => ({
                          ...prev,
                          [param.name]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Request body */}
            {['POST', 'PUT', 'PATCH'].includes(selectedStar.method) && (
              <div className="section">
                <h3>Request Body</h3>
                <textarea
                  className="body-textarea"
                  placeholder="Enter JSON request body..."
                  value={testParams.body || ''}
                  onChange={(e) =>
                    setTestParams(prev => ({
                      ...prev,
                      body: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="action-buttons">
              <button
                className="send-btn"
                onClick={handleTestRequest}
                disabled={testLoading}
              >
                {testLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                className="curl-btn"
                onClick={handleCopyCurl}
                disabled={testLoading}
              >
                Copy as cURL
              </button>
            </div>

            {/* Response */}
            {testResponse && (
              <div className="section response-section">
                <h3>
                  Response
                  <span className={`response-status ${testResponse.success ? 'success' : 'error'}`}>
                    {testResponse.status} {testResponse.statusText}
                  </span>
                  <span className="response-time">
                    {testResponse.time}ms
                  </span>
                </h3>
                <pre className="response-body">{testResponse.body}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

