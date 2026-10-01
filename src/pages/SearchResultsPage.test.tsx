import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HttpResponse, http } from 'msw'
import SearchResultsPage from './SearchResultsPage'
import { server } from '../mocks/server'

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
  it('shows the route heading and only the boarding points for the departure city', async () => {
    renderResultsPage('/search?from=1&to=2&date=2026-10-02')

    expect(await screen.findByText('Pune → Bengaluru · 02 Oct')).toBeInTheDocument()
    expect(await screen.findByText(/Shivajinagar/)).toBeInTheDocument()
    expect(screen.getByText(/Hinjewadi/)).toBeInTheDocument()
    expect(screen.queryByText(/Majestic/)).not.toBeInTheDocument()
  })

  it('reproduces the same result when the URL is loaded directly', async () => {
    renderResultsPage('/search?from=1&to=2&date=2026-10-02')

    const items = await screen.findAllByRole('listitem')
    expect(items).toHaveLength(2)
  })

  it('shows an empty-state message when no route connects the two cities', async () => {
    renderResultsPage('/search?from=2&to=1&date=2026-10-02')

    expect(await screen.findByText('No buses found on this route.')).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('shows an error state for an unknown city id', async () => {
    renderResultsPage('/search?from=999&to=2&date=2026-10-02')

    expect(await screen.findByText("We couldn't load these results")).toBeInTheDocument()
  })

  it('shows an error state for an invalid date', async () => {
    renderResultsPage('/search?from=1&to=2&date=not-a-date')

    expect(await screen.findByText("We couldn't load these results")).toBeInTheDocument()
  })

  it('shows a screen-level error with a working retry when the API fails', async () => {
    let shouldFail = true
    server.use(
      http.get('/api/cities', () => {
        if (shouldFail) {
          return new HttpResponse(null, { status: 500 })
        }
        return HttpResponse.json([
          { id: 1, name: 'Pune', state: 'Maharashtra' },
          { id: 2, name: 'Bengaluru', state: 'Karnataka' },
        ])
      }),
    )

    renderResultsPage('/search?from=1&to=2&date=2026-10-02')

    expect(await screen.findByText("We couldn't load the search results.")).toBeInTheDocument()

    shouldFail = false
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(screen.queryByText("We couldn't load the search results.")).not.toBeInTheDocument()
    })
    expect(await screen.findByText('Pune → Bengaluru · 02 Oct')).toBeInTheDocument()
  })
})
