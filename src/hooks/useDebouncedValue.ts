import { useEffect, useState } from 'react'

/**
 * Debounce a value change
 * Useful for search inputs and text areas
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setV(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return v
}
