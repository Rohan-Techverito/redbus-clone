import { boardingPoints, cities, routes } from '../data'
import type { BoardingPoint, City, Route } from '../types'

export const mockCities: City[] = cities

export const mockBoardingPoints: BoardingPoint[] = [
  ...boardingPoints,
  // Intentionally invalid: no city with id 99 exists, used to exercise the
  // "Unknown city" fallback end-to-end.
  { id: 99, name: 'Unknown Stop', address: 'Nowhere Road', landmark: 'Near nothing', cityId: 99 },
]

export const mockRoutes: Route[] = routes
