import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EntitySelector.css';

const entities = [
  { category: 'Actors', items: ['Threat Actor', 'Identity'] },
  { category: 'Artifacts', items: ['Malware', 'Tool'] },
  { category: 'Behaviors', items: ['Attack Pattern', 'Campaign', 'Course of Action'] },
  { category: 'Intel', items: ['Indicator', 'Observed Data', 'Report'] },
  { category: 'Infrastructure', items: ['Infrastructure', 'Location'] },
  { category: 'Analysis', items: ['Intrusion Set', 'Malware Analysis', 'Opinion'] },
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

  const generateGraph = () => {
    const selectedCounts = Object.entries(selectedEntities)
      .filter(([, selected]) => selected)
      .reduce((acc, [entity]) => {
        acc[entity] = counts[entity] || 0;
        return acc;
      }, {});
    
    navigate('/generate', { state: { counts: selectedCounts } });
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
          <button className="generate-btn" onClick={generateGraph}>GENERATE GRAPH</button>
        </div>
      </div>
    </div>
  );
};

export default EntitySelector;