"use client";
import React, { useMemo, useState } from 'react';

type Segment = { label: string; value: number; color?: string };

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(angleInRadians)),
    y: cy + (r * Math.sin(angleInRadians)),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', cx, cy, 'L', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y, 'Z'].join(' ');
}

const DEFAULT_COLORS = ['#6366F1','#06B6D4','#34D399','#F59E0B','#F97316'];

export default function PieChart({ segments, size = 160, showLegend = true }: { segments: Segment[]; size?: number; showLegend?: boolean }) {
  const total = useMemo(() => Math.max(1, segments.reduce((s, v) => s + Math.max(0, v.value), 0)), [segments]);
  const [hovered, setHovered] = useState<number | null>(null);
  let angleStart = 0;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  return (
    <div className="flex items-start gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, idx) => {
          const angle = (seg.value / total) * 360;
          const path = describeArc(cx, cy, r, angleStart, angleStart + angle);
          angleStart += angle;
          const color = seg.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
          return (
            <path
              key={idx}
              d={path}
              fill={color}
              stroke="transparent"
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>

      {showLegend && (
        <div className="flex flex-col gap-1">
          {segments.map((seg, i) => {
            const color = seg.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            const percent = Math.round((seg.value / total) * 100);
            const isHovered = hovered === i;
            return (
              <div key={i} className={`flex items-center gap-2 text-sm px-1 rounded ${isHovered ? 'bg-gray-50' : ''}`}>
                <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                <div className="text-gray-700 truncate max-w-xs">{seg.label}</div>
                <div className="text-xs text-gray-500">{seg.value} ({percent}%)</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
