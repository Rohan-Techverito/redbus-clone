import { useState } from 'react'
import CityAutocomplete from './CityAutocomplete'
import { cities } from '../data'
import type { City } from '../types'

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}, ${d.getFullYear()}`

function SearchCard() {
  const [today] = useState(() => new Date())
  const [dayOffset, setDayOffset] = useState(0)
  const [forWomen, setForWomen] = useState(false)

  const [fromCityId, setFromCityId] = useState<City['id'] | null>(null)
  const [toCityId, setToCityId] = useState<City['id'] | null>(null)
  const [fromError, setFromError] = useState<string | null>(null)
  const [toError, setToError] = useState<string | null>(null)

  const date = new Date(today)
  date.setDate(today.getDate() + dayOffset)

  const handleSwap = () => {
    setFromCityId(toCityId)
    setToCityId(fromCityId)
  }

  const handleSearch = () => {
    let nextFromError: string | null = null
    let nextToError: string | null = null

    if (fromCityId === null) {
      nextFromError = 'Please select a departure city'
    }
    if (toCityId === null) {
      nextToError = 'Please select a destination city'
    }
    if (fromCityId !== null && toCityId !== null && fromCityId === toCityId) {
      nextFromError = 'From and To cities must be different'
      nextToError = 'From and To cities must be different'
    }

    setFromError(nextFromError)
    setToError(nextToError)
  }

  return (
    <div className="search-card">
      <div className="search-row">
        <div className="search-fields">
          <div className="field city-field">
            <span className="field-icon">🚌</span>
            <CityAutocomplete
              cities={cities}
              value={fromCityId}
              onChange={setFromCityId}
              id="from-city"
              ariaLabel="From"
              placeholder="From"
              error={fromError ?? undefined}
            />
          </div>
          <button type="button" className="swap-btn" aria-label="Swap cities" onClick={handleSwap}>
            ⇄
          </button>
          <div className="field city-field">
            <span className="field-icon">🚌</span>
            <CityAutocomplete
              cities={cities}
              value={toCityId}
              onChange={setToCityId}
              id="to-city"
              ariaLabel="To"
              placeholder="To"
              error={toError ?? undefined}
            />
          </div>
          <div className="field date-field">
            <span className="field-icon">📅</span>
            <div className="date-text">
              <small>Date of Journey</small>
              <strong>{formatDate(date)}</strong>
              <em>{dayOffset === 0 ? '(Today)' : '(Tomorrow)'}</em>
            </div>
            <button type="button" className={`chip ${dayOffset === 0 ? 'chip-active' : ''}`} onClick={() => setDayOffset(0)}>
              Today
            </button>
            <button type="button" className={`chip ${dayOffset === 1 ? 'chip-active' : ''}`} onClick={() => setDayOffset(1)}>
              Tomorrow
            </button>
          </div>
        </div>
        <div className="women-box">
          <span className="women-icon">👩</span>
          <div>
            <div>Booking for women</div>
            <a href="#">Know more</a>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={forWomen}
            aria-label="Booking for women"
            className={`toggle ${forWomen ? 'on' : ''}`}
            onClick={() => setForWomen((v) => !v)}
          />
        </div>
      </div>
      <button type="button" className="search-btn" onClick={handleSearch}>⌕ Search buses</button>
    </div>
  )
}

export default SearchCard
