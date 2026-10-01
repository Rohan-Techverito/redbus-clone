import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { HttpResponse, http } from 'msw'
import HomePage from './HomePage'
import { server } from '../mocks/server'

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('shows a loading skeleton before boarding points resolve', () => {
    renderHomePage()
    expect(screen.getByText('Boarding Points').closest('section')).toBeInTheDocument()
    expect(document.querySelectorAll('.skeleton-card').length).toBeGreaterThan(0)
  })

  it('renders boarding points once data resolves', async () => {
    renderHomePage()
    expect(await screen.findByText(/Shivajinagar/)).toBeInTheDocument()
    expect(screen.getByText(/Hinjewadi/)).toBeInTheDocument()
    expect(screen.getByText(/Majestic/)).toBeInTheDocument()
  })

  it('shows an error state with a working retry when the boarding points request fails', async () => {
    let shouldFail = true
    server.use(
      http.get('/api/boarding-points', () => {
        if (shouldFail) {
          return new HttpResponse(null, { status: 500 })
        }
        return HttpResponse.json([])
      }),
    )

    renderHomePage()

    expect(await screen.findByText("We couldn't load the boarding points.")).toBeInTheDocument()

    shouldFail = false
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(screen.queryByText("We couldn't load the boarding points.")).not.toBeInTheDocument()
    })
  })
})
