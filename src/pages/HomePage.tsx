import BoardingPointList from '../components/BoardingPointList'
import Offers from '../components/Offers'
import SearchCard from '../components/SearchCard'
import { getBoardingPoints, getCities } from '../api/client'
import { useAsync } from '../hooks/useAsync'

function HomePage() {
  const citiesAsync = useAsync(() => getCities(), [])
  const boardingPointsAsync = useAsync(() => getBoardingPoints(), [])

  const renderSkeleton = () => (
    <ul className="bp-grid" aria-busy="true">
      {[1, 2, 3].map((n) => (
        <li key={n} className="bp-card skeleton-card">
          <span className="skeleton" />
        </li>
      ))}
    </ul>
  )

  const renderBoardingPointsSection = () => {
    if (citiesAsync.status === 'error') {
      return (
        <div className="section-error">
          <p>We couldn't load the boarding points.</p>
          <button type="button" onClick={citiesAsync.retry}>Retry</button>
        </div>
      )
    }

    if (citiesAsync.status !== 'success') {
      return renderSkeleton()
    }

    if (boardingPointsAsync.status === 'error') {
      return (
        <div className="section-error">
          <p>We couldn't load the boarding points.</p>
          <button type="button" onClick={boardingPointsAsync.retry}>Retry</button>
        </div>
      )
    }

    if (boardingPointsAsync.status !== 'success') {
      return renderSkeleton()
    }

    return <BoardingPointList cities={citiesAsync.data!} boardingPoints={boardingPointsAsync.data!} />
  }

  return (
    <>
      <section className="hero">
        <div className="hero-scene" aria-hidden="true">
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="road" />
          <div className="hero-bus">🚌</div>
        </div>
        <div className="container">
          <h1>
            India's No. 1 online
            <br />
            bus ticket booking site
          </h1>
        </div>
      </section>
      <div className="container search-wrap">
        <SearchCard />
      </div>
      <main>
        <Offers />
        <section className="container section">
          <div className="section-head">
            <h2>Boarding Points</h2>
          </div>
          {renderBoardingPointsSection()}
        </section>
      </main>
    </>
  )
}

export default HomePage
