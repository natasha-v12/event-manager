import React from 'react';

export default function Sparkline({ values = [], width = 200, height = 48, stroke = '#6366F1' }: { values?: number[]; width?: number; height?: number; stroke?: string }) {
  if (!values || values.length === 0) return <div className="text-sm text-gray-400">No data</div>;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const stepX = width / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => `${i * stepX},${height - (v - min) / (max - min || 1) * height}`).join(' ');

  const areaPath = (() => {
    const pts = values.map((v, i) => `${i * stepX},${height - (v - min) / (max - min || 1) * height}`).join(' L ');
    return `M 0 ${height} L ${pts} L ${width} ${height} Z`;
  })();

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <path d={areaPath} fill="rgba(99,102,241,0.1)" stroke="none" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
