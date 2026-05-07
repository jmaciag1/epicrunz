'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function RaceSearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [distance, setDistance] = useState(searchParams.get('distance') ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (distance) params.set('distance', distance)
    router.push(`/races?${params}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <select
        value={distance}
        onChange={e => setDistance(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700"
      >
        <option value="">All Distances</option>
        <option value="5K">5K</option>
        <option value="10K">10K</option>
        <option value="Half">Half Marathon</option>
        <option value="Marathon">Marathon</option>
        <option value="Ultra">Ultra Marathon</option>
      </select>
      <button
        type="submit"
        className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 font-medium"
      >
        Search
      </button>
    </form>
  )
}
