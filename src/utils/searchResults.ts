import type { BoardingPoint, City, Route } from '../types'

export type ParsedSearchParams =
  | { ok: true; fromCityId: number; toCityId: number; date: string }
  | { ok: false; reason: string }

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const isValidIsoDate = (value: string): boolean => {
  if (!ISO_DATE_PATTERN.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function parseSearchParams(params: URLSearchParams, cities: City[]): ParsedSearchParams {
  const fromRaw = params.get('from')
  const toRaw = params.get('to')
  const dateRaw = params.get('date')

  if (fromRaw === null || toRaw === null || dateRaw === null) {
    return { ok: false, reason: 'Missing from, to, or date in the search link.' }
  }

  const fromCityId = Number(fromRaw)
  const toCityId = Number(toRaw)

  if (!Number.isInteger(fromCityId) || !Number.isInteger(toCityId)) {
    return { ok: false, reason: 'The search link has an invalid city.' }
  }

  if (!cities.some((c) => c.id === fromCityId) || !cities.some((c) => c.id === toCityId)) {
    return { ok: false, reason: 'The search link refers to an unknown city.' }
  }

  if (!isValidIsoDate(dateRaw)) {
    return { ok: false, reason: 'The search link has an invalid date.' }
  }

  return { ok: true, fromCityId, toCityId, date: dateRaw }
}

export function findRoute(routes: Route[], fromCityId: number, toCityId: number): Route | undefined {
  return routes.find((r) => r.fromCityId === fromCityId && r.toCityId === toCityId)
}

export function filterBoardingPointsByCity(boardingPoints: BoardingPoint[], cityId: number): BoardingPoint[] {
  return boardingPoints.filter((bp) => bp.cityId === cityId)
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function formatRouteHeading(fromCity: City, toCity: City, isoDate: string): string {
  const [, month, day] = isoDate.split('-').map(Number)
  const monthName = MONTH_NAMES[month - 1]
  const dayPadded = String(day).padStart(2, '0')
  return `${fromCity.name} → ${toCity.name} · ${dayPadded} ${monthName}`
}
