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
    <div className="bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-orange-500/40 hover:bg-gray-800/80 transition-all flex flex-col group">
      <h3 className="font-semibold text-white text-base leading-tight group-hover:text-orange-400 transition-colors">{race.name}</h3>
      <p className="text-gray-400 text-sm mt-1">
        {race.city}, {race.state}
      </p>
      <p className="text-orange-500 text-sm font-medium mt-1">{date}</p>
      {race.distances.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {race.distances.map(d => (
            <span
              key={d}
              className="bg-orange-500/10 text-orange-400 text-xs px-2 py-1 rounded-full font-medium border border-orange-500/20"
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
          className="text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors"
        >
          View race & register →
        </a>
      </div>
    </div>
  )
}
