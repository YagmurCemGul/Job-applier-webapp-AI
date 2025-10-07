import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { enUS, tr } from 'date-fns/locale'
import i18n from '@/config/i18n'

// Get current locale
const getLocale = () => {
  const lang = i18n.language
  return lang === 'tr' ? tr : enUS
}

// Format date
export function formatDate(date: Date | string, formatStr: string = 'PP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: getLocale() })
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: getLocale() })
}

// Format currency
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale?: string
): string {
  const currentLocale = locale || i18n.language
  const localeMap: Record<string, string> = {
    en: 'en-US',
    tr: 'tr-TR',
  }

  return new Intl.NumberFormat(localeMap[currentLocale] || 'en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Format number
export function formatNumber(num: number, locale?: string): string {
  const currentLocale = locale || i18n.language
  const localeMap: Record<string, string> = {
    en: 'en-US',
    tr: 'tr-TR',
  }

  return new Intl.NumberFormat(localeMap[currentLocale] || 'en-US').format(num)
}

// Format percentage
export function formatPercentage(num: number, decimals: number = 0): string {
  return `${num.toFixed(decimals)}%`
}

// Format file size
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}