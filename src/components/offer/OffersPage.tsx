import { useState } from 'react'
import { useOffersStore } from '@/store/offersStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, DollarSign, AlertCircle } from 'lucide-react'
import OfferCreateDialog from './OfferCreateDialog'
import { useNavigate } from 'react-router-dom'
import { totalComp } from '@/services/offer/compMath.service'
import { useEffect } from 'react'

export default function OffersPage() {
  const { items } = useOffersStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [compTotals, setCompTotals] = useState<Record<string, number>>({})
  const navigate = useNavigate()

  // Calculate 1yr totals for display
  useEffect(() => {
    const calculateTotals = async () => {
      const totals: Record<string, number> = {}
      for (const offer of items) {
        try {
          const result = await totalComp(offer, {
            horizonYears: 1,
            taxRatePct: 30,
            fxBase: 'USD',
          })
          totals[offer.id] = result.normalized
        } catch {
          totals[offer.id] = offer.baseAnnual
        }
      }
      setCompTotals(totals)
    }
    calculateTotals()
  }, [items])

  const filtered = items.filter((o) => {
    const matchesSearch =
      o.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.role.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStage = stageFilter === 'all' || o.stage === stageFilter

    return matchesSearch && matchesStage
  })

  const stages = ['all', 'draft', 'received', 'negotiating', 'accepted', 'declined']

  // Check for urgent deadlines
  const hasUrgentDeadline = (offer: any) => {
    if (!offer.deadlines) return false
    const now = new Date()
    const urgentThreshold = new Date(now.getTime() + 72 * 3600 * 1000) // 72 hours
    return offer.deadlines.some((d: any) => new Date(d.atISO) <= urgentThreshold)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Offers</h1>
        <div className="flex gap-2">
          <Button variant="outline">Compare</Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Offer
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
        <div className="text-xs text-yellow-800">
          ⚠️ Estimates only — not financial or tax advice
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search offers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-md border px-3 py-2"
        >
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage === 'all' ? 'All Stages' : stage}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.map((offer) => (
          <Card
            key={offer.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/offers/${offer.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{offer.company}</h3>
                    <Badge variant="outline">{offer.stage}</Badge>
                    {hasUrgentDeadline(offer) && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{offer.role}</p>
                  {offer.location && (
                    <p className="text-xs text-muted-foreground">
                      {offer.location} •{' '}
                      {offer.remote === 'remote'
                        ? 'Remote'
                        : offer.remote === 'hybrid'
                          ? 'Hybrid'
                          : 'On-site'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <DollarSign className="h-4 w-4" />
                    {compTotals[offer.id]
                      ? `$${Math.round(compTotals[offer.id] / 1000)}k`
                      : `$${Math.round(offer.baseAnnual / 1000)}k`}
                  </div>
                  <div className="text-xs text-muted-foreground">1yr total (est)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">No offers found</div>
        )}
      </div>

      <OfferCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
