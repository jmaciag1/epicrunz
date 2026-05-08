'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function MembershipPage() {
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setLoggedIn(true)

      const { data } = await supabase
        .from('profiles')
        .select('membership_tier')
        .eq('id', user.id)
        .single()

      if (data?.membership_tier === 'organizer') setIsOrganizer(true)
      setLoading(false)
    }
    load()
  }, [])

  async function handleUpgrade() {
    setUpgrading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/signup'); return }

    await supabase
      .from('profiles')
      .update({ membership_tier: 'organizer' })
      .eq('id', user.id)

    router.push('/create-race')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="text-white max-w-4xl mx-auto px-4 py-14">

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Race Organizer Program
        </div>
        <h1 className="text-4xl font-extrabold text-white">List your race. Find sponsors.</h1>
        <p className="text-gray-400 mt-3 text-lg max-w-xl mx-auto">
          Upgrade to an Organizer membership to list your race on EpicRunz and connect with local sponsors.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">

        {/* Free tier */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">Runner</h2>
          <div className="text-3xl font-extrabold text-white mb-1">Free</div>
          <p className="text-gray-400 text-sm mb-6">Everything you need to run</p>
          <ul className="space-y-3 text-sm text-gray-300 mb-6">
            {[
              'Public runner profile',
              'Browse & register for races',
              'Join running groups',
              'Activity feed',
              'Achievements & badges',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> {f}
              </li>
            ))}
          </ul>
          {!isOrganizer && (
            <div className="w-full bg-gray-800 text-gray-400 py-2.5 rounded-xl font-medium text-sm text-center border border-white/10">
              Current Plan
            </div>
          )}
        </div>

        {/* Organizer tier */}
        <div className="bg-gray-900 border-2 border-orange-500 rounded-2xl p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
            ORGANIZER
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Race Organizer</h2>
          <div className="text-3xl font-extrabold text-white mb-1">
            $29<span className="text-lg font-normal text-gray-400">/mo</span>
          </div>
          <p className="text-gray-400 text-sm mb-6">Everything in Runner, plus:</p>
          <ul className="space-y-3 text-sm text-gray-300 mb-6">
            {[
              'Create & manage your own races',
              'List your race in the sponsor marketplace',
              'Connect with local sponsors',
              'Race organizer badge on profile',
              'Priority support',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> {f}
              </li>
            ))}
          </ul>

          {isOrganizer ? (
            <Link
              href="/create-race"
              className="w-full block text-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold transition-colors"
            >
              Create a Race →
            </Link>
          ) : loggedIn ? (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {upgrading ? 'Activating...' : 'Get Early Access — Free'}
            </button>
          ) : (
            <Link
              href="/signup"
              className="w-full block text-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold transition-colors"
            >
              Sign Up to Get Started
            </Link>
          )}

          {loggedIn && !isOrganizer && (
            <p className="text-gray-500 text-xs text-center mt-3">
              Free during beta — payment required at launch
            </p>
          )}
        </div>

      </div>

    </div>
  )
}
