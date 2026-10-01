import type { BoardingPoint, City, Route } from '../types'

async function getJson<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(path, window.location.origin)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url.pathname + url.search)
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function getCities(options?: { fail?: boolean }): Promise<City[]> {
  return getJson<City[]>('/api/cities', { fail: options?.fail ? 1 : undefined })
}

export function getBoardingPoints(options?: { cityId?: City['id']; fail?: boolean }): Promise<BoardingPoint[]> {
  return getJson<BoardingPoint[]>('/api/boarding-points', {
    cityId: options?.cityId,
    fail: options?.fail ? 1 : undefined,
  })
}

export function getRoutes(options?: { fail?: boolean }): Promise<Route[]> {
  return getJson<Route[]>('/api/routes', { fail: options?.fail ? 1 : undefined })
}
