'use client';
import React, { useState } from 'react';
import PieChart from './PieChart';
import Sparkline from './Sparkline';

type Props = { initialInsights: any; horizontal?: boolean };

export default function InsightsPanel({ initialInsights, horizontal = false }: Props) {
  const [insights] = useState<any>(initialInsights);

  const containerClass = horizontal ? 'flex flex-row gap-3 mb-3' : 'flex flex-col gap-3 mb-4';
  const cardBase = horizontal ? 'card flex-1 py-2 px-3' : 'card w-full py-3 px-3';
  const smallCardBase = horizontal ? 'card flex-1 py-1 px-2' : 'card w-full py-2 px-3';
  const sparkW = horizontal ? 240 : 180;
  const sparkH = horizontal ? 48 : 36;
  const pieSize = horizontal ? 92 : 72;

  return (
    <div>
      <div className={containerClass}>
        <div className={cardBase}>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-xs muted">Upcoming Events</div>
              <div className="mt-1 text-lg font-semibold">{insights.totalEvents}</div>
              <div className="mt-1 text-xs muted">{insights.eventsThisWeek ?? insights.eventsThisWindow} this week</div>
              <div className="mt-2"><Sparkline values={insights.recentCounts || []} width={sparkW} height={sparkH} /></div>
            </div>
          </div>
        </div>

        <div className={smallCardBase}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs muted">Sports</div>
              <div className="text-xs muted">Top {Math.min(5, (insights.sportsBreakdown||[]).length)}</div>
            </div>
            <div className="ml-3"><PieChart segments={(insights.sportsBreakdown||[]).slice(0,5).map((s:any)=>({ label: s.name, value: s.count }))} size={pieSize} /></div>
          </div>
        </div>

        <div className={smallCardBase}>
          <div className="text-xs muted">Top Venues</div>
          <div className="mt-2 space-y-2">
            {(insights.topVenues||[]).slice(0,3).map((v:any)=> (
              <div key={v.id} className="flex items-center justify-between">
                <div className="text-sm truncate">{v.name}</div>
                <div className="text-sm font-medium">{v.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
