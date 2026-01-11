import React from "react";
import EventRow from "@/components/EventRow";
import AddEventButton from '@/components/AddEventButton';
import { getSports } from '@/app/actions/sports';
import { getVenues } from '@/app/actions/venues';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import TablePagination from '@/components/TablePagination';

export default async function EventsTable({ events }: { events: any[] }) {
  let sports: any[] = [];
  let venues: any[] = [];
  try { sports = (await getSports()) || []; } catch { sports = []; }
  try { venues = (await getVenues()) || []; } catch { venues = []; }
  if (!events || events.length === 0) {
    return <div className="p-4 text-sm text-gray-600">No events found.</div>;
  }

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden bg-white">
      <div className="flex items-center justify-between py-2 px-4 bg-gray-100">
        <div />
        <div>
          <AddEventButton initialSports={sports} initialVenues={venues} />
        </div>
      </div>

      <div id="events-table-container">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead colSpan={8} className="p-0">
                <div className="grid grid-cols-[120px_2fr_3fr_1.2fr_88px_72px_72px_64px] items-center gap-4 py-2 px-4">
                  <div className="text-sm text-gray-700">Sport</div>
                  <div className="text-sm text-gray-700">Event Name</div>
                  <div className="text-sm text-gray-700">Event Description</div>
                  <div className="text-sm text-gray-700">Venue</div>
                  <div className="text-sm text-gray-700 text-right">Date</div>
                  <div className="text-sm text-gray-700 text-right">Time</div>
                  <div className="text-sm text-gray-700 text-right">Duration</div>
                  <div className="text-sm text-gray-700 text-right">Actions</div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {events.map((e: any, idx: number) => (
              <TableRow key={e.id ?? JSON.stringify(e)} data-row-idx={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                <TableCell colSpan={8} className="p-0">
                  <EventRow event={e} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Client-side pagination controls */}
      <div>
        {/* load dynamically to avoid SSR mismatch */}
        {/* @ts-ignore */}
        <TablePagination clientId="unused" containerId="events-table-container" total={events.length} defaultPerPage={10} />
      </div>
    </div>
  );
}
