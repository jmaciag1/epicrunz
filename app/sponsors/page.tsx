import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface UserRace {
  id: string
  race_name: string
  race_date: string | null
  city: string
  state: string
  description: string | null
  distances: string[]
  sponsor_perks: string | null
  sponsor_contact_email: string | null
  profiles: { display_name: string | null; username: string } | null
}

async function getSponsorRaces(): Promise<UserRace[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_races')
    .select('*, profiles(display_name, username)')
    .eq('seeking_sponsors', true)
    .order('created_at', { ascending: false })
  return (data as UserRace[]) ?? []
}

export default async function SponsorsPage() {
  const races = await getSponsorRaces()

  return (
    <div className="text-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-950 border-b border-white/10 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            Race Sponsorship Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Become a Race Sponsor
          </h1>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl">
            Connect with local races looking for sponsors. Get your brand in front of passionate runners — on race bibs, banners, and social posts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/create-race"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
              List Your Race
            </Link>
            <a
              href="#races"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Browse Races Seeking Sponsors ↓
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-white mb-6">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Browse races', desc: 'Find local races that match your brand and audience.' },
            { step: '2', title: 'Contact the organizer', desc: 'Reach out directly to the race organizer to discuss your sponsorship.' },
            { step: '3', title: 'Get your brand out there', desc: 'Appear on race bibs, banners, social posts, and more.' },
          ].map(item => (
            <div key={item.step} className="bg-gray-900 border border-white/10 rounded-xl p-5">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Race listings */}
      <section id="races" className="max-w-4xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Races Seeking Sponsors
            {races.length > 0 && (
              <span className="ml-3 text-sm font-normal text-gray-400">{races.length} available</span>
            )}
          </h2>
          <Link
            href="/create-race"
            className="text-orange-500 hover:text-orange-400 text-sm font-semibold transition-colors"
          >
            + List Your Race
          </Link>
        </div>

        {races.length === 0 ? (
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🏁</div>
            <h3 className="text-xl font-bold text-white mb-2">No races listed yet</h3>
            <p className="text-gray-400 mb-6">Be the first to list your race and find sponsors.</p>
            <Link
              href="/create-race"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors inline-block"
            >
              List Your Race
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {races.map(race => {
              const date = race.race_date
                ? new Date(race.race_date).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })
                : 'Date TBA'

              return (
                <div key={race.id} className="bg-gray-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-orange-500/10 text-orange-400 text-xs font-medium px-2 py-0.5 rounded-full border border-orange-500/20">
                          Seeking Sponsors
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-2">{race.race_name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{race.city}, {race.state} · {date}</p>

                      {race.distances.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {race.distances.map(d => (
                            <span key={d} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full border border-white/10">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}

                      {race.description && (
                        <p className="text-gray-300 text-sm mt-3 leading-relaxed">{race.description}</p>
                      )}

                      {race.sponsor_perks && (
                        <div className="mt-4 bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                          <p className="text-orange-400 text-xs font-semibold uppercase tracking-wide mb-1">What sponsors receive</p>
                          <p className="text-gray-300 text-sm">{race.sponsor_perks}</p>
                        </div>
                      )}

                      <p className="text-gray-500 text-xs mt-3">
                        Listed by{' '}
                        <span className="text-gray-400">
                          @{race.profiles?.username ?? 'organizer'}
                        </span>
                      </p>
                    </div>

                    {race.sponsor_contact_email && (
                      <a
                        href={`mailto:${race.sponsor_contact_email}?subject=Sponsorship inquiry — ${race.race_name}`}
                        className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
                      >
                        Contact to Sponsor
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}
