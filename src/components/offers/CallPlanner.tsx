/**
 * @fileoverview Call planner component for Step 44
 * @module components/offers/CallPlanner
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

/**
 * Call planner for scheduling negotiation calls
 */
export function CallPlanner() {
  const { t } = useTranslation();
  
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [attendees, setAttendees] = useState('');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('offer.scheduleCall', 'Schedule Negotiation Call')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Call Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Offer Discussion - Company Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="datetime">Date & Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees (comma-separated emails)</Label>
            <Input
              id="attendees"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="recruiter@company.com, manager@company.com"
            />
          </div>

          <Button className="w-full" disabled>
            <Calendar className="mr-2 h-4 w-4" />
            {t('offer.scheduleCall', 'Schedule Call')} (Calendar integration)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
