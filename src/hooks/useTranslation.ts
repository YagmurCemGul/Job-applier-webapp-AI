import { useTranslation as useI18nTranslation } from 'react-i18next'

// Re-export with type safety
export function useTranslation(ns?: string | string[]) {
  return useI18nTranslation(ns)
}

// Shorthand for common namespace
export function useCommonTranslation() {
  return useI18nTranslation('common')
}

export function useCVTranslation() {
  return useI18nTranslation('cv')
}

export function useJobsTranslation() {
  return useI18nTranslation('jobs')
}

export function useAuthTranslation() {
  return useI18nTranslation('auth')
}

export function useErrorsTranslation() {
  return useI18nTranslation('errors')
}
