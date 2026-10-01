import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SearchCard from './SearchCard'

function selectCity(input: HTMLElement, text: string) {
  fireEvent.change(input, { target: { value: text } })
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  fireEvent.keyDown(input, { key: 'Enter' })
}

function renderSearchCard(initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<SearchCard />} />
        <Route path="/search" element={<div>Search results page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SearchCard', () => {
  it('selects Pune in the From field and stores its cityId, reflected in the displayed text', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    selectCity(fromInput, 'pu')

    expect(fromInput).toHaveValue('Pune')
  })

  it('shows distinct errors next to From and To when both are empty on Search', () => {
    renderSearchCard()
    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    expect(screen.getByText('Please select a departure city')).toBeInTheDocument()
    expect(screen.getByText('Please select a destination city')).toBeInTheDocument()
  })

  it('shows an error on both fields when the same city is selected for From and To', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    selectCity(fromInput, 'pu')
    selectCity(toInput, 'pu')

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    const errors = screen.getAllByText('From and To cities must be different')
    expect(errors).toHaveLength(2)
  })

  it('does not show errors when From and To are different valid cities', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    selectCity(fromInput, 'pu')
    selectCity(toInput, 'b')

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    expect(screen.queryByText('Please select a departure city')).not.toBeInTheDocument()
    expect(screen.queryByText('Please select a destination city')).not.toBeInTheDocument()
    expect(screen.queryByText('From and To cities must be different')).not.toBeInTheDocument()
  })

  it('swaps the selected From and To cities when the swap button is clicked', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    selectCity(fromInput, 'pu')
    selectCity(toInput, 'b')

    fireEvent.click(screen.getByRole('button', { name: 'Swap cities' }))

    expect(fromInput).toHaveValue('Bengaluru')
    expect(toInput).toHaveValue('Pune')
  })

  it('renders a native date input with min set to today and no Today/Tomorrow chips', () => {
    renderSearchCard()
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement
    expect(dateInput).toHaveAttribute('type', 'date')

    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(dateInput).toHaveAttribute('min', iso)
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tomorrow' })).not.toBeInTheDocument()
  })

  it('navigates to /search with from, to, and date query params when searching with valid cities', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement

    selectCity(fromInput, 'pu')
    selectCity(toInput, 'b')
    fireEvent.change(dateInput, { target: { value: '2026-10-02' } })

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    expect(screen.getByText('Search results page')).toBeInTheDocument()
  })

  it('pre-fills from, to, and date from the URL on mount', () => {
    renderSearchCard(['/?from=1&to=2&date=2026-10-02'])
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement

    expect(fromInput).toHaveValue('Pune')
    expect(toInput).toHaveValue('Bengaluru')
    expect(dateInput).toHaveValue('2026-10-02')
  })

  it('leaves From/To blank and date defaulted to today when no query params are present', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement

    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    expect(fromInput).toHaveValue('')
    expect(toInput).toHaveValue('')
    expect(dateInput).toHaveValue(iso)
  })
})
