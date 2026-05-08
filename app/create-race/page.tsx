'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const DISTANCE_OPTIONS = ['5K', '10K', '15K', 'Half Marathon', 'Marathon', '50K', '50 Mile', '100K', '100 Mile']

export default function CreateRacePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [raceName, setRaceName] = useState('')
  const [raceDate, setRaceDate] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [description, setDescription] = useState('')
  const [distances, setDistances] = useState<string[]>([])
  const [seekingSponsors, setSeekingSponsors] = useState(false)
  const [sponsorPerks, setSponsorPerks] = useState('')
  const [sponsorEmail, setSponsorEmail] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('membership_tier')
        .eq('id', user.id)
        .single()

      if (profile?.membership_tier !== 'organizer') {
        router.push('/membership')
        return
      }

      setUserId(user.id)
      setLoading(false)
    }
    check()
  }, [])

  function toggleDistance(d: string) {
    setDistances(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    setError(null)

    const { error } = await supabase.from('user_races').insert({
      user_id: userId,
      race_name: raceName,
      race_date: raceDate || null,
      city,
      state,
      description: description || null,
      distances,
      seeking_sponsors: seekingSponsors,
      sponsor_perks: seekingSponsors ? sponsorPerks || null : null,
      sponsor_contact_email: seekingSponsors ? sponsorEmail || null : null,
    })

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push('/sponsors')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const inputClass = 'w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600 text-sm'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-white">
      <div className="mb-8">
        <Link href="/sponsors" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
          ← Back to Sponsors
        </Link>
        <h1 className="text-3xl font-extrabold text-white mt-4 mb-1">List Your Race</h1>
        <p className="text-gray-400 text-sm">Fill in your race details. Mark it as seeking sponsors to appear in the marketplace.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic info */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white text-lg">Race Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Race Name <span className="text-orange-500">*</span></label>
            <input
              value={raceName}
              onChange={e => setRaceName(e.target.value)}
              required
              placeholder="e.g. Desert Dawn 5K"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">City <span className="text-orange-500">*</span></label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                required
                placeholder="Phoenix"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">State <span className="text-orange-500">*</span></label>
              <input
                value={state}
                onChange={e => setState(e.target.value)}
                required
                placeholder="AZ"
                maxLength={2}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Race Date</label>
            <input
              type="date"
              value={raceDate}
              onChange={e => setRaceDate(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell runners and sponsors about your race..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Distances</label>
            <div className="flex flex-wrap gap-2">
              {DISTANCE_OPTIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDistance(d)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    distances.includes(d)
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-gray-800 border-white/10 text-gray-400 hover:border-orange-500/50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sponsorship section */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-lg">Sponsorship</h2>
              <p className="text-gray-400 text-sm">List your race in the sponsor marketplace</p>
            </div>
            <button
              type="button"
              onClick={() => setSeekingSponsors(s => !s)}
              className={`w-12 h-6 rounded-full transition-colors relative ${seekingSponsors ? 'bg-orange-500' : 'bg-gray-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${seekingSponsors ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {seekingSponsors && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">What do sponsors receive?</label>
                <textarea
                  value={sponsorPerks}
                  onChange={e => setSponsorPerks(e.target.value)}
                  placeholder="e.g. Logo on race bibs, banner at finish line, social media shoutout, booth space at expo..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Sponsor contact email</label>
                <input
                  type="email"
                  value={sponsorEmail}
                  onChange={e => setSponsorEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold text-base transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20"
        >
          {saving ? 'Listing your race...' : 'Publish Race'}
        </button>
      </form>
    </div>
  )
}
