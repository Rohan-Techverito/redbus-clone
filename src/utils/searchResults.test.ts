import { describe, expect, it } from 'vitest'
import {
  filterBoardingPointsByCity,
  findRoute,
  formatRouteHeading,
  parseSearchParams,
} from './searchResults'
import type { BoardingPoint, City, Route } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

const boardingPoints: BoardingPoint[] = [
  { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 },
  { id: 2, name: 'Hinjewadi', address: 'Phase 1', landmark: 'Near Wipro Circle', cityId: 1 },
  { id: 3, name: 'Majestic', address: 'Kempegowda Bus Station', landmark: 'Opp. Railway Station', cityId: 2 },
]

const routes: Route[] = [{ id: 1, fromCityId: 1, toCityId: 2 }]

describe('parseSearchParams', () => {
  it('parses a valid from/to/date combination', () => {
    const params = new URLSearchParams('from=1&to=2&date=2026-10-02')
    const result = parseSearchParams(params, cities)
    expect(result).toEqual({ ok: true, fromCityId: 1, toCityId: 2, date: '2026-10-02' })
  })

  it('rejects a missing from, to, or date', () => {
    expect(parseSearchParams(new URLSearchParams('to=2&date=2026-10-02'), cities)).toEqual({
      ok: false,
      reason: expect.any(String),
    })
    expect(parseSearchParams(new URLSearchParams('from=1&date=2026-10-02'), cities)).toEqual({
      ok: false,
      reason: expect.any(String),
    })
    expect(parseSearchParams(new URLSearchParams('from=1&to=2'), cities)).toEqual({
      ok: false,
      reason: expect.any(String),
    })
  })

  it('rejects a non-numeric from or to', () => {
    const result = parseSearchParams(new URLSearchParams('from=abc&to=2&date=2026-10-02'), cities)
    expect(result.ok).toBe(false)
  })

  it('rejects an unknown city id', () => {
    const result = parseSearchParams(new URLSearchParams('from=999&to=2&date=2026-10-02'), cities)
    expect(result.ok).toBe(false)
  })

  it('rejects a malformed date string', () => {
    const result = parseSearchParams(new URLSearchParams('from=1&to=2&date=not-a-date'), cities)
    expect(result.ok).toBe(false)
  })

  it('rejects a date that is not a real calendar date', () => {
    const result = parseSearchParams(new URLSearchParams('from=1&to=2&date=2026-02-30'), cities)
    expect(result.ok).toBe(false)
  })
})

describe('findRoute', () => {
  it('finds a matching route for a from/to pair', () => {
    expect(findRoute(routes, 1, 2)).toEqual({ id: 1, fromCityId: 1, toCityId: 2 })
  })

  it('returns undefined when no route connects the cities', () => {
    expect(findRoute(routes, 2, 1)).toBeUndefined()
  })
})

describe('filterBoardingPointsByCity', () => {
  it('returns only boarding points for the given city', () => {
    const result = filterBoardingPointsByCity(boardingPoints, 1)
    expect(result.map((bp) => bp.name)).toEqual(['Shivajinagar', 'Hinjewadi'])
  })

  it('returns an empty array when no boarding points match', () => {
    expect(filterBoardingPointsByCity(boardingPoints, 999)).toEqual([])
  })
})

describe('formatRouteHeading', () => {
  it('formats the heading as "From → To · dd Mon"', () => {
    const heading = formatRouteHeading(cities[0], cities[1], '2026-10-02')
    expect(heading).toBe('Pune → Bengaluru · 02 Oct')
  })
})
