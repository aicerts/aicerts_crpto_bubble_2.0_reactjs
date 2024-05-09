import React, { useState, useEffect, useRef } from 'react';

const BubbleChart = ({ dataSet, width, height }) => {
  const [bubbleData, setBubbleData] = useState(dataSet);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const totalSize = bubbleData.reduce((acc, curr) => acc + curr.size, 0);
    const targetRadius = Math.sqrt((totalSize * width * height) / Math.PI);

    bubbleData.forEach((bubble) => {
      bubble.performance = (bubble.netChange / bubble.price) * 100;
      bubble.radius = calculateRadius(bubble);
    });

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw bubbles
    bubbleData.forEach((bubble) => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
      ctx.fillStyle = bubble.color;
      ctx.fill();
    });
  }, [bubbleData, width, height]);

  const calculateRadius = (bubble) => {
    const t = Math.abs(bubble.performance || 0);
    return Math.min(1000, t);
  };

  return (
    <canvas ref={canvasRef} width={width} height={height}></canvas>
  );
};

export default BubbleChart;
