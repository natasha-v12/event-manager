 'use client';
import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import Input from './ui/input';
import { Button } from './ui/button';
import { DatePicker } from './ui/date-picker';
import { format } from 'date-fns';

type Props = {
  search?: string;
  initialSports?: any[];
  selectedSport?: string | number | string[];
  initialVenues?: any[];
  selectedVenue?: string | number | string[];
};

export default function Filters({ search, initialSports = [], selectedSport, initialVenues = [], selectedVenue }: Props) {
  const [sportQuery, setSportQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const initialSelected = React.useMemo(() => {
    const vals = Array.isArray(selectedSport) ? selectedSport.map((s) => String(s)) : selectedSport ? [String(selectedSport)] : [];
    return initialSports.filter((s: any) => vals.includes(String(s.id))).map((s: any) => ({ id: String(s.id), name: s.name }));
  }, [initialSports, selectedSport]);

  const [selected, setSelected] = React.useState<{ id: string; name: string }[]>(initialSelected);

  const venueInitialSelected = React.useMemo(() => {
    const vals = Array.isArray(selectedVenue) ? selectedVenue.map((s) => String(s)) : selectedVenue ? [String(selectedVenue)] : [];
    return initialVenues.filter((v: any) => vals.includes(String(v.id))).map((v: any) => ({ id: String(v.id), name: v.name }));
  }, [initialVenues, selectedVenue]);

  const [selectedVenues, setSelectedVenues] = React.useState<{ id: string; name: string }[]>(venueInitialSelected);
  const [venueQuery, setVenueQuery] = React.useState('');

  const [startDate, setStartDate] = React.useState<Date | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    const s = new URLSearchParams(window.location.search).get('start');
    return s ? new Date(s) : undefined;
  });

  const [endDate, setEndDate] = React.useState<Date | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    const s = new URLSearchParams(window.location.search).get('end');
    return s ? new Date(s) : undefined;
  });

  React.useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  React.useEffect(() => {
    setSelectedVenues(venueInitialSelected);
  }, [venueInitialSelected]);

  const suggestions = React.useMemo(() => {
    const q = sportQuery.trim().toLowerCase();
    return initialSports
      .filter((s: any) => !selected.find((sel) => String(sel.id) === String(s.id)))
      .filter((s: any) => (q.length === 0 ? true : s.name.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [initialSports, sportQuery, selected]);

  const venueSuggestions = React.useMemo(() => {
    const q = venueQuery.trim().toLowerCase();
    return initialVenues
      .filter((v: any) => !selectedVenues.find((sel) => String(sel.id) === String(v.id)))
      .filter((v: any) => (q.length === 0 ? true : v.name.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [initialVenues, venueQuery, selectedVenues]);

  const addSport = (s: any) => {
    setSelected((cur) => [...cur, { id: String(s.id), name: s.name }]);
    setSportQuery('');
    setOpen(false);
  };

  const removeSport = (id: string) => setSelected((cur) => cur.filter((c) => c.id !== id));

  const addVenue = (v: any) => {
    setSelectedVenues((cur) => [...cur, { id: String(v.id), name: v.name }]);
    setVenueQuery('');
  };

  return (
    <div className="mb-0">
      <div className="w-full">
        <form action="/" method="get" className="flex flex-wrap items-center gap-3 w-full">
          <div className="flex-1 min-w-0">
            <label htmlFor="q" className="text-xs text-muted block mb-1">Search events</label>
            <Input id="q" name="q" defaultValue={search ?? ''} placeholder="Find events by name..." className="w-full bg-transparent border-none text-white placeholder-neutral-400 focus:ring-0" />
          </div>

          <div className="relative w-40">
            <label htmlFor="start" className="text-xs text-muted block mb-1">Start date</label>
            <div>
              <DatePicker value={startDate} onChange={setStartDate} />
              <input type="hidden" name="start" value={startDate ? format(startDate, 'yyyy-MM-dd') : ''} />
            </div>
            <button type="button" onClick={() => { setStartDate(undefined); }} className="absolute right-1 top-1/2 transform -translate-y-1/2 text-sm px-1 py-1 rounded"><FiX /></button>
          </div>

          <div className="relative w-40">
            <label htmlFor="end" className="text-xs text-muted block mb-1">End date</label>
            <div>
              <DatePicker value={endDate} onChange={setEndDate} />
              <input type="hidden" name="end" value={endDate ? format(endDate, 'yyyy-MM-dd') : ''} />
            </div>
            <button type="button" onClick={() => { setEndDate(undefined); }} className="absolute right-1 top-1/2 transform -translate-y-1/2 text-sm px-1 py-1 rounded"><FiX /></button>
          </div>

          <div className="relative w-64">
            <label htmlFor="sport-search" className="text-xs text-muted block mb-1">Sports</label>
            <div className="flex items-center gap-2 p-1 rounded-md bg-[var(--card)] overflow-x-auto whitespace-nowrap">
              {selected.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-2 bg-[var(--background)] text-sm px-2 py-1 rounded-full mr-2">
                  <span className="truncate max-w-[9rem]">{s.name}</span>
                  <button type="button" onClick={() => removeSport(s.id)} className="text-sm" aria-label={`Remove ${s.name}`}>
                    <FiX />
                  </button>
                </span>
              ))}

              <Input
                id="sport-search"
                name="_sport_search"
                value={sportQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSportQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder={selected.length === 0 ? 'Filter sports...' : ''}
                className="flex-shrink-0 min-w-[8rem] bg-transparent border-none focus:ring-0 text-white placeholder-neutral-400"
              />
            </div>

            {open && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-[var(--card)] border rounded-md shadow-lg z-50 max-h-56 overflow-auto">
                {suggestions.map((s: any) => (
                  <div key={s.id} onMouseDown={(e: React.MouseEvent) => e.preventDefault()} onClick={() => addSport(s)} className="px-3 py-2 hover:bg-neutral-700 dark:hover:bg-neutral-600 hover:text-white cursor-pointer">
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-64">
            <label htmlFor="venue-search" className="text-xs text-muted block mb-1">Venues</label>
            <div className="flex items-center gap-2 p-1 rounded-md bg-[var(--card)] overflow-x-auto whitespace-nowrap">
              {selectedVenues.map((v) => (
                <span key={v.id} className="inline-flex items-center gap-2 bg-[var(--background)] text-sm px-2 py-1 rounded-full mr-2">
                  <span className="truncate max-w-[9rem]">{v.name}</span>
                  <button type="button" onClick={() => setSelectedVenues((cur) => cur.filter((c) => c.id !== v.id))} className="text-sm" aria-label={`Remove ${v.name}`}>
                    <FiX />
                  </button>
                </span>
              ))}

              <Input
                id="venue-search"
                name="_venue_search"
                value={venueQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setVenueQuery(e.target.value); }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const q = venueQuery.trim().toLowerCase();
                    if (!q) return;
                    const match = (initialVenues || []).find((x: any) => x.name.toLowerCase().includes(q));
                    if (match) {
                      const vid = String(match.id);
                      if (!selectedVenues.find((x) => x.id === vid)) setSelectedVenues((cur) => [...cur, { id: vid, name: match.name }]);
                      setVenueQuery('');
                    }
                  }
                }}
                placeholder={selectedVenues.length === 0 ? 'Filter venues...' : ''}
                className="flex-shrink-0 min-w-[8rem] bg-transparent border-none focus:ring-0 text-white placeholder-neutral-400"
              />
            </div>

            {venueSuggestions.length > 0 && venueQuery && (
              <div className="absolute left-0 right-0 mt-1 bg-[var(--card)] border rounded-md shadow-lg z-50 max-h-56 overflow-auto">
                {venueSuggestions.map((v: any) => (
                  <div key={v.id} onMouseDown={(e: React.MouseEvent) => e.preventDefault()} onClick={() => addVenue(v)} className="px-3 py-2 hover:bg-neutral-700 dark:hover:bg-neutral-600 hover:text-white cursor-pointer">
                    {v.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" variant="default" size="lg" className="px-3 flex items-center gap-2" aria-label="Search events">
            <FiSearch />
            <span>Search</span>
          </Button>
          <Button asChild variant="ghost" size="lg" className="ml-2">
            <a href="/" className="flex items-center text-sm text-muted gap-1">Clear <FiX /></a>
          </Button>

          {/* Hidden inputs for selected sports so GET includes them as repeated params */}
          {selected.map((s) => (
            <input key={`sport-${s.id}`} type="hidden" name="sport" value={s.id} />
          ))}
          {/* Hidden inputs for selected venues so GET includes them as repeated params */}
          {selectedVenues.map((v) => (
            <input key={`venue-${v.id}`} type="hidden" name="venue" value={v.id} />
          ))}
        </form>
      </div>
    </div>
  );
}
