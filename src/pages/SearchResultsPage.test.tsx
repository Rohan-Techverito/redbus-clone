import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SearchResultsPage from './SearchResultsPage'

function renderResultsPage(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/search" element={<SearchResultsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SearchResultsPage', () => {
  it('shows the route heading and only the boarding points for the departure city', () => {
    renderResultsPage('/search?from=1&to=2&date=2026-10-02')

    expect(screen.getByText('Pune → Bengaluru · 02 Oct')).toBeInTheDocument()
    expect(screen.getByText(/Shivajinagar/)).toBeInTheDocument()
    expect(screen.getByText(/Hinjewadi/)).toBeInTheDocument()
    expect(screen.queryByText(/Majestic/)).not.toBeInTheDocument()
  })

  it('reproduces the same result when the URL is loaded directly', () => {
    renderResultsPage('/search?from=1&to=2&date=2026-10-02')

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
  })

  it('shows an empty-state message when no route connects the two cities', () => {
    renderResultsPage('/search?from=2&to=1&date=2026-10-02')

    expect(screen.getByText('No buses found on this route.')).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('shows an error state for an unknown city id', () => {
    renderResultsPage('/search?from=999&to=2&date=2026-10-02')

    expect(screen.getByText("We couldn't load these results")).toBeInTheDocument()
  })

  it('shows an error state for an invalid date', () => {
    renderResultsPage('/search?from=1&to=2&date=not-a-date')

    expect(screen.getByText("We couldn't load these results")).toBeInTheDocument()
  })
})
