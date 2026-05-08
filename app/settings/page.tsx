'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  username: string
  display_name: string
  bio: string
  location: string
}

function SettingsForm() {
  const [profile, setProfile] = useState<Profile>({
    username: '',
    display_name: '',
    bio: '',
    location: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === 'true'
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          username: data.username ?? '',
          display_name: data.display_name ?? '',
          bio: data.bio ?? '',
          location: data.location ?? '',
        })
      } else {
        // Pre-fill display_name from signup metadata
        const metaName = user.user_metadata?.display_name ?? ''
        setProfile(p => ({ ...p, display_name: metaName }))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profile })

    if (error) {
      setError(error.message)
    } else if (isOnboarding) {
      router.push(`/profile/${profile.username}`)
    } else {
      setSuccess(true)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">
        {isOnboarding ? 'Set up your profile' : 'Edit Profile'}
      </h1>
      {isOnboarding && (
        <p className="text-gray-400 mb-6">
          Tell the running community a bit about yourself.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Username <span className="text-red-400">*</span>
          </label>
          <input
            value={profile.username}
            onChange={e =>
              setProfile(p => ({
                ...p,
                username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
              }))
            }
            required
            placeholder="e.g. jennifer_runs"
            className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1.5">Letters, numbers, underscores only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Name</label>
          <input
            value={profile.display_name}
            onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
            placeholder="Jennifer"
            className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
          <input
            value={profile.location}
            onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
            placeholder="Phoenix, AZ"
            className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
          <textarea
            value={profile.bio}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell the running community about yourself..."
            rows={3}
            className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600 text-sm resize-none"
          />
        </div>
        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        {success && (
          <p className="text-green-400 text-sm font-medium">Profile saved!</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 font-semibold disabled:opacity-50 transition-colors"
        >
          {saving
            ? 'Saving...'
            : isOnboarding
            ? 'Create My Profile'
            : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center p-16">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    }>
      <SettingsForm />
    </Suspense>
  )
}
