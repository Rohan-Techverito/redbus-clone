import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SearchCard from './SearchCard'

function selectCity(input: HTMLElement, text: string) {
  fireEvent.change(input, { target: { value: text } })
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  fireEvent.keyDown(input, { key: 'Enter' })
}

describe('SearchCard', () => {
  it('selects Pune in the From field and stores its cityId, reflected in the displayed text', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    selectCity(fromInput, 'pu')

    expect(fromInput).toHaveValue('Pune')
  })

  it('shows distinct errors next to From and To when both are empty on Search', () => {
    render(<SearchCard />)
    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    expect(screen.getByText('Please select a departure city')).toBeInTheDocument()
    expect(screen.getByText('Please select a destination city')).toBeInTheDocument()
  })

  it('shows an error on both fields when the same city is selected for From and To', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    selectCity(fromInput, 'pu')
    selectCity(toInput, 'pu')

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    const errors = screen.getAllByText('From and To cities must be different')
    expect(errors).toHaveLength(2)
  })

  it('does not show errors when From and To are different valid cities', () => {
    render(<SearchCard />)
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
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    selectCity(fromInput, 'pu')
    selectCity(toInput, 'b')

    fireEvent.click(screen.getByRole('button', { name: 'Swap cities' }))

    expect(fromInput).toHaveValue('Bengaluru')
    expect(toInput).toHaveValue('Pune')
  })
})
