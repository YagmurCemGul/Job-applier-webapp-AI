/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  return (
    error?.message?.includes('rate limit') ||
    error?.message?.includes('429') ||
    error?.status === 429
  )
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('network') ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('ECONNREFUSED')
  )
}

/**
 * Format API error message for user display
 */
export function formatAPIError(error: any): string {
  if (isRateLimitError(error)) {
    return 'Rate limit exceeded. Please try again in a few minutes.'
  }

  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.'
  }

  if (error?.message) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}
