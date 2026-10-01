import { useEffect, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { City } from '../types'

export interface CityAutocompleteProps {
  cities: City[]
  value: City['id'] | null
  onChange: (cityId: City['id'] | null) => void
  id: string
  ariaLabel: string
  placeholder: string
  error?: string
}

function CityAutocomplete({ cities, value, onChange, id, ariaLabel, placeholder, error }: CityAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  // Re-sync the displayed text whenever the controlled value changes from
  // outside this component (e.g. a swap, or the parent resetting it).
  useEffect(() => {
    const city = value !== null ? cities.find((c) => c.id === value) ?? null : null
    setQuery(city ? city.name : '')
  }, [value, cities])

  const suggestions =
    query.length >= 1 ? cities.filter((c) => c.name.toLowerCase().startsWith(query.toLowerCase())) : []

  const listboxId = `${id}-listbox`
  const getOptionId = (index: number) => `${id}-option-${index}`

  const closeList = () => {
    setIsOpen(false)
    setHighlightedIndex(0)
  }

  const commitSelection = (city: City) => {
    setQuery(city.name)
    onChange(city.id)
    closeList()
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setQuery(text)
    setIsOpen(true)
    setHighlightedIndex(0)
    if (value !== null) {
      onChange(null)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setHighlightedIndex(0)
        return
      }
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) return
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (isOpen && suggestions[highlightedIndex]) {
        e.preventDefault()
        commitSelection(suggestions[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault()
        closeList()
      }
    }
  }

  const handleBlur = () => {
    closeList()
    if (value === null) {
      setQuery('')
      onChange(null)
    }
  }

  const handleFocus = () => {
    if (query.length >= 1) {
      setIsOpen(true)
    }
  }

  const activeDescendant = isOpen && suggestions[highlightedIndex] ? getOptionId(highlightedIndex) : undefined

  return (
    <div className="city-autocomplete">
      <input
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        placeholder={placeholder}
        autoComplete="off"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
      {isOpen && suggestions.length > 0 && (
        <ul id={listboxId} role="listbox" className="city-suggestions">
          {suggestions.map((city, index) => (
            <li
              key={city.id}
              id={getOptionId(index)}
              role="option"
              aria-selected={index === highlightedIndex}
              className={`city-suggestion ${index === highlightedIndex ? 'highlighted' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                commitSelection(city)
              }}
            >
              <span className="city-suggestion-name">{city.name}</span>
              <span className="city-suggestion-state">{city.state}</span>
            </li>
          ))}
        </ul>
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default CityAutocomplete
