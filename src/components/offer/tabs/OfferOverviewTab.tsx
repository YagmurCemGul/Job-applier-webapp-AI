/**
 * @fileoverview Offer overview tab for Step 37
 * @module components/offer/tabs/OfferOverviewTab
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, DollarSign, Calendar, Mail, FileText } from 'lucide-react';
import type { Offer } from '@/types/offer.types';
import { getDeadlineStatus } from '@/services/offer/deadline.service';

interface OfferOverviewTabProps {
  offer: Offer;
  totalComp?: {
    gross: number;
    postTax: number;
    normalized: number;
    currency: string;
  };
}

export function OfferOverviewTab({ offer, totalComp }: OfferOverviewTabProps) {
  const { t } = useTranslation();

  const stageColors: Record<string, string> = {
    draft: 'bg-gray-500',
    received: 'bg-blue-500',
    negotiating: 'bg-yellow-500',
    accepted: 'bg-green-500',
    declined: 'bg-red-500',
    expired: 'bg-gray-400'
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Base Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offer.baseAnnual.toLocaleString()} {offer.currency}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Comp (1Y)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalComp ? `${totalComp.gross.toLocaleString()} ${totalComp.currency}` : 'Calculating...'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={stageColors[offer.stage]}>
              {t(`offer.stages.${offer.stage}`)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Building className="h-4 w-4" />
                <span>Company</span>
              </div>
              <p className="font-medium">{offer.company}</p>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Role</div>
              <p className="font-medium">{offer.role}</p>
            </div>

            {offer.level && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Level</div>
                <p className="font-medium">{offer.level}</p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </div>
              <p className="font-medium">{offer.location ?? 'Not specified'}</p>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Remote Policy</div>
              <p className="font-medium">{t(`offer.remote.${offer.remote ?? 'on_site'}`)}</p>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Target Bonus</div>
              <p className="font-medium">{offer.bonusTargetPct ?? 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deadlines */}
      {offer.deadlines && offer.deadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {offer.deadlines.map((deadline) => {
                const status = getDeadlineStatus(deadline.atISO);
                const statusColors = {
                  past: 'text-gray-500',
                  approaching: 'text-orange-600 font-semibold',
                  future: 'text-blue-600'
                };

                return (
                  <div
                    key={deadline.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{deadline.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`offer.deadlines.kinds.${deadline.kind}`)}
                      </p>
                    </div>
                    <div className={`text-sm ${statusColors[status]}`}>
                      {new Date(deadline.atISO).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Email Recruiter
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Add Reminder
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
