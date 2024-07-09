import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EntitySelector.css';

const entities = [
  { category: 'Profile & Persona', items: ['Threat Actor', 'Identity'] },
  { category: 'Artifacts', items: ['Malware', 'Tool'] },
  { category: 'Tactics & Operations', items: ['Attack Pattern', 'Campaign', 'Course of Action'] },
  { category: 'Possible Intels', items: ['Indicator', 'Report'] },
  { category: 'Frameworks & Geolocation Data', items: ['Infrastructure', 'Location'] },
  { category: 'Forensics & Countermeasures', items: ['Intrusion Set', 'Malware Analysis', 'Opinion', 'Vulnerability'] },
];

const AnimatedBackground = () => (
  <div className="animated-background">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2e" stopOpacity="1" />
          <stop offset="100%" stopColor="#16213e" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)" />
      <g fill="none" stroke="#4a4a82" strokeWidth="2">
        <path d="M0 50 Q 25 25, 50 50 T 100 50" opacity="0.5">
          <animate attributeName="d" dur="10s" repeatCount="indefinite"
            values="M0 50 Q 25 25, 50 50 T 100 50;
                    M0 50 Q 25 75, 50 50 T 100 50;
                    M0 50 Q 25 25, 50 50 T 100 50" />
        </path>
      </g>
    </svg>
  </div>
);

const EntitySelector = () => {
  const [selectedEntities, setSelectedEntities] = useState({});
  const [counts, setCounts] = useState({});
  const [stixBundle, setStixBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toggleEntity = (entity) => {
    setSelectedEntities(prev => ({
      ...prev,
      [entity]: !prev[entity]
    }));
  };

  const updateCount = (entity, value) => {
    setCounts(prev => ({
      ...prev,
      [entity]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const generateGraph = async () => {
    setLoading(true);
    setError(null);
    setStixBundle(null);

    const selectedCounts = Object.entries(selectedEntities)
      .filter(([, selected]) => selected)
      .reduce((acc, [entity]) => {
        acc[entity.toLowerCase().replace(' ', '-')] = counts[entity] || 0;
        return acc;
      }, {});

    const formData = new FormData();
    Object.entries(selectedCounts).forEach(([key, value]) => {
      formData.append(key + '-count', value);
    });

    try {
      const response = await axios.post('http://127.0.0.1:5000/generate-graph', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStixBundle(JSON.parse(response.data.stix_bundle));
    } catch (err) {
      setError('An error occurred while generating the graph. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(stixBundle, null, 2));
    alert('JSON copied to clipboard!');
  };

  const openStixVisualizer = () => {
    const visualizerUrl = 'https://oasis-open.github.io/cti-stix-visualization/';
    const encodedJson = encodeURIComponent(JSON.stringify(stixBundle));
    window.open(`${visualizerUrl}?data=${encodedJson}`, '_blank');
  };

  return (
    <div className="entity-selector-container">
      <AnimatedBackground />
      <div className="entity-selector">
        <h2>Select Synthetica STIX Entities</h2>
        <div className="entity-groups">
          {entities.map(group => (
            <div key={group.category} className="entity-group">
              <h3>{group.category}</h3>
              <div className="entity-chips">
                {group.items.map(entity => (
                  <button
                    key={entity}
                    className={`entity-chip ${selectedEntities[entity] ? 'selected' : ''}`}
                    onClick={() => toggleEntity(entity)}
                  >
                    {entity}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="selected-entities">
          <h3>Selected Entities</h3>
          <div className="entity-counts">
            {Object.entries(selectedEntities).filter(([, selected]) => selected).map(([entity]) => (
              <div key={entity} className="entity-count">
                <label htmlFor={`count-${entity}`}>{entity}</label>
                <input
                  type="number"
                  id={`count-${entity}`}
                  min="0"
                  value={counts[entity] || ''}
                  onChange={(e) => updateCount(entity, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="actions">
          <button className="generate-btn" onClick={generateGraph} disabled={loading}>
            {loading ? 'GENERATING...' : 'GENERATE GRAPH'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        {stixBundle && (
          <div className="stix-bundle">
            <h3>Generated STIX Bundle</h3>
            <pre>{JSON.stringify(stixBundle, null, 2)}</pre>
            <div className="bundle-actions">
              <button className="action-btn" onClick={copyJson}>Copy JSON</button>
              <button className="action-btn" onClick={openStixVisualizer}>Open STIX Visualizer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntitySelector;