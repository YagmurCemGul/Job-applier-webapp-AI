/**
 * @fileoverview Stakeholder map with influence/interest matrix.
 * @module components/onboarding/StakeholderMap
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Calendar } from 'lucide-react';
import type { Stakeholder } from '@/types/onboarding.types';
import { dedupeStakeholders } from '@/services/onboarding/stakeholder.service';

interface Props {
  stakeholders: Stakeholder[];
  onAdd: (s: Stakeholder) => void;
  onCreate1on1?: (email: string, name: string) => void;
}

/**
 * StakeholderMap - visualize and manage stakeholders.
 */
export function StakeholderMap({ stakeholders, onAdd, onCreate1on1 }: Props) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<Stakeholder>>({
    influence: 'med',
    interest: 'med',
    cadence: 'monthly',
  });

  const dedupedStakeholders = dedupeStakeholders(stakeholders);

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    const s: Stakeholder = {
      id: crypto.randomUUID(),
      name: form.name,
      email: form.email,
      org: form.org,
      role: form.role,
      influence: form.influence || 'med',
      interest: form.interest || 'med',
      cadence: form.cadence,
      notes: form.notes,
    };
    onAdd(s);
    setDialogOpen(false);
    setForm({ influence: 'med', interest: 'med', cadence: 'monthly' });
  };

  const getQuadrant = (influence: string, interest: string) => {
    if (influence === 'high' && interest === 'high') return 'Manage Closely';
    if (influence === 'high' && interest !== 'high') return 'Keep Satisfied';
    if (influence !== 'high' && interest === 'high') return 'Keep Informed';
    return 'Monitor';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('onboarding.stakeholders')}
          </h2>
          <p className="text-slate-600 mt-1">
            {dedupedStakeholders.length} stakeholder
            {dedupedStakeholders.length !== 1 ? 's' : ''} mapped
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          {t('onboarding.addStakeholder')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {['high', 'low'].map((interest) =>
          ['high', 'low'].map((influence) => {
            const items = dedupedStakeholders.filter(
              (s) =>
                (s.influence === influence || (influence === 'low' && s.influence !== 'high')) &&
                (s.interest === interest || (interest === 'low' && s.interest !== 'high'))
            );
            return (
              <Card key={`${influence}-${interest}`}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {getQuadrant(influence, interest)}
                  </CardTitle>
                  <CardDescription>
                    Influence: {influence} / Interest: {interest}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-sm text-slate-500">No stakeholders</p>
                  ) : (
                    <div className="space-y-2">
                      {items.slice(0, 3).map((s) => (
                        <div
                          key={s.id}
                          className="flex items-start justify-between gap-2 text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{s.name}</p>
                            <p className="text-xs text-slate-600 truncate">
                              {s.email}
                            </p>
                          </div>
                          {onCreate1on1 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 shrink-0"
                              onClick={() => onCreate1on1(s.email, s.name)}
                              aria-label={`Create 1:1 with ${s.name}`}
                            >
                              <Calendar className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-xs text-slate-500">
                          +{items.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('onboarding.addStakeholder')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="s-name">{t('onboarding.name')}</Label>
              <Input
                id="s-name"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-email">{t('onboarding.email')}</Label>
              <Input
                id="s-email"
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="s-influence">{t('onboarding.influence')}</Label>
                <Select
                  value={form.influence}
                  onValueChange={(v) =>
                    setForm({ ...form, influence: v as any })
                  }
                >
                  <SelectTrigger id="s-influence">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('onboarding.low')}</SelectItem>
                    <SelectItem value="med">{t('onboarding.med')}</SelectItem>
                    <SelectItem value="high">{t('onboarding.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-interest">{t('onboarding.interest')}</Label>
                <Select
                  value={form.interest}
                  onValueChange={(v) => setForm({ ...form, interest: v as any })}
                >
                  <SelectTrigger id="s-interest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('onboarding.low')}</SelectItem>
                    <SelectItem value="med">{t('onboarding.med')}</SelectItem>
                    <SelectItem value="high">{t('onboarding.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-cadence">{t('onboarding.cadence')}</Label>
              <Select
                value={form.cadence}
                onValueChange={(v) => setForm({ ...form, cadence: v as any })}
              >
                <SelectTrigger id="s-cadence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">
                    {t('onboarding.weekly')}
                  </SelectItem>
                  <SelectItem value="biweekly">
                    {t('onboarding.biweekly')}
                  </SelectItem>
                  <SelectItem value="monthly">
                    {t('onboarding.monthly')}
                  </SelectItem>
                  <SelectItem value="ad_hoc">
                    {t('onboarding.adHoc')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('onboarding.cancel')}
            </Button>
            <Button onClick={handleSubmit}>{t('onboarding.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
