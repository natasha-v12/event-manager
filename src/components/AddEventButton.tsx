"use client";
import React from 'react';
import EditEventDialog from './EditEventDialog';

export default function AddEventButton({ initialSports, initialVenues }: { initialSports?: any[]; initialVenues?: any[] }) {
  return (
    <EditEventDialog
      initialData={{ event: {}, sport: null, venues: [] }}
      initialSports={initialSports}
      initialVenues={initialVenues}
      initialVenueIds={[]}
      buttonLabel="Add Event"
      buttonClassName="btn-primary inline-flex items-center gap-2"
    />
  );
}
