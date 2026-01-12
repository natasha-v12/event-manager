'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Spinner from './ui/spinner'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (!data?.session) {
        try { router.replace('/login') } catch {}
      } else {
        setLoading(false)
      }
    }).catch(() => {
      try { router.replace('/login') } catch {}
    })
    return () => { mounted = false }
  }, [router])

  if (loading) return <div className="w-full flex items-center justify-center py-16"><Spinner /></div>
  return <>{children}</>
}
