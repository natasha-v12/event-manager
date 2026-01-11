import React from "react";
import { getSportById, getSports } from "@/app/actions/sports";
import { getVenueIdsForEvent } from "@/app/actions/eventVenues";
import { getVenueById, getVenues } from "@/app/actions/venues";
import { GiSoccerBall, GiBasketballBall, GiTennisBall, GiBaseballBat, GiRunningShoe } from "react-icons/gi";
import { FaFutbol, FaFootballBall } from "react-icons/fa";
// created_by column removed — no imports needed
import EditEventDialog from '@/components/EditEventDialog';

export default async function EventRow({ event }: { event: any }) {
  const start = event?.start_time ? new Date(event.start_time) : null;
  const end = event?.end_time ? new Date(event.end_time) : null;

  const formattedDate = start
    ? start.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  const formattedTime = start
    ? start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : '';

  const sportId = event?.sport_id ?? null;
  let sportName: string | null = null;
  let sportObj: any = null;

  if (sportId) {
    try {
      const sport = await getSportById(sportId);
      sportObj = sport ?? null;
      sportName = sport?.name ?? sport?.title ?? null;
    } catch (err) {
      sportName = null;
      sportObj = null;
    }
  }

  const SportIcon = ({ sport }: { sport: string | null }) => {
    const s = (sport ?? "").toString().toLowerCase();

    // choose gradient per sport
    let from = '#e5e7eb';
    let to = '#9ca3af';
    let Icon: any = FaFutbol;

    if (s.includes("soccer") || s.includes("futbol") || s.includes("association")) {
      from = '#16a34a';
      to = '#86efac';
      Icon = GiSoccerBall;
    } else if (s.includes("football")) {
      // treat generic 'football' as American football icon by default
      from = '#7c3aed';
      to = '#a78bfa';
      Icon = FaFootballBall;
    } else if (s.includes("basketball")) {
      from = '#fb923c';
      to = '#f97316';
      Icon = GiBasketballBall;
    } else if (s.includes("tennis") || s.includes("racquet")) {
      from = '#10b981';
      to = '#bbf7d0';
      Icon = GiTennisBall;
    } else if (s.includes("baseball") || s.includes("cricket")) {
      from = '#ef4444';
      to = '#fda4af';
      Icon = GiBaseballBat;
    } else if (s.includes("run") || s.includes("cross") || s.includes("track")) {
      from = '#8b5cf6';
      to = '#a78bfa';
      Icon = GiRunningShoe;
    } else {
      from = '#6b7280';
      to = '#374151';
      Icon = FaFutbol;
    }

    return (
      <span
        className="w-full h-full inline-flex items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(135deg, ${from}, ${to})`,
          boxShadow: '0 6px 12px rgba(0,0,0,0.12), inset 0 -6px 12px rgba(255,255,255,0.06)'
        }}
      >
        <Icon size={18} color="#ffffff" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }} aria-label={sport ?? 'sport'} />
      </span>
    );
  };

  // fetch venue names for a dedicated column
  let venueNames: string[] = [];
  const eventId = event?.id ?? null;
  let eventVenueIds: string[] = [];
  if (eventId) {
    try {
      const venueIds = await getVenueIdsForEvent(eventId);
      if (venueIds && venueIds.length > 0) {
        const venues = await Promise.all(venueIds.map((id: any) => getVenueById(id)));
        venueNames = venues.map((v: any) => v?.name ?? v?.title ?? String(v?.id));
        eventVenueIds = (venueIds || []).map((id: any) => String(id));
      }
    } catch {
      venueNames = [];
      eventVenueIds = [];
    }
  }

  // preload sports list for the edit dialog
  let sportsList: any[] = [];
  try {
    sportsList = (await getSports()) || [];
  } catch {
    sportsList = [];
  }

  // preload all venues for the edit dialog multiselect
  let allVenues: any[] = [];
  try {
    allVenues = (await getVenues()) || [];
  } catch {
    allVenues = [];
  }

  

  // compute duration text from start/end
  let durationText = '-';
  if (start && end && !isNaN(end.getTime()) && end > start) {
    const mins = Math.round((end.getTime() - start.getTime()) / 60000);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    durationText = hrs > 0 ? `${hrs}h${rem > 0 ? ` ${rem}m` : ''}` : `${rem}m`;
  }

  return (
    <div className="grid grid-cols-[120px_2fr_3fr_1.2fr_88px_72px_72px_64px] gap-4 items-center py-3 px-4 bg-transparent">
      <div className="flex items-center gap-3 min-w-0">
        <span className="relative inline-flex items-center gap-3 group min-w-0">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white flex-shrink-0">
            <SportIcon sport={sportName ?? event?.sport_type ?? null} />
          </span>

          <span className="ml-2 hidden md:inline text-sm text-gray-800 truncate max-w-[10rem] md:max-w-[12rem]">{sportName ?? event?.sport_type ?? '-'}</span>

          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-50 md:hidden">
            {sportName ?? event?.sport_type ?? '-'}
          </span>
        </span>
      </div>

      <div className="text-sm font-medium text-gray-900 truncate md:max-w-[28rem]">{event?.name ?? event?.title ?? 'Event'}</div>

      <div className="text-sm text-gray-700 truncate md:max-w-[36rem]">{event?.description ?? '-'}</div>

      <div className="text-sm text-gray-700 truncate md:max-w-[28rem]">{venueNames.length ? venueNames.join(', ') : '-'}</div>

      <div className="text-sm text-gray-800 text-right max-w-[88px]">{formattedDate}</div>

      <div className="text-sm text-gray-800 text-right max-w-[72px]">{formattedTime}</div>

      <div className="text-sm text-gray-800 text-right max-w-[72px]">{durationText}</div>

      

      <div className="text-right">
        <EditEventDialog
          eventId={String(eventId ?? event?.id ?? event?.event_id ?? '')}
          initialData={{ event, sport: sportObj }}
          initialSports={sportsList}
          initialVenues={allVenues}
          initialVenueIds={eventVenueIds}
        />
      </div>
    </div>
  );
}
