import { useParams } from 'react-router-dom'
import { useOffersStore } from '@/store/offersStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, Gift, TrendingUp, Calendar, MessageSquare, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { totalComp } from '@/services/offer/compMath.service'
import { useState, useEffect } from 'react'
import type { CompResult } from '@/types/offer.types'

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>()
  const { getById, setStage } = useOffersStore()
  const offer = getById(id || '')
  const [comp1yr, setComp1yr] = useState<CompResult | null>(null)

  useEffect(() => {
    if (offer) {
      totalComp(offer, { horizonYears: 1, taxRatePct: 30, fxBase: 'USD' }).then(setComp1yr)
    }
  }, [offer])

  if (!offer) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Offer not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
        <div className="text-xs text-yellow-800">
          ⚠️ Estimates only — not financial or tax advice
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{offer.company}</h1>
            <Badge variant="outline">{offer.stage}</Badge>
          </div>
          <p className="text-muted-foreground">{offer.role}</p>
          {comp1yr && (
            <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
              <span>1yr: ${Math.round(comp1yr.normalized / 1000)}k</span>
              <span>2yr est: ${Math.round((comp1yr.normalized * 2) / 1000)}k</span>
              <span>4yr est: ${Math.round((comp1yr.normalized * 4) / 1000)}k</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setStage(offer.id, 'accepted')}>
            Accept
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStage(offer.id, 'declined')}>
            Decline
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="compensation">
            <DollarSign className="mr-2 h-4 w-4" />
            Compensation
          </TabsTrigger>
          <TabsTrigger value="benefits">
            <Gift className="mr-2 h-4 w-4" />
            Benefits
          </TabsTrigger>
          <TabsTrigger value="equity">
            <TrendingUp className="mr-2 h-4 w-4" />
            Equity
          </TabsTrigger>
          <TabsTrigger value="deadlines">
            <Calendar className="mr-2 h-4 w-4" />
            Deadlines
          </TabsTrigger>
          <TabsTrigger value="negotiation">
            <MessageSquare className="mr-2 h-4 w-4" />
            Negotiation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <div className="text-sm font-medium">Base Salary</div>
                <div className="text-2xl font-bold">
                  {offer.currency} ${offer.baseAnnual.toLocaleString()}
                </div>
              </div>
              {offer.bonusTargetPct && (
                <div>
                  <div className="text-sm font-medium">Target Bonus</div>
                  <div className="text-lg">{offer.bonusTargetPct}%</div>
                </div>
              )}
              {offer.location && (
                <div>
                  <div className="text-sm font-medium">Location</div>
                  <div>{offer.location}</div>
                </div>
              )}
              {offer.remote && (
                <div>
                  <div className="text-sm font-medium">Work Mode</div>
                  <div className="capitalize">{offer.remote.replace('_', ' ')}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compensation">
          <Card>
            <CardContent className="p-6">
              {comp1yr ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Base</div>
                      <div className="text-lg font-medium">${Math.round(comp1yr.base / 1000)}k</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Bonus</div>
                      <div className="text-lg font-medium">
                        ${Math.round(comp1yr.bonus / 1000)}k
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Equity (annualized)</div>
                      <div className="text-lg font-medium">
                        ${Math.round(comp1yr.equity / 1000)}k
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Benefits</div>
                      <div className="text-lg font-medium">
                        $
                        {Math.round(
                          (comp1yr.benefits.signingSpread + comp1yr.benefits.annualValue) / 1000
                        )}
                        k
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm text-muted-foreground">Total (post-tax, 1yr)</div>
                    <div className="text-2xl font-bold">${Math.round(comp1yr.postTax / 1000)}k</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">Calculating...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Benefits details - coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equity">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Equity details - coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Deadlines management - coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negotiation">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Negotiation coach - coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
