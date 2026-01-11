import Dashboard from '@/components/Dashboard';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions/auth';
export const dynamic = 'force-dynamic';
import { getDashboardInsights } from '@/app/actions/insights';
import InsightsPanel from '@/components/InsightsPanel';

export default async function DashboardPage({ searchParams }: { searchParams?: { q?: string; sport?: string | string[]; start?: string; end?: string; venue?: string | string[] } }) {
  const insights = await getDashboardInsights();
  const sp = await Promise.resolve(searchParams);
  const q = sp?.q ?? '';
  const sport = sp?.sport;
  const start = sp?.start ?? '';
  const end = sp?.end ?? '';
  const venue = sp?.venue;
  const supabase = await createClient();
  let user: any = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = (data as any)?.user ?? null;
  } catch (err) {
    user = null;
  }

  return (
    <main className="min-h-screen">
      <div className="w-full max-w-[1800px] mx-auto px-10 py-12">
        <div className="w-full">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold">Dashboard</h1>
                <p className="text-sm muted">Overview of upcoming events and quick management actions.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div style={{ color: 'var(--foreground)' }} className="text-lg font-semibold">{user?.user_metadata?.name ?? user?.email}</div>
                <form action={logout}>
                  <button type="submit" className="btn-primary inline-flex items-center gap-2">Logout</button>
                </form>
            </div>
          </div>

          <section className="mt-6 w-full">
            <div className="grid grid-cols-1 gap-2">
                <div>
                  <InsightsPanel initialInsights={insights} horizontal />
                </div>

                <div>
                  <div className="card p-2">
                    <Dashboard search={q} sport={sport} dateStart={start} dateEnd={end} venue={venue} />
                  </div>
                </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
