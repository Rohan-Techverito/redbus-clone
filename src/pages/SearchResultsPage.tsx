import { useSearchParams } from 'react-router-dom'
import BoardingPointList from '../components/BoardingPointList'
import { boardingPoints, cities, routes } from '../data'
import { filterBoardingPointsByCity, findRoute, formatRouteHeading, parseSearchParams } from '../utils/searchResults'

function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const parsed = parseSearchParams(searchParams, cities)

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
  const fromCity = cities.find((c) => c.id === fromCityId)!
  const toCity = cities.find((c) => c.id === toCityId)!
  const route = findRoute(routes, fromCityId, toCityId)

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

  const matchingBoardingPoints = filterBoardingPointsByCity(boardingPoints, fromCityId)

  return (
    <div className="container section">
      <div className="section-head">
        <h2>{formatRouteHeading(fromCity, toCity, date)}</h2>
      </div>
      <BoardingPointList cities={[fromCity]} boardingPoints={matchingBoardingPoints} />
    </div>
  )
}

export default SearchResultsPage
