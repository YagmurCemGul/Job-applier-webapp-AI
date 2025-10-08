/**
 * @fileoverview Onboarding home with overview cards and quick actions.
 * @module components/onboarding/OnboardingHome
 */

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Calendar,
  Target,
  Users,
  FileText,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import type { OnboardingPlan } from '@/types/onboarding.types';

interface Props {
  plan: OnboardingPlan;
  onNavigate: (section: string) => void;
}

/**
 * OnboardingHome - overview dashboard for onboarding plan.
 */
export function OnboardingHome({ plan, onNavigate }: Props) {
  const { t } = useTranslation();

  const cards = [
    {
      key: 'plan',
      title: t('onboarding.plan'),
      description: `${plan.tasks.filter((t) => t.status === 'done').length} / ${plan.tasks.length} tasks completed`,
      icon: Briefcase,
      color: 'text-blue-600',
    },
    {
      key: 'stakeholders',
      title: t('onboarding.stakeholders'),
      description: `${plan.stakeholders.length} stakeholders mapped`,
      icon: Users,
      color: 'text-green-600',
    },
    {
      key: 'oneonones',
      title: t('onboarding.oneonones'),
      description: 'Schedule and track 1:1 meetings',
      icon: Calendar,
      color: 'text-purple-600',
    },
    {
      key: 'okrs',
      title: t('onboarding.okrs'),
      description: 'Define and track objectives',
      icon: Target,
      color: 'text-orange-600',
    },
    {
      key: 'reports',
      title: t('onboarding.reports'),
      description: 'Compose weekly updates',
      icon: FileText,
      color: 'text-indigo-600',
    },
    {
      key: 'evidence',
      title: t('onboarding.evidence'),
      description: `${plan.evidence.length} items collected`,
      icon: TrendingUp,
      color: 'text-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('onboarding.home')}
        </h1>
        <p className="text-slate-600 mt-2">
          {plan.company} — {plan.role}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.key}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => onNavigate(card.key)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate(card.key);
                }
              }}
              aria-label={`Navigate to ${card.title}`}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Icon className={`h-8 w-8 ${card.color}`} aria-hidden="true" />
                <div className="flex-1">
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4">
        <Button onClick={() => onNavigate('plan')}>
          {t('onboarding.openPlan')}
        </Button>
        <Button variant="outline" onClick={() => onNavigate('reports')}>
          {t('onboarding.composeWeekly')}
        </Button>
      </div>
    </div>
  );
}
