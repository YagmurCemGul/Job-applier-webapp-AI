import { useApplicationsStore } from '@/store/applicationsStore'

/**
 * Application insights and funnel statistics
 */
export function funnel(): {
  applied: number
  viewed: number
  interview: number
  offer: number
  rejected: number
  hold: number
} {
  const list = useApplicationsStore.getState().items
  const g = (k: string) => list.filter((x) => x.stage === k).length

  return {
    applied: g('applied'),
    viewed: g('viewed'),
    interview: g('interview'),
    offer: g('offer'),
    rejected: g('rejected'),
    hold: g('hold')
  }
}
