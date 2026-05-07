import type { Race } from '@/lib/runsignup'

export default function RaceCard({ race }: { race: Race }) {
  const date = race.date
    ? new Date(race.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBA'

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
      <h3 className="font-semibold text-gray-900 text-lg leading-tight">{race.name}</h3>
      <p className="text-gray-500 text-sm mt-1">
        {race.city}, {race.state}
      </p>
      <p className="text-orange-500 text-sm font-medium mt-1">{date}</p>
      {race.distances.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {race.distances.map(d => (
            <span
              key={d}
              className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full font-medium"
            >
              {d}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto pt-4">
        <a
          href={race.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-orange-500 hover:underline font-medium"
        >
          View race & register →
        </a>
      </div>
    </div>
  )
}
