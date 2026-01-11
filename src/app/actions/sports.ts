"use server";

import { createClient } from "../../lib/supabase/server";

export async function getSports() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Sport")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getSportById(id: string | number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Sport")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
