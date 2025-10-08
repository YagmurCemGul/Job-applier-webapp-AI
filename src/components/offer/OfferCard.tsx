/**
 * @fileoverview Offer card component for Step 37
 * @module components/offer/OfferCard
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, MapPin, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import type { Offer } from '@/types/offer.types';
import { isDeadlineApproaching } from '@/services/offer/deadline.service';

interface OfferCardProps {
  offer: Offer;
  onClick: () => void;
  onSelect?: (selected: boolean) => void;
  selected?: boolean;
}

export function OfferCard({ offer, onClick, onSelect, selected }: OfferCardProps) {
  const { t } = useTranslation();

  const stageColors: Record<string, string> = {
    draft: 'bg-gray-500',
    received: 'bg-blue-500',
    negotiating: 'bg-yellow-500',
    accepted: 'bg-green-500',
    declined: 'bg-red-500',
    expired: 'bg-gray-400'
  };

  const upcomingDeadline = offer.deadlines?.find(d => isDeadlineApproaching(d.atISO));

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              {offer.company}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{offer.role}</p>
          </div>
          <Badge className={stageColors[offer.stage]}>
            {t(`offer.stages.${offer.stage}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{offer.location ?? 'Remote'}</span>
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <DollarSign className="h-3 w-3" />
            <span>{offer.baseAnnual.toLocaleString()} {offer.currency}</span>
          </div>
        </div>

        {upcomingDeadline && (
          <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
            <AlertCircle className="h-3 w-3" />
            <span>
              {upcomingDeadline.label} - {new Date(upcomingDeadline.atISO).toLocaleDateString()}
            </span>
          </div>
        )}

        {onSelect && (
          <div className="pt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant={selected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelect(!selected)}
              className="w-full"
            >
              {selected ? 'Selected' : 'Select for Comparison'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
