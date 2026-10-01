import { useCallback, useEffect, useRef, useState } from 'react'

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseAsyncResult<T> {
  status: AsyncStatus
  data: T | null
  error: Error | null
  retry: () => void
}

export function useAsync<T>(asyncFn: () => Promise<T>, deps: unknown[]): UseAsyncResult<T> {
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Keep the latest factory available to retry() without forcing retry's
  // identity (or the effect) to depend on it.
  const asyncFnRef = useRef(asyncFn)
  asyncFnRef.current = asyncFn

  // Bump this to force a re-run (used by retry()) independently of deps.
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)

    asyncFnRef.current()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setStatus('success')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, retryCount])

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1)
  }, [])

  return { status, data, error, retry }
}
