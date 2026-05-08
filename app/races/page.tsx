import { Suspense } from 'react'
import { searchRaces } from '@/lib/runsignup'
import RaceCard from '@/components/race-card'
import RaceSearchForm from '@/components/race-search-form'
import type { Race } from '@/lib/runsignup'

async function RaceList({ distance }: { distance?: string }) {
  let races: Race[] = []
  let errorMessage: string | null = null

  try {
    races = await searchRaces()
  } catch {
    errorMessage = 'Could not load races right now. Please try again shortly.'
  }

  const filtered = distance
    ? races.filter(r =>
        r.distances.some(d =>
          d.toLowerCase().includes(distance.toLowerCase())
        )
      )
    : races

  if (errorMessage) {
    return <p className="text-red-400">{errorMessage}</p>
  }

  if (filtered.length === 0) {
    return (
      <p className="text-gray-400">
        No races found{distance ? ` for "${distance}"` : ''}. Try a different filter.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {filtered.map(race => (
        <RaceCard key={race.id} race={race} />
      ))}
    </div>
  )
}

export default async function RacesPage({
  searchParams,
}: {
  searchParams: Promise<{ distance?: string }>
}) {
  const { distance } = await searchParams

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Find Races</h1>
      <p className="text-gray-400 mb-6">
        Discover upcoming 5Ks to ultramarathons
      </p>
      <Suspense fallback={null}>
        <RaceSearchForm />
      </Suspense>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          }
        >
          <RaceList distance={distance} />
        </Suspense>
      </div>
    </div>
  )
}
