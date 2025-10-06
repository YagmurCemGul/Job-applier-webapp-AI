import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useOffersStore } from '@/store/offersStore'
import { useNavigate } from 'react-router-dom'
import { parseOfferFromText } from '@/services/offer/importers.service'
import type { CurrencyCode } from '@/types/offer.types'

export default function OfferCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { upsert } = useOffersStore()
  const navigate = useNavigate()

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [baseAnnual, setBaseAnnual] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
  const [pasteText, setPasteText] = useState('')

  const handleParse = () => {
    const parsed = parseOfferFromText(pasteText)
    if (parsed.company) setCompany(parsed.company)
    if (parsed.role) setRole(parsed.role)
    if (parsed.baseAnnual) setBaseAnnual(String(parsed.baseAnnual))
    if (parsed.currency) setCurrency(parsed.currency)
  }

  const handleCreate = () => {
    const offer = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      company,
      role,
      baseAnnual: Number(baseAnnual) || 0,
      currency,
      stage: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    upsert(offer)
    onOpenChange(false)
    navigate(`/offers/${offer.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Quick Import (paste offer email/letter)</Label>
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your offer email here..."
              className="min-h-[100px]"
            />
            <Button onClick={handleParse} variant="outline" size="sm" className="mt-2">
              Parse & Fill
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="grid gap-3">
              <div>
                <Label>Company</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <Label>Role</Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Base Annual</Label>
                  <Input
                    type="number"
                    value={baseAnnual}
                    onChange={(e) => setBaseAnnual(e.target.value)}
                    placeholder="120000"
                  />
                </div>

                <div>
                  <Label>Currency</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="TRY">TRY</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleCreate} className="w-full">
                Create Offer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
