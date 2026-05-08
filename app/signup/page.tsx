'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: `${firstName} ${lastName}`.trim() },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/settings?onboarding=true')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Left — branding panel (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-col justify-center flex-1 px-16 relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1486218119243-13301ac4fc0b?auto=format&fit=crop&w=1200&q=80)',
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
            Connect with thousands of runners, find your next race, and crush your goals together.
          </p>
          <div className="flex gap-8 mt-10 text-sm text-gray-400">
            <div>
              <div className="text-2xl font-bold text-white">50K+</div>
              <div>Races</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">12K+</div>
              <div>Runners</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">340+</div>
              <div>Groups</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — signup form */}
      <div className="flex flex-col justify-center flex-1 px-6 py-12 lg:px-16 max-w-xl w-full mx-auto lg:mx-0">
        <div>
          <Link href="/" className="text-2xl font-extrabold text-orange-500">EpicRunz</Link>
          <h2 className="text-3xl font-bold text-white mt-8 mb-1">Create your account</h2>
          <p className="text-gray-400 text-sm mb-8">It&apos;s free and only takes a minute.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  placeholder="Jennifer"
                  className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                  placeholder="Maciag"
                  className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600 text-sm"
                />
              </div>
            </div>

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
                minLength={8}
                placeholder="At least 8 characters"
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
              {loading ? 'Creating your profile...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-500 text-xs leading-relaxed">
            By clicking Create Account you agree to our Terms and Privacy Policy.
          </p>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Already a runner?{' '}
              <Link href="/login" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
