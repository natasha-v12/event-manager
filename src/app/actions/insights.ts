"use server";

import { createClient } from "../../lib/supabase/server";

export async function getDashboardInsights(opts?: { from?: string; to?: string; days?: number }) {
  const supabase = await createClient();

  const { data: events, error: eErr } = await supabase.from('Event').select('id,start_time,sport_id');
  if (eErr) throw new Error(eErr.message);

  const { data: mappings, error: mErr } = await supabase.from('EventVenue').select('event_id,venue_id');
  if (mErr) throw new Error(mErr.message);

  const { data: sports, error: sErr } = await supabase.from('Sport').select('*').order('name', { ascending: true });
  if (sErr) throw new Error(sErr.message);

  const { data: venues, error: vErr } = await supabase.from('Venue').select('*').order('name', { ascending: true });
  if (vErr) throw new Error(vErr.message);

  const now = new Date();

  // determine date window based on opts (from/to ISO date strings or days)
  let startWindow: Date;
  let endWindow: Date;
  const days = opts?.days ?? 7;
  if (opts?.from && opts?.to) {
    startWindow = new Date(opts.from);
    startWindow.setHours(0,0,0,0);
    endWindow = new Date(opts.to);
    endWindow.setHours(23,59,59,999);
  } else {
    // default: upcoming `days` starting today (today .. today + days - 1)
    startWindow = new Date(now);
    startWindow.setHours(0,0,0,0);
    endWindow = new Date(startWindow);
    endWindow.setDate(startWindow.getDate() + (days - 1));
    endWindow.setHours(23,59,59,999);
  }

  let eventsThisWeek = 0; // represents events in the selected window
  const totalEvents = (events || []).length;

  // recent counts for the selected number of days (today..future)
  const recentCounts: number[] = Array.from({ length: days }, () => 0);

  const sportCounts: Record<string, number> = {};
  (events || []).forEach((ev: any) => {
    if (ev && ev.start_time) {
      const d = new Date(ev.start_time);
      if (d >= startWindow && d <= endWindow) {
        eventsThisWeek++;
        // populate recentCounts: index 0 => startWindow day, up to days-1
        const dayIndex = Math.floor((d.getTime() - startWindow.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < days) recentCounts[dayIndex] = (recentCounts[dayIndex] || 0) + 1;
      }
    }
    const sid = ev?.sport_id ?? null;
    if (sid) {
      const key = String(sid);
      sportCounts[key] = (sportCounts[key] || 0) + 1;
    }
  });

  const sportsBreakdown = Object.entries(sportCounts).map(([id, count]) => {
    const s = (sports || []).find((x: any) => String(x.id) === String(id));
    return { id, name: s?.name ?? String(id), count };
  }).sort((a: any, b: any) => b.count - a.count);

  const venueCounts: Record<string, number> = {};
  (mappings || []).forEach((m: any) => {
    if (m?.venue_id) {
      const key = String(m.venue_id);
      venueCounts[key] = (venueCounts[key] || 0) + 1;
    }
  });

  const topVenues = Object.entries(venueCounts).map(([id, count]) => {
    const v = (venues || []).find((x: any) => String(x.id) === String(id));
    return { id, name: v?.name ?? String(id), count };
  }).sort((a: any, b: any) => b.count - a.count).slice(0, 5);

  return { totalEvents, eventsThisWeek, sportsBreakdown, topVenues, recentCounts };
}
