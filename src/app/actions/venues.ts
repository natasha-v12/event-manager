"use server";

import { createClient } from "../../lib/supabase/server";

export async function getVenues() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Venue")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getVenueById(id: string | number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Venue")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
