/**
 * @fileoverview Analytics panel component for Step 44
 * @module components/offers/AnalyticsPanel
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOffers } from '@/stores/offers.store.step44';
import { useNegotiation } from '@/stores/negotiation.store.step44';

/**
 * Analytics panel for offer metrics
 */
export function AnalyticsPanel() {
  const { items } = useOffers();
  const { counters } = useNegotiation();

  const stats = useMemo(() => {
    const total = items.length;
    const countersCount = counters.length;
    const accepted = counters.filter(c => c.status === 'accepted').length;
    
    return {
      total,
      countersCount,
      accepted,
      conversionRate: countersCount > 0 ? ((accepted / countersCount) * 100).toFixed(1) : '0'
    };
  }, [items, counters]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Counter Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.countersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
