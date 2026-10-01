import { useSearchParams } from 'react-router-dom'
import BoardingPointList from '../components/BoardingPointList'
import { getBoardingPoints, getCities, getRoutes } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { findRoute, formatRouteHeading, parseSearchParams } from '../utils/searchResults'
import type { City } from '../types'

function ResultsSkeleton() {
  return (
    <ul className="bp-grid" aria-busy="true">
      {[1, 2, 3].map((n) => (
        <li key={n} className="bp-card skeleton-card">
          <span className="skeleton" />
        </li>
      ))}
    </ul>
  )
}

function SearchResultsPage() {
  const [searchParams] = useSearchParams()

  const citiesAsync = useAsync(() => getCities(), [])
  const routesAsync = useAsync(() => getRoutes(), [])

  const cities = citiesAsync.data ?? []
  const parsed = citiesAsync.status === 'success' ? parseSearchParams(searchParams, cities) : null
  const pendingFromCityId = parsed !== null && parsed.ok ? parsed.fromCityId : null

  const boardingPointsAsync = useAsync(
    () => (pendingFromCityId !== null ? getBoardingPoints({ cityId: pendingFromCityId }) : Promise.resolve([])),
    [pendingFromCityId],
  )

  if (citiesAsync.status === 'error') {
    return (
      <div className="container section">
        <div className="section-error">
          <p>We couldn't load the search results.</p>
          <button type="button" onClick={citiesAsync.retry}>Retry</button>
        </div>
      </div>
    )
  }

  if (citiesAsync.status !== 'success' || parsed === null) {
    return (
      <div className="container section">
        <ResultsSkeleton />
      </div>
    )
  }

  if (!parsed.ok) {
    return (
      <div className="container section">
        <div className="results-error">
          <h2>We couldn't load these results</h2>
          <p>{parsed.reason}</p>
        </div>
      </div>
    )
  }

  const { fromCityId, toCityId, date } = parsed
  const fromCity = cities.find((c: City) => c.id === fromCityId)!
  const toCity = cities.find((c: City) => c.id === toCityId)!

  if (routesAsync.status === 'error' || boardingPointsAsync.status === 'error') {
    return (
      <div className="container section">
        <div className="section-error">
          <p>We couldn't load the search results.</p>
          <button
            type="button"
            onClick={() => {
              routesAsync.retry()
              boardingPointsAsync.retry()
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (routesAsync.status !== 'success' || boardingPointsAsync.status !== 'success') {
    return (
      <div className="container section">
        <ResultsSkeleton />
      </div>
    )
  }

  const route = findRoute(routesAsync.data, fromCityId, toCityId)

  if (!route) {
    return (
      <div className="container section">
        <div className="section-head">
          <h2>{formatRouteHeading(fromCity, toCity, date)}</h2>
        </div>
        <div className="results-empty">
          <p>No buses found on this route.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <div className="section-head">
        <h2>{formatRouteHeading(fromCity, toCity, date)}</h2>
      </div>
      <BoardingPointList cities={[fromCity]} boardingPoints={boardingPointsAsync.data ?? []} />
    </div>
  )
}

export default SearchResultsPage
