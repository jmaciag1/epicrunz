const BASE = 'https://runsignup.com/Rest'

export interface Race {
  id: number
  name: string
  date: string
  city: string
  state: string
  url: string
  logo: string | null
  distances: string[]
}

export interface SearchParams {
  lat?: number
  lng?: number
  radiusMiles?: number
  startDate?: string
  endDate?: string
  page?: number
}

export async function searchRaces(params: SearchParams = {}): Promise<Race[]> {
  const today = new Date()
  const sixMonthsOut = new Date()
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6)

  const query = new URLSearchParams({
    format: 'json',
    results_per_page: '20',
    page: String(params.page ?? 1),
    search_start_date: toRunSignUpDate(
      params.startDate ? new Date(params.startDate) : today
    ),
    search_end_date: toRunSignUpDate(
      params.endDate ? new Date(params.endDate) : sixMonthsOut
    ),
  })

  if (params.lat != null && params.lng != null) {
    query.set('search_lat', String(params.lat))
    query.set('search_long', String(params.lng))
    query.set('search_max_distance', String(params.radiusMiles ?? 50))
  }

  const res = await fetch(`${BASE}/races?${query}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error('Failed to fetch races from RunSignUp')

  const data = await res.json()
  return (data.races ?? []).map(({ race }: { race: unknown }) =>
    normalizeRace(race as Record<string, unknown>)
  )
}

export async function getRace(id: number): Promise<Race | null> {
  const res = await fetch(`${BASE}/race/${id}?format=json`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  const data = await res.json()
  return normalizeRace(data.race as Record<string, unknown>)
}

function normalizeRace(race: Record<string, unknown>): Race {
  const address = (race.address as Record<string, string>) ?? {}
  const events = (race.events as Array<Record<string, string>>) ?? []
  return {
    id: race.race_id as number,
    name: (race.name as string) ?? '',
    date: (race.next_date as string) ?? '',
    city: address.city ?? '',
    state: address.state ?? '',
    url: (race.url as string) ?? '',
    logo: (race.logo as string | null) ?? null,
    distances: events.map(e => e.name ?? '').filter(Boolean),
  }
}

function toRunSignUpDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const y = date.getFullYear()
  return `${m}/${d}/${y}`
}
