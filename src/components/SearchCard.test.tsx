import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HttpResponse, http } from 'msw'
import SearchCard from './SearchCard'
import { server } from '../mocks/server'

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

async function waitForCitiesToLoad() {
  await waitFor(() => {
    expect(screen.getByRole('combobox', { name: 'From' })).toHaveAttribute('placeholder', 'From')
  })
}

describe('SearchCard', () => {
  it('selects Pune in the From field and stores its cityId, reflected in the displayed text', async () => {
    renderSearchCard()
    await waitForCitiesToLoad()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    selectCity(fromInput, 'pu')

    expect(fromInput).toHaveValue('Pune')
  })

  it('shows distinct errors next to From and To when both are empty on Search', async () => {
    renderSearchCard()
    await waitForCitiesToLoad()
    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    expect(screen.getByText('Please select a departure city')).toBeInTheDocument()
    expect(screen.getByText('Please select a destination city')).toBeInTheDocument()
  })

  it('shows an error on both fields when the same city is selected for From and To', async () => {
    renderSearchCard()
    await waitForCitiesToLoad()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    selectCity(fromInput, 'pu')
    selectCity(toInput, 'pu')

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    const errors = screen.getAllByText('From and To cities must be different')
    expect(errors).toHaveLength(2)
  })

  it('does not show errors when From and To are different valid cities', async () => {
    renderSearchCard()
    await waitForCitiesToLoad()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    selectCity(fromInput, 'pu')
    selectCity(toInput, 'b')

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    expect(screen.queryByText('Please select a departure city')).not.toBeInTheDocument()
    expect(screen.queryByText('Please select a destination city')).not.toBeInTheDocument()
    expect(screen.queryByText('From and To cities must be different')).not.toBeInTheDocument()
  })

  it('swaps the selected From and To cities when the swap button is clicked', async () => {
    renderSearchCard()
    await waitForCitiesToLoad()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    selectCity(fromInput, 'pu')
    selectCity(toInput, 'b')

    fireEvent.click(screen.getByRole('button', { name: 'Swap cities' }))

    expect(fromInput).toHaveValue('Bengaluru')
    expect(toInput).toHaveValue('Pune')
  })

  it('renders a native date input with min set to today and no Today/Tomorrow chips', async () => {
    renderSearchCard()
    await waitForCitiesToLoad()
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement
    expect(dateInput).toHaveAttribute('type', 'date')

    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(dateInput).toHaveAttribute('min', iso)
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tomorrow' })).not.toBeInTheDocument()
  })

  it('navigates to /search with from, to, and date query params when searching with valid cities', async () => {
    renderSearchCard()
    await waitForCitiesToLoad()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement

    selectCity(fromInput, 'pu')
    selectCity(toInput, 'b')
    fireEvent.change(dateInput, { target: { value: '2026-10-02' } })

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    expect(screen.getByText('Search results page')).toBeInTheDocument()
  })

  it('pre-fills from, to, and date from the URL on mount', async () => {
    renderSearchCard(['/?from=1&to=2&date=2026-10-02'])
    await waitForCitiesToLoad()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement

    await waitFor(() => expect(fromInput).toHaveValue('Pune'))
    expect(toInput).toHaveValue('Bengaluru')
    expect(dateInput).toHaveValue('2026-10-02')
  })

  it('leaves From/To blank and date defaulted to today when no query params are present', async () => {
    renderSearchCard()
    await waitForCitiesToLoad()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement

    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    expect(fromInput).toHaveValue('')
    expect(toInput).toHaveValue('')
    expect(dateInput).toHaveValue(iso)
  })

  it('shows a loading indicator before the city list resolves', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    expect(fromInput).toHaveAttribute('placeholder', 'Loading cities…')
  })

  it('shows an error with a retry that recovers when loading cities fails', async () => {
    server.use(
      http.get('/api/cities', () => new HttpResponse(null, { status: 500 })),
    )

    renderSearchCard()

    expect(await screen.findByText("Couldn't load cities.")).toBeInTheDocument()

    server.resetHandlers()

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitForCitiesToLoad()
    expect(screen.queryByText("Couldn't load cities.")).not.toBeInTheDocument()
  })
})
