"use client";
import React from 'react';
import EditEventDialog from './EditEventDialog';

export default function EventEditButton({ eventId, initialData, initialSports, initialVenues, initialVenueIds }: { eventId?: string; initialData?: any; initialSports?: any[]; initialVenues?: any[]; initialVenueIds?: string[] }) {
  return (
    <EditEventDialog
      eventId={eventId}
      initialData={initialData}
      initialSports={initialSports}
      initialVenues={initialVenues}
      initialVenueIds={initialVenueIds}
    />
  );
}
