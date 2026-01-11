import Link from 'next/link';
import { signup } from '@/app/actions/auth';
import Input from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md p-10 rounded-2xl shadow-lg" style={{ background: 'var(--card)', color: 'var(--foreground)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Create account</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Create an account to manage events and venues.</p>
        </div>

        <form action={signup} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: 'var(--muted)' }}>Name</label>
            <Input name="name" type="text" required placeholder="Your full name" className="bg-transparent border-0 border-b py-2" style={{ borderBottomColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)' }} />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: 'var(--muted)' }}>Email</label>
            <Input name="email" type="email" required placeholder="you@company.com" className="bg-transparent border-0 border-b py-2" style={{ borderBottomColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)' }} />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: 'var(--muted)' }}>Password</label>
            <Input name="password" type="password" required placeholder="Choose a strong password" className="bg-transparent border-0 border-b py-2" style={{ borderBottomColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)' }} />
          </div>

          <div className="flex items-center justify-between">
            <Link href="/login" className="text-sm" style={{ color: 'var(--muted)' }}>Already have an account?</Link>
            <Button type="submit" className="btn-primary">Create account</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
