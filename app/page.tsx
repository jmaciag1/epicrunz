import Link from 'next/link'
import { searchRaces } from '@/lib/runsignup'
import RaceCard from '@/components/race-card'
import type { Race } from '@/lib/runsignup'

async function getFeaturedRaces(): Promise<Race[]> {
  try {
    const races = await searchRaces()
    return races.slice(0, 4)
  } catch {
    return []
  }
}

const mockFeed = [
  { user: 'sarah_trails', name: 'Sarah K.', avatar: 'S', action: 'completed', item: 'Boston Marathon 26.2', time: '2h ago', emoji: '🏅' },
  { user: 'mike_ultra', name: 'Mike T.', avatar: 'M', action: 'joined', item: 'Phoenix Trail Runners', time: '4h ago', emoji: '👟' },
  { user: 'jen_paces', name: 'Jennifer P.', avatar: 'J', action: 'registered for', item: 'Sedona Ultra 50K', time: '6h ago', emoji: '🏔️' },
  { user: 'mark_coach', name: 'Coach Mark', avatar: 'C', action: 'shared a training plan for', item: 'Half Marathon PR', time: '1d ago', emoji: '📋' },
]

const mockGroups = [
  { name: 'Phoenix Trail Runners', members: 847, nextRun: 'Sat 6:00 AM', location: 'South Mountain Park', emoji: '🏔️' },
  { name: 'Desert Dawn Runners', members: 412, nextRun: 'Sun 5:30 AM', location: 'Camelback Mountain', emoji: '🌄' },
  { name: 'Urban Pavement Pacers', members: 1203, nextRun: 'Wed 6:30 PM', location: 'Tempe Town Lake', emoji: '🌆' },
]

const mockRunners = [
  { username: 'sarah_trails', display: 'Sarah K.', avatar: 'S', races: 23, miles: 1847 },
  { username: 'mike_ultra', display: 'Mike T.', avatar: 'M', races: 41, miles: 3200 },
  { username: 'jen_paces', display: 'Jennifer P.', avatar: 'J', races: 8, miles: 642 },
  { username: 'mark_coach', display: 'Coach Mark', avatar: 'C', races: 67, miles: 8400 },
]

export default async function HomePage() {
  const featuredRaces = await getFeaturedRaces()

  return (
    <div className="text-white">

      {/* Hero */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-950" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-orange-400 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            2,847 runners joined this week
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold leading-none tracking-tight">
            Run Together.<br />
            <span className="text-orange-500">Go Further.</span>
          </h1>
          <p className="text-xl text-gray-300 mt-6 max-w-2xl mx-auto leading-relaxed">
            Find races, join group runs, connect with runners who push you to your limits.
            Your next epic run starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/signup"
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-orange-500/25"
            >
              Join Free
            </Link>
            <Link
              href="/races"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-10 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Browse Races
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-14 text-sm text-gray-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div>Races</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">12K+</div>
              <div>Runners</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">340+</div>
              <div>Groups</div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Live Activity</h2>
          <span className="bg-orange-500/10 text-orange-400 text-xs font-medium px-3 py-1 rounded-full border border-orange-500/20">
            Full feed in Phase 2
          </span>
        </div>
        <div className="space-y-3">
          {mockFeed.map((item, i) => (
            <div key={i} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-colors">
              <div className="h-10 w-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold shrink-0">
                {item.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-sm">
                  <span className="text-white font-semibold">@{item.user}</span>{' '}
                  {item.action}{' '}
                  <span className="text-orange-400 font-medium">{item.item}</span>
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{item.time}</p>
              </div>
              <div className="text-2xl shrink-0">{item.emoji}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Race Discovery */}
      {featuredRaces.length > 0 && (
        <section className="bg-gray-900/40 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Upcoming Races</h2>
                <p className="text-gray-400 text-sm mt-1">Real races from RunSignUp</p>
              </div>
              <Link href="/races" className="text-orange-500 hover:text-orange-400 text-sm font-semibold transition-colors">
                Browse all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredRaces.map(race => (
                <RaceCard key={race.id} race={race} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Group Runs */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Group Runs Near You</h2>
            <p className="text-gray-400 text-sm mt-1">Find your people — coming in Phase 3</p>
          </div>
          <span className="bg-orange-500/10 text-orange-400 text-xs font-medium px-3 py-1 rounded-full border border-orange-500/20">
            Coming Soon
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {mockGroups.map((group, i) => (
            <div key={i} className="bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-colors">
              <div className="text-3xl mb-3">{group.emoji}</div>
              <h3 className="font-semibold text-white">{group.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{group.members.toLocaleString()} members</p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-orange-400 text-xs font-medium">{group.nextRun}</p>
                <p className="text-gray-500 text-xs">{group.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Runner Profiles */}
      <section className="bg-gray-900/40 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Top Runners</h2>
              <p className="text-gray-400 text-sm mt-1">Profiles & achievements — coming in Phase 2</p>
            </div>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {mockRunners.map((runner, i) => (
              <div key={i} className="bg-gray-900 border border-white/10 rounded-xl p-5 text-center hover:border-orange-500/30 transition-colors">
                <div className="h-16 w-16 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center text-2xl font-bold text-orange-400 mx-auto mb-3">
                  {runner.avatar}
                </div>
                <h3 className="font-semibold text-white text-sm">{runner.display}</h3>
                <p className="text-gray-500 text-xs">@{runner.username}</p>
                <div className="flex justify-center gap-4 mt-3 text-xs">
                  <div>
                    <div className="text-white font-bold">{runner.races}</div>
                    <div className="text-gray-500">races</div>
                  </div>
                  <div>
                    <div className="text-white font-bold">{runner.miles.toLocaleString()}</div>
                    <div className="text-gray-500">mi</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/30 rounded-2xl p-12">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Ready to find your people?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of runners discovering races, connecting with groups, and crushing their goals.
            </p>
            <Link
              href="/signup"
              className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 rounded-xl font-bold text-lg transition-colors inline-block shadow-lg shadow-orange-500/25"
            >
              Create Your Free Profile
            </Link>
            <p className="text-gray-500 text-sm mt-4">No credit card required</p>
          </div>
        </div>
      </section>

    </div>
  )
}
