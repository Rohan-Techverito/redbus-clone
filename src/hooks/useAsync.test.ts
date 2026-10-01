import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useAsync } from './useAsync'

describe('useAsync', () => {
  it('transitions from idle to loading to success', async () => {
    const asyncFn = vi.fn().mockResolvedValue('hello')
    const { result } = renderHook(() => useAsync(asyncFn, []))

    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.data).toBe('hello')
    expect(result.current.error).toBeNull()
  })

  it('transitions from idle to loading to error', async () => {
    const asyncFn = vi.fn().mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useAsync(asyncFn, []))

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('boom')
  })

  it('retry() re-runs the function and can recover from error to success', async () => {
    const asyncFn = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('recovered')
    const { result } = renderHook(() => useAsync(asyncFn, []))

    await waitFor(() => expect(result.current.status).toBe('error'))

    act(() => {
      result.current.retry()
    })

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.data).toBe('recovered')
    expect(asyncFn).toHaveBeenCalledTimes(2)
  })
})
