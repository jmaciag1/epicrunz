'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/settings')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Left — branding panel (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-col justify-center flex-1 px-16 relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gray-950/75" />
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Run Together.<br />
            <span className="text-orange-500">Go Further.</span>
          </h1>
          <p className="text-gray-300 text-lg mt-4 max-w-sm leading-relaxed">
            Your community of runners is waiting. Log back in and pick up where you left off.
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex flex-col justify-center flex-1 px-6 py-12 lg:px-16 max-w-xl w-full mx-auto lg:mx-0">
        <div>
          <Link href="/" className="text-2xl font-extrabold text-orange-500">EpicRunz</Link>
          <h2 className="text-3xl font-bold text-white mt-8 mb-1">Welcome back, runner</h2>
          <p className="text-gray-400 text-sm mb-8">Log in to your account to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600 text-sm"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold text-base transition-colors disabled:opacity-50 mt-2 shadow-lg shadow-orange-500/20"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
