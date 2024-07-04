import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ForceGraph2D } from 'react-force-graph';
import { generateSyntheticData } from '../syntheticDataGenerator';
import './Generate.css';

const Generate = () => {
  const location = useLocation();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateData = () => {
      const counts = location.state?.counts || {};
      const stixBundle = generateSyntheticData(counts);
      const processedData = processStixData(stixBundle);
      setGraphData(processedData);
      setLoading(false);
    };

    generateData();
  }, [location.state]);

  const processStixData = (stixBundle) => {
    const nodes = [];
    const links = [];
    const idMap = new Map();

    stixBundle.objects.forEach((obj, index) => {
      idMap.set(obj.id, index);
      nodes.push({
        id: obj.id,
        name: obj.name || obj.value || obj.type,
        type: obj.type,
        color: getColorForType(obj.type),
      });
    });

    stixBundle.objects.forEach(obj => {
      if (obj.type === 'relationship') {
        links.push({
          source: idMap.get(obj.source_ref),
          target: idMap.get(obj.target_ref),
          type: obj.relationship_type,
        });
      }
    });

    return { nodes, links };
  };

  const getColorForType = (type) => {
    const colorMap = {
      'threat-actor': '#ff0000',
      'malware': '#00ff00',
      'indicator': '#0000ff',
      'identity': '#ffff00',
      'tool': '#ff00ff',
      'attack-pattern': '#00ffff',
      'campaign': '#ff8000',
      'course-of-action': '#8000ff',
      'infrastructure': '#008080',
      'intrusion-set': '#800000',
      'location': '#008000',
      'report': '#808000',
      'malware-analysis': '#800080',
      'observed-data': '#c0c0c0',
      'opinion': '#ffa500',
      'relationship': '#808080'
    };
    return colorMap[type] || '#999999';
  };

  if (loading) {
    return <div className="loading">Generating STIX data and visualization...</div>;
  }

  return (
    <div className="generate-visualization">
      <h2>STIX Data Visualization</h2>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = node.color;
          ctx.fillText(label, node.x, node.y);
        }}
      />
    </div>
  );
};

export default Generate;