"use server";

import { createClient } from "../../lib/supabase/server";
import { redirect } from 'next/navigation';

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);

  // redirect to login after successful sign-out
  redirect('/login');
}

export async function signup(formData: FormData) {
  'use server';
  const name = formData.get('name')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw new Error(error.message);

  // After signup, redirect to login or dashboard as desired
  redirect('/login');
}
