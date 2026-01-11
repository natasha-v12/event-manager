"use server";

import { createClient } from "../../lib/supabase/server";

export async function getEventVenues() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("EventVenue")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getEventVenueById(id: string | number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("EventVenue")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getVenueIdsForEvent(eventId: string | number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("EventVenue")
    .select("venue_id")
    .eq("event_id", eventId);

  if (error) throw new Error(error.message);
  // return array of venue ids
  return data?.map((r: any) => r.venue_id) ?? [];
}

export async function getEventIdsForVenue(venueId: string | number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("EventVenue")
    .select("event_id")
    .eq("venue_id", venueId);

  if (error) throw new Error(error.message);
  return data?.map((r: any) => r.event_id) ?? [];
}