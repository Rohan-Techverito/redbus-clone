import { useMemo } from 'react'
import type { BoardingPoint, City } from '../types'

interface Props {
  cities: City[]
  boardingPoints: BoardingPoint[]
}

function BoardingPointList({ cities, boardingPoints }: Props) {
  const cityById = useMemo(() => new Map(cities.map((c) => [c.id, c])), [cities])

  return (
    <ul className="bp-grid">
      {boardingPoints.map((bp) => {
        const city = cityById.get(bp.cityId)
        if (!city) {
          console.warn(`BoardingPoint ${bp.id} ("${bp.name}") references unknown cityId ${bp.cityId}`)
        }
        return (
          <li key={bp.id} className="bp-card">
            <strong>{bp.name}</strong> — {bp.address}, {bp.landmark}
            {city ? ` (${city.name}, ${city.state})` : ' (Unknown city)'}
          </li>
        )
      })}
    </ul>
  )
}

export default BoardingPointList
