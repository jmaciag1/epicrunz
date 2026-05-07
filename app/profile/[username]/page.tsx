import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const initial = (profile.display_name || profile.username)[0].toUpperCase()
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-500 shrink-0">
            {initial}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-gray-400">@{profile.username}</p>
            {profile.location && (
              <p className="text-gray-500 text-sm mt-1">{profile.location}</p>
            )}
          </div>
        </div>
        {profile.bio && (
          <p className="mt-6 text-gray-700 leading-relaxed">{profile.bio}</p>
        )}
        <p className="mt-6 text-sm text-gray-400 border-t pt-4">
          Member since {joinDate}
        </p>
      </div>
    </div>
  )
}
