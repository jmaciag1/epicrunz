import { getRace } from '@/lib/runsignup'
import { notFound } from 'next/navigation'

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (isNaN(id)) notFound()

  const race = await getRace(id)
  if (!race) notFound()

  const date = race.date
    ? new Date(race.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBA'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900">{race.name}</h1>
        <p className="text-gray-500 mt-2">
          {race.city}, {race.state}
        </p>
        <p className="text-orange-500 font-medium mt-1">{date}</p>
        {race.distances.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {race.distances.map(d => (
              <span
                key={d}
                className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium text-sm"
              >
                {d}
              </span>
            ))}
          </div>
        )}
        <a
          href={race.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-medium"
        >
          Register on RunSignUp →
        </a>
      </div>
    </div>
  )
}
