/**
 * @fileoverview Settings Sheet component
 * @module components/apply/SettingsSheet
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

export function SettingsSheet() {
  const { t } = useTranslation();
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');
  const [rateLimit, setRateLimit] = useState(5);
  const [followUpDays, setFollowUpDays] = useState(7);
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          {t('apply.settings')}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('apply.settings')}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="quiet-start">{t('apply.quietHoursStart')}</Label>
            <Input
              id="quiet-start"
              type="time"
              value={quietStart}
              onChange={(e) => setQuietStart(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quiet-end">{t('apply.quietHoursEnd')}</Label>
            <Input
              id="quiet-end"
              type="time"
              value={quietEnd}
              onChange={(e) => setQuietEnd(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rate-limit">{t('apply.rateLimitPerHour')}</Label>
            <Input
              id="rate-limit"
              type="number"
              min="1"
              max="20"
              value={rateLimit}
              onChange={(e) => setRateLimit(parseInt(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="follow-up">{t('apply.defaultFollowUpDays')}</Label>
            <Input
              id="follow-up"
              type="number"
              min="1"
              max="30"
              value={followUpDays}
              onChange={(e) => setFollowUpDays(parseInt(e.target.value))}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
