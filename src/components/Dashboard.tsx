import React from "react";
import EventsTable from "@/components/EventsTable";
import Filters from '@/components/Filters';
import { getEvents } from "@/app/actions/events";
import { getSports } from '@/app/actions/sports';
import { getVenues } from '@/app/actions/venues';

type Props = { search?: string; sport?: string | string[]; dateStart?: string; dateEnd?: string; venue?: string | string[]; showFilters?: boolean };

export default async function Dashboard({ search, sport, dateStart, dateEnd, venue, showFilters = true }: Props) {
  const searchTerm = search && search.trim().length > 0 ? search.trim() : undefined;

  let sportParam: string | string[] | undefined = undefined;
  if (sport) {
    if (Array.isArray(sport)) sportParam = sport.map((s) => s.toString());
    else if (typeof sport === 'string' && sport.includes(',')) {
      sportParam = sport.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (typeof sport === 'string' && sport.trim().length > 0) {
      sportParam = sport.trim();
    }
  }

  const start = dateStart && dateStart.trim().length > 0 ? dateStart.trim() : undefined;
  const end = dateEnd && dateEnd.trim().length > 0 ? dateEnd.trim() : undefined;

  const events = await getEvents(searchTerm, sportParam, start, end, venue);

  let sports: any[] = [];
  try { sports = (await getSports()) || []; } catch { sports = []; }

  let venues: any[] = [];
  try { venues = (await getVenues()) || []; } catch { venues = []; }

  return (
    <section className="p-4">
      {showFilters ? (
        <Filters search={search} initialSports={sports} selectedSport={sport} initialVenues={venues} selectedVenue={venue} />
      ) : null}
      {search ? <div className="mb-4 text-sm muted">Showing results for "{search}"</div> : null}

      <EventsTable events={events} />
    </section>
  );
}
