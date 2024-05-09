"use client"
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function CryptoVisualization({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = svg.attr('width');
    const height = svg.attr('height');

    // 1. Create a D3 force simulation
    const simulation = d3
      .forceSimulation(data)
      .force('charge', d3.forceManyBody().strength(-50)) // Repulsive force between circles
      .force('center', d3.forceCenter(width / 2, height / 2)) // Center the circles
      .force('collision', d3.forceCollide().radius(d => d.radius)); // Prevent circle overlap

    // 2. Define scales for circle size and color
    const radiusScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.marketCap)) // Market cap range
      .range([10, 50]); // Circle radius range

    const colorScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.priceChangePercent)) // Percentage change range
      .range(['red', 'green']); // Color range

    // 3. Create circles
    const circles = svg
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('r', d => radiusScale(d.marketCap))
      .attr('fill', d => colorScale(d.priceChangePercent));

    // 4. Update circle positions based on simulation
    simulation.on('tick', () => {
      circles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    // 5. (Optional) Add labels or tooltips
    // ...

  }, [data]);

  return <svg ref={svgRef} width="800" height="600" />;
}

export default CryptoVisualization;
