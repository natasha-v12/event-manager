"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Read query params directly from the browser URL to avoid CSR bailout during prerender
    const query = typeof window !== 'undefined' ? window.location.search : '';
    const params = Object.fromEntries(new URLSearchParams(query).entries());
    if (params.signup === 'success') {
      showToast('Account created — check your email to confirm', 'success');
      try { router.replace('/login'); } catch {}
    }
    if (params.error) {
      try { showToast(decodeURIComponent(params.error), 'error'); } catch { showToast(params.error as any, 'error'); }
      try { router.replace('/login'); } catch {}
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showToast(error.message || 'Sign-in failed', 'error');
      } else {
        showToast('Signed in', 'success');
        try { router.push('/'); } catch {}
      }
    } catch (err) {
      showToast('Sign-in error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md p-10 rounded-2xl shadow-lg" style={{ background: 'var(--card)', color: 'var(--foreground)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Sign in</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Access your events and manage schedules</p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: 'var(--muted)' }}>Email</label>
            <Input
              className="bg-transparent border-0 border-b py-2"
              style={{ borderBottomColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)' }}
              placeholder="you@company.com"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: 'var(--muted)' }}>Password</label>
            <Input
              className="bg-transparent border-0 border-b py-2"
              style={{ borderBottomColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)' }}
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Link href="/signup" className="text-sm" style={{ color: 'var(--muted)' }}>Create account</Link>
            <Button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
          </div>
          <div className="pt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm" style={{ background: 'var(--card)', color: 'var(--muted)' }}>or continue with</span>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 btn-ghost"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signInWithOAuth({ provider: 'google' });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                  <path fill="#EA4335" d="M24 9.5c3.9 0 6.6 1.7 8.1 3.1l6-5.9C34.5 3.9 29.7 1.5 24 1.5 14.9 1.5 7.2 6.6 3.6 14l7.2 5.6C12.8 16.1 18 9.5 24 9.5z"/>
                  <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-2.9-.4-4.2H24v8h12.8c-.6 3.2-2.6 5.6-5.5 7.3l8.6 6.7C44.6 36.2 46.5 30.7 46.5 24.5z"/>
                  <path fill="#4A90E2" d="M10.8 28.4A14.6 14.6 0 0110 24.5c0-1.6.3-3.1.8-4.5L3.6 14C1.3 18.5 0 22.9 0 24.5c0 3.5 1.2 6.8 3.6 10.3l7.2-6.4z"/>
                  <path fill="#FBBC05" d="M24 46.5c6.3 0 11.6-2.1 15.4-5.8l-7.3-5.7C30.2 35.9 27.3 37 24 37c-5.9 0-10.9-4.4-12.1-10.4l-7.2 5.6C7.2 41.9 14.9 46.5 24 46.5z"/>
                </svg>
                Sign in with Google
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
