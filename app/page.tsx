import Link from 'next/link'
import { searchRaces } from '@/lib/runsignup'
import RaceCard from '@/components/race-card'
import type { Race } from '@/lib/runsignup'

async function getFeaturedRaces(): Promise<Race[]> {
  try {
    const races = await searchRaces()
    return races.slice(0, 3)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featuredRaces = await getFeaturedRaces()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold leading-tight">
            Find Your Next Epic Run
          </h1>
          <p className="text-xl mt-4 opacity-90 max-w-xl mx-auto">
            Discover races from 5Ks to ultramarathons, connect with runners near
            you, and track your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/races"
              className="bg-white text-orange-500 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 text-lg"
            >
              Find Races
            </Link>
            <Link
              href="/signup"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-orange-500 text-lg transition-colors"
            >
              Join Free
            </Link>
          </div>
        </div>
      </section>

      {/* Featured races */}
      {featuredRaces.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Upcoming Races
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {featuredRaces.map(race => (
              <RaceCard key={race.id} race={race} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/races"
              className="text-orange-500 font-semibold hover:underline"
            >
              Browse all races →
            </Link>
          </div>
        </section>
      )}

      {/* Feature highlights */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: '🏃',
              title: 'Find Races',
              desc: 'Search thousands of real races from 5K to ultramarathon nationwide.',
            },
            {
              icon: '🏅',
              title: 'Track Achievements',
              desc: 'Earn badges for completed races and build your runner profile. Coming soon.',
            },
            {
              icon: '👥',
              title: 'Join Running Groups',
              desc: 'Connect with local runners and join group runs in your area. Coming soon.',
            },
          ].map(f => (
            <div key={f.title}>
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg text-gray-900">{f.title}</h3>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
