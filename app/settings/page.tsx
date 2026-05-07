'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  username: string
  display_name: string
  bio: string
  location: string
}

export default function SettingsPage() {
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {isOnboarding ? 'Set up your profile' : 'Edit Profile'}
      </h1>
      {isOnboarding && (
        <p className="text-gray-500 mb-6">
          Tell the running community a bit about yourself.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-400 mt-1">Letters, numbers, underscores only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            value={profile.display_name}
            onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
            placeholder="Jennifer"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            value={profile.location}
            onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
            placeholder="Phoenix, AZ"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={profile.bio}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell the running community about yourself..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm font-medium">Profile saved!</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50"
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
