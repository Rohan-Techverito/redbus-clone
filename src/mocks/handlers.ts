import { http, HttpResponse } from 'msw'
import { mockBoardingPoints, mockCities, mockRoutes } from './data'

export const handlers = [
  http.get('/api/cities', ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('fail') === '1') {
      return new HttpResponse(null, { status: 500 })
    }
    return HttpResponse.json(mockCities)
  }),

  http.get('/api/boarding-points', ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('fail') === '1') {
      return new HttpResponse(null, { status: 500 })
    }
    const cityIdRaw = url.searchParams.get('cityId')
    if (cityIdRaw !== null) {
      const cityId = Number(cityIdRaw)
      return HttpResponse.json(mockBoardingPoints.filter((bp) => bp.cityId === cityId))
    }
    return HttpResponse.json(mockBoardingPoints)
  }),

  http.get('/api/routes', ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('fail') === '1') {
      return new HttpResponse(null, { status: 500 })
    }
    return HttpResponse.json(mockRoutes)
  }),
]
