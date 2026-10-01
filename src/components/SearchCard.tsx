import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CityAutocomplete from './CityAutocomplete'
import { getCities } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import type { City } from '../types'

const toIsoDate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseCityId = (value: string | null, cities: City[]): City['id'] | null => {
  if (value === null) return null
  const id = Number(value)
  if (!Number.isInteger(id)) return null
  return cities.some((c) => c.id === id) ? id : null
}

function SearchCard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [today] = useState(() => new Date())
  const todayIso = toIsoDate(today)

  const [forWomen, setForWomen] = useState(false)

  const citiesAsync = useAsync(() => getCities(), [])
  const cities = citiesAsync.data ?? []

  const [fromCityId, setFromCityId] = useState<City['id'] | null>(null)
  const [toCityId, setToCityId] = useState<City['id'] | null>(null)
  const [date, setDate] = useState<string>(() => searchParams.get('date') ?? todayIso)
  const [fromError, setFromError] = useState<string | null>(null)
  const [toError, setToError] = useState<string | null>(null)

  // Once the city list has loaded, resolve any from/to city ids present in
  // the URL against it (they can't be validated before then).
  useEffect(() => {
    if (citiesAsync.status !== 'success' || !citiesAsync.data) return
    setFromCityId(parseCityId(searchParams.get('from'), citiesAsync.data))
    setToCityId(parseCityId(searchParams.get('to'), citiesAsync.data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citiesAsync.status, citiesAsync.data])

  const handleSwap = () => {
    setFromCityId(toCityId)
    setToCityId(fromCityId)
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
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

    if (!nextFromError && !nextToError && fromCityId !== null && toCityId !== null) {
      navigate(`/search?from=${fromCityId}&to=${toCityId}&date=${date}`)
    }
  }

  return (
    <div className="search-card">
      {citiesAsync.status === 'error' && (
        <div className="city-autocomplete-error">
          <span className="field-error">Couldn't load cities.</span>
          <button type="button" onClick={citiesAsync.retry}>Retry</button>
        </div>
      )}
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
              placeholder={citiesAsync.status === 'loading' ? 'Loading cities…' : 'From'}
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
              placeholder={citiesAsync.status === 'loading' ? 'Loading cities…' : 'To'}
              error={toError ?? undefined}
            />
          </div>
          <div className="field date-field">
            <span className="field-icon">📅</span>
            <div className="date-text">
              <small>Date of Journey</small>
              <input
                type="date"
                className="date-input"
                aria-label="Date of Journey"
                min={todayIso}
                value={date}
                onChange={handleDateChange}
              />
            </div>
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
