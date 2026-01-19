"use server";

import { createClient } from "../../lib/supabase/server";
import { redirect } from 'next/navigation';

export async function logout() {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();
    // Supabase may return an error when there is no server-side session (e.g. "Auth session missing").
    // Treat missing-session as already-signed-out and continue to redirect.
    if (error && !/auth session missing/i.test(error.message)) {
      throw new Error(error.message);
    }
  } catch (err: any) {
    // If the error explicitly indicates a missing session, ignore it.
    if (err?.message && /auth session missing/i.test(err.message)) {
      // noop - proceed to redirect
    } else {
      throw err;
    }
  }

  // redirect to login after successful sign-out (or if there was no session)
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

export async function signIn(formData: FormData) {
  'use server';
  const email = formData.get('email')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithOAuth(provider: string) {
  'use server';
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: provider as any });
  if (error) throw new Error(error.message);
  return data;
}
