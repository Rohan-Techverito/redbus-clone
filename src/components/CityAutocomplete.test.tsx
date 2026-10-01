import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CityAutocomplete from './CityAutocomplete'
import type { City } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

function renderAutocomplete(value: City['id'] | null = null, onChange = vi.fn()) {
  render(
    <CityAutocomplete
      cities={cities}
      value={value}
      onChange={onChange}
      id="from"
      ariaLabel="From"
      placeholder="From"
    />,
  )
  return { onChange }
}

describe('CityAutocomplete', () => {
  it('does not show suggestions with 0 characters typed', () => {
    renderAutocomplete()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows a matching suggestion with secondary state text when typing a prefix', () => {
    renderAutocomplete()
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Pune')
    expect(options[0]).toHaveTextContent('Maharashtra')
  })

  it('selects a suggestion via ArrowDown then Enter, calling onChange with the numeric city id', () => {
    const { onChange } = renderAutocomplete()
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith(1)
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('sets aria-activedescendant to the currently highlighted option while open', () => {
    renderAutocomplete()
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'b' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    const option = screen.getByRole('option')
    expect(input).toHaveAttribute('aria-activedescendant', option.id)
  })

  it('closes the listbox on Escape without calling onChange', () => {
    const { onChange } = renderAutocomplete()
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears the input text on blur when no suggestion was selected', () => {
    const { onChange } = renderAutocomplete()
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    fireEvent.blur(input)

    expect(input).toHaveValue('')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('re-syncs displayed text to the city name when value changes externally', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <CityAutocomplete cities={cities} value={null} onChange={onChange} id="from" ariaLabel="From" placeholder="From" />,
    )
    const input = screen.getByRole('combobox')
    expect(input).toHaveValue('')

    rerender(
      <CityAutocomplete cities={cities} value={2} onChange={onChange} id="from" ariaLabel="From" placeholder="From" />,
    )
    expect(input).toHaveValue('Bengaluru')
  })
})
