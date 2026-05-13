const BASE_URL = '/api'

export const api = {
  listAllCountries: async () => {
    const res = await fetch(`${BASE_URL}/countries`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return res.json()
  },
  searchCountries: async (query: string) => {
    if (!query) return []
    const res = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return res.json()
  },
  getCountryData: async (code: string) => {
    const res = await fetch(`${BASE_URL}/country/${code}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return res.json()
  },
  getGlobalTrends: async (mode: string) => {
    const res = await fetch(`${BASE_URL}/global-trends?mode=${mode}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return res.json()
  },
  getHotspots: async (limit: number) => {
    const res = await fetch(`${BASE_URL}/hotspots?limit=${limit}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return res.json()
  },
  predict: async (code: string) => {
    const res = await fetch(`${BASE_URL}/predict/${code}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return res.json()
  },
}
