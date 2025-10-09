/**
 * @fileoverview Interview planner component for Step 43
 * @module components/interview/Planner
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import type { InterviewPlan, InterviewKind, Medium } from '@/types/interview.types';
import { useInterview } from '@/stores/interview.store';
import { scheduleInterview, hasSchedulingConflict } from '@/services/interview/scheduler.service';
import { toast } from 'sonner';

interface PlannerProps {
  initialPlan?: Partial<InterviewPlan>;
  onSave?: (plan: InterviewPlan) => void;
}

/**
 * Interview planning form with calendar integration
 */
export function Planner({ initialPlan, onSave }: PlannerProps) {
  const { t } = useTranslation();
  const { plans, upsertPlan } = useInterview();

  const [formData, setFormData] = useState<Partial<InterviewPlan>>({
    kind: 'behavioral',
    medium: 'video',
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    quietRespect: true,
    ...initialPlan
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.startISO) newErrors.startISO = t('interview.errors.startRequired');
    if (!formData.endISO) newErrors.endISO = t('interview.errors.endRequired');
    
    if (formData.startISO && formData.endISO) {
      if (Date.parse(formData.endISO) <= Date.parse(formData.startISO)) {
        newErrors.endISO = t('interview.errors.endAfterStart');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const plan: InterviewPlan = {
      id: formData.id || crypto.randomUUID(),
      kind: formData.kind as InterviewKind,
      medium: formData.medium as Medium,
      startISO: formData.startISO!,
      endISO: formData.endISO!,
      tz: formData.tz || Intl.DateTimeFormat().resolvedOptions().timeZone,
      quietRespect: formData.quietRespect ?? true,
      company: formData.company,
      role: formData.role,
      interviewer: formData.interviewer,
      location: formData.location,
      notes: formData.notes,
      applicationId: formData.applicationId,
      pipelineItemId: formData.pipelineItemId,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check for conflicts
    const conflicts = hasSchedulingConflict(
      plan,
      plans.filter(p => p.id !== plan.id)
    );

    if (conflicts) {
      toast.error(t('interview.errors.schedulingConflict'));
      return;
    }

    upsertPlan(plan);
    toast.success(t('interview.planSaved'));
    onSave?.(plan);
  };

  const handleCreateCalendarEvent = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // This would need OAuth credentials in production
      const accountId = 'default'; // From auth context
      const clientId = process.env.VITE_GOOGLE_CLIENT_ID || '';
      const passphrase = 'temp'; // From secure storage

      const plan: InterviewPlan = {
        id: formData.id || crypto.randomUUID(),
        kind: formData.kind as InterviewKind,
        medium: formData.medium as Medium,
        startISO: formData.startISO!,
        endISO: formData.endISO!,
        tz: formData.tz || Intl.DateTimeFormat().resolvedOptions().timeZone,
        quietRespect: formData.quietRespect ?? true,
        company: formData.company,
        role: formData.role,
        interviewer: formData.interviewer,
        location: formData.location,
        notes: formData.notes,
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await scheduleInterview(plan, accountId, clientId, passphrase);
      toast.success(t('interview.calendarEventCreated'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(t('interview.errors.calendarFailed', { message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('interview.planner')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">{t('interview.company')}</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                placeholder={t('interview.companyPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t('interview.role')}</Label>
              <Input
                id="role"
                value={formData.role || ''}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                placeholder={t('interview.rolePlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kind">{t('interview.kind')}</Label>
              <Select
                value={formData.kind}
                onValueChange={value => setFormData({ ...formData, kind: value as InterviewKind })}
              >
                <SelectTrigger id="kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="system_design">System Design</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="managerial">Managerial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium">{t('interview.medium')}</Label>
              <Select
                value={formData.medium}
                onValueChange={value => setFormData({ ...formData, medium: value as Medium })}
              >
                <SelectTrigger id="medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startISO">
                {t('interview.startTime')}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="startISO"
                type="datetime-local"
                value={formData.startISO?.slice(0, 16) || ''}
                onChange={e => setFormData({ ...formData, startISO: new Date(e.target.value).toISOString() })}
                aria-invalid={!!errors.startISO}
                aria-describedby={errors.startISO ? 'start-error' : undefined}
              />
              {errors.startISO && (
                <p id="start-error" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.startISO}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endISO">
                {t('interview.endTime')}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="endISO"
                type="datetime-local"
                value={formData.endISO?.slice(0, 16) || ''}
                onChange={e => setFormData({ ...formData, endISO: new Date(e.target.value).toISOString() })}
                aria-invalid={!!errors.endISO}
                aria-describedby={errors.endISO ? 'end-error' : undefined}
              />
              {errors.endISO && (
                <p id="end-error" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.endISO}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewer">{t('interview.interviewer')}</Label>
            <Input
              id="interviewer"
              value={formData.interviewer || ''}
              onChange={e => setFormData({ ...formData, interviewer: e.target.value })}
              placeholder={t('interview.interviewerPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('interview.location')}</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('interview.locationPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('interview.notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('interview.notesPlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="quietRespect"
              checked={formData.quietRespect}
              onCheckedChange={checked => setFormData({ ...formData, quietRespect: checked as boolean })}
            />
            <Label htmlFor="quietRespect" className="text-sm cursor-pointer">
              {t('interview.respectQuiet')}
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {t('interview.savePlan')}
            </Button>
            <Button
              onClick={handleCreateCalendarEvent}
              variant="outline"
              disabled={loading}
              className="flex-1"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {t('interview.createEvent')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
