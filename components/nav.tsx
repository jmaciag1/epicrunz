'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export default function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-gray-950/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="text-2xl font-extrabold text-orange-500 tracking-tight">
        EpicRunz
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/races" className="text-gray-400 hover:text-white font-medium transition-colors text-sm">
          Find Races
        </Link>
        <Link href="/sponsors" className="text-gray-400 hover:text-white font-medium transition-colors text-sm">
          Race Sponsors
        </Link>
        {user ? (
          <>
            <Link href="/settings" className="text-gray-400 hover:text-white font-medium transition-colors text-sm">
              My Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium transition-colors text-sm"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-400 hover:text-white font-medium transition-colors text-sm">
              Log In
            </Link>
            <Link
              href="/signup"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium transition-colors text-sm"
            >
              Join Free
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
