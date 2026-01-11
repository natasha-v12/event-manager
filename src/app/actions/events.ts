"use server";

import { createClient } from "../../lib/supabase/server";

export async function getEvents(
  search?: string,
  sportId?: string | string[],
  startDate?: string,
  endDate?: string,
  venueId?: string | string[]
) {
  const supabase = await createClient();

  let query: any = supabase.from("Event").select("*").order("start_time", { ascending: true });

  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    query = query.ilike('name', term);
  }

  if (sportId) {
    if (Array.isArray(sportId)) {
      const ids = sportId.map((s) => s.toString());
      if (ids.length > 0) query = query.in('sport_id', ids);
    } else if (sportId.toString().includes(',')) {
      const ids = sportId.toString().split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) query = query.in('sport_id', ids);
    } else if (sportId.toString().trim().length > 0) {
      query = query.eq('sport_id', sportId.toString().trim());
    }
  }

  if (startDate && startDate.trim().length > 0) {
    // assume yyyy-mm-dd string; filter events starting on/after this date
    query = query.gte('start_time', startDate);
  }

  if (endDate && endDate.trim().length > 0) {
    // filter events starting on/before this date
    query = query.lte('start_time', endDate);
  }

  // filter by venue via EventVenue mapping if requested
  if (venueId) {
    let venueIds: string[] = [];
    if (Array.isArray(venueId)) venueIds = venueId.map((v) => String(v));
    else if (typeof venueId === 'string' && venueId.includes(',')) venueIds = venueId.split(',').map((v) => v.trim()).filter(Boolean);
    else if (typeof venueId === 'string' && venueId.trim().length > 0) venueIds = [venueId.trim()];

    if (venueIds.length === 0) {
      // no matching venue ids -> no events
      return [];
    }

    const { data: mappings, error: mapErr } = await supabase.from('EventVenue').select('event_id').in('venue_id', venueIds);
    if (mapErr) throw new Error(mapErr.message);
    const eventIds = (mappings || []).map((m: any) => m.event_id).filter(Boolean);
    if (eventIds.length === 0) return [];
    query = query.in('id', eventIds);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
}

export async function getEventCreatorId(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Event')
    .select('created_by')
    .eq('id', eventId)
    .single();

  if (error) throw new Error(error.message);
  // data may be { created_by: 'uuid' } or null
  return data?.created_by ?? null;
}

export async function getEventById(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Event')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createEvent(payload: any) {
  const supabase = await createClient();

  // If payload contains venue_ids, handle EventVenue mapping separately
  const venueIds = Array.isArray(payload?.venue_ids) ? payload.venue_ids.map((v: any) => String(v)) : [];
  const insertPayload = { ...payload };
  delete insertPayload.venue_ids;

  const { data, error } = await supabase
    .from('Event')
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // insert mappings into EventVenue if venue ids provided
  if (venueIds.length > 0) {
    const eventId = (data as any)?.id;
    if (eventId) {
      const toInsert = venueIds.map((vid: string) => ({ event_id: eventId, venue_id: vid }));
      const { error: insErr } = await supabase.from('EventVenue').insert(toInsert);
      if (insErr) throw new Error(insErr.message);
    }
  }

  return data;
}

export async function searchEvents(formData: FormData) {
  const q = formData.get('q')?.toString() || '';
  const { redirect } = await import('next/navigation');
  const url = q && q.trim().length > 0 ? `/dashboard?q=${encodeURIComponent(q.trim())}` : '/dashboard';
  redirect(url);
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Event')
    .delete()
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getEventDetails(eventId: string) {
  const supabase = await createClient();

  const { data: event, error: eventErr } = await supabase.from('Event').select('*').eq('id', eventId).single();
  if (eventErr) throw new Error(eventErr.message);

  let sport = null;
  if (event?.sport_id) {
    const { data: s, error: sErr } = await supabase.from('Sport').select('*').eq('id', event.sport_id).single();
    if (sErr) throw new Error(sErr.message);
    sport = s ?? null;
  }

  // fetch venue ids via EventVenue mapping
  const { data: mappings, error: mapErr } = await supabase.from('EventVenue').select('venue_id').eq('event_id', eventId);
  if (mapErr) throw new Error(mapErr.message);
  const ids = (mappings || []).map((r: any) => r.venue_id).filter(Boolean);
  let venues: any[] = [];
  if (ids.length > 0) {
    const { data: vs, error: vErr } = await supabase.from('Venue').select('*').in('id', ids);
    if (vErr) throw new Error(vErr.message);
    venues = vs || [];
  }

  return { event, sport, venues };
}

export async function updateEvent(eventId: string, payload: any) {
  const supabase = await createClient();

  const updatePayload = { ...payload };
  // handle venues separately
  delete updatePayload.venue_ids;

  const { data, error } = await supabase
    .from('Event')
    .update(updatePayload)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (payload?.venue_ids && Array.isArray(payload.venue_ids)) {
    const venueIds = payload.venue_ids.map((v: any) => String(v));
    const { error: delErr } = await supabase.from('EventVenue').delete().eq('event_id', eventId);
    if (delErr) throw new Error(delErr.message);

    const toInsert = venueIds.map((vid: string) => ({ event_id: eventId, venue_id: vid }));
    if (toInsert.length > 0) {
      const { error: insErr } = await supabase.from('EventVenue').insert(toInsert);
      if (insErr) throw new Error(insErr.message);
    }
  }

  return data;
}
