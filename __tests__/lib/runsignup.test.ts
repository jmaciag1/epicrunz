import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchRaces, getRace } from '@/lib/runsignup'

describe('searchRaces', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns an array of normalized races', async () => {
    const mockResponse = {
      races: [
        {
          race: {
            race_id: 1,
            name: 'Test 5K',
            next_date: '2026-06-01 08:00:00',
            url: 'https://runsignup.com/race/test',
            logo: null,
            address: { city: 'Phoenix', state: 'AZ' },
            events: [{ name: '5K' }],
          },
        },
      ],
    }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const races = await searchRaces()

    expect(races).toHaveLength(1)
    expect(races[0]).toEqual({
      id: 1,
      name: 'Test 5K',
      date: '2026-06-01 08:00:00',
      city: 'Phoenix',
      state: 'AZ',
      url: 'https://runsignup.com/race/test',
      logo: null,
      distances: ['5K'],
    })
  })

  it('throws when the API responds with an error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)
    await expect(searchRaces()).rejects.toThrow('Failed to fetch races')
  })

  it('returns an empty array when races is missing from response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ races: [] }),
    } as Response)
    const races = await searchRaces()
    expect(races).toEqual([])
  })
})

describe('getRace', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns null when the race is not found', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)
    const race = await getRace(999)
    expect(race).toBeNull()
  })

  it('returns a normalized race by ID', async () => {
    const mockResponse = {
      race: {
        race_id: 42,
        name: 'Desert Ultra 50K',
        next_date: '2026-07-04 06:00:00',
        url: 'https://runsignup.com/race/desert',
        logo: 'https://example.com/logo.png',
        address: { city: 'Scottsdale', state: 'AZ' },
        events: [{ name: '50K' }, { name: '100K' }],
      },
    }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const race = await getRace(42)

    expect(race).not.toBeNull()
    expect(race?.id).toBe(42)
    expect(race?.name).toBe('Desert Ultra 50K')
    expect(race?.distances).toEqual(['50K', '100K'])
    expect(race?.logo).toBe('https://example.com/logo.png')
  })
})
