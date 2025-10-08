/**
 * @fileoverview Dialog for creating/editing review cycles
 * Allows setting kind, dates, deadlines, retention policy, and calendar integration
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReviewCycle, ReviewKind } from '@/types/review.types';

interface CycleSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (cycle: ReviewCycle, createCalendarReminders: boolean) => void;
  initialData?: ReviewCycle;
}

/**
 * Define kind, dates, deadlines, retention; consent toggles; "Create calendar reminders"
 */
export function CycleSetupDialog({
  open,
  onClose,
  onSave,
  initialData,
}: CycleSetupDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [kind, setKind] = useState<ReviewKind>(initialData?.kind ?? 'mid_year');
  const [startISO, setStartISO] = useState(initialData?.startISO ?? '');
  const [endISO, setEndISO] = useState(initialData?.endISO ?? '');
  const [retentionDays, setRetentionDays] = useState<30 | 60 | 90 | 180 | 365>(
    initialData?.retentionDays ?? 90
  );
  const [deadlines, setDeadlines] = useState(initialData?.deadlines ?? []);
  const [createReminders, setCreateReminders] = useState(true);
  
  const handleAddDeadline = () => {
    setDeadlines([
      ...deadlines,
      {
        id: crypto.randomUUID(),
        label: '',
        atISO: '',
        kind: 'other' as const,
      },
    ]);
  };
  
  const handleRemoveDeadline = (id: string) => {
    setDeadlines(deadlines.filter(d => d.id !== id));
  };
  
  const handleSave = () => {
    const cycle: ReviewCycle = {
      id: initialData?.id ?? crypto.randomUUID(),
      title,
      kind,
      startISO,
      endISO,
      deadlines,
      retentionDays,
      stage: initialData?.stage ?? 'draft',
      applicationId: initialData?.applicationId,
      planId: initialData?.planId,
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    onSave(cycle, createReminders);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? t('review.editCycle', 'Edit Review Cycle')
              : t('review.startCycle', 'Start Review Cycle')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cycle-title">{t('review.cycleTitle', 'Title')}</Label>
            <Input
              id="cycle-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., H1 2025 Performance Review"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cycle-kind">{t('review.kind', 'Kind')}</Label>
            <Select value={kind} onValueChange={(v: ReviewKind) => setKind(v)}>
              <SelectTrigger id="cycle-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mid_year">{t('review.kinds.midYear', 'Mid-Year')}</SelectItem>
                <SelectItem value="year_end">{t('review.kinds.yearEnd', 'Year-End')}</SelectItem>
                <SelectItem value="probation">{t('review.kinds.probation', 'Probation')}</SelectItem>
                <SelectItem value="promotion">{t('review.kinds.promotion', 'Promotion')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cycle-start">{t('review.startDate', 'Start Date')}</Label>
              <Input
                id="cycle-start"
                type="date"
                value={startISO.split('T')[0]}
                onChange={e => setStartISO(e.target.value + 'T00:00:00Z')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cycle-end">{t('review.endDate', 'End Date')}</Label>
              <Input
                id="cycle-end"
                type="date"
                value={endISO.split('T')[0]}
                onChange={e => setEndISO(e.target.value + 'T00:00:00Z')}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cycle-retention">{t('review.retention', 'Data Retention')}</Label>
            <Select
              value={String(retentionDays)}
              onValueChange={(v) => setRetentionDays(parseInt(v) as any)}
            >
              <SelectTrigger id="cycle-retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">365 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('review.deadlines', 'Deadlines')}</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDeadline}
                aria-label={t('review.addDeadline', 'Add deadline')}
              >
                <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                {t('common.add', 'Add')}
              </Button>
            </div>
            
            <div className="space-y-2">
              {deadlines.map((d, idx) => (
                <div key={d.id} className="flex gap-2 items-start">
                  <Input
                    placeholder="Label"
                    value={d.label}
                    onChange={e => {
                      const updated = [...deadlines];
                      updated[idx].label = e.target.value;
                      setDeadlines(updated);
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={d.atISO.split('T')[0]}
                    onChange={e => {
                      const updated = [...deadlines];
                      updated[idx].atISO = e.target.value + 'T00:00:00Z';
                      setDeadlines(updated);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDeadline(d.id)}
                    aria-label={t('common.remove', 'Remove')}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="create-reminders"
              checked={createReminders}
              onChange={e => setCreateReminders(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="create-reminders" className="cursor-pointer">
              <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
              {t('review.createCalendarReminders', 'Create calendar reminders')}
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!title || !startISO || !endISO}>
            {t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
