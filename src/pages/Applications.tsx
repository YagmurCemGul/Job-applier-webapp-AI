/**
 * @fileoverview Applications page with networking integrations
 * @module pages/Applications
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, UserPlus, Zap, Calendar, PlayCircle, DollarSign, MessageSquare } from 'lucide-react';
import { usePipeline } from '@/stores/pipeline.store';
import { useContacts } from '@/stores/contacts.store';
import { useInterview } from '@/stores/interview.store';
import { useOffers } from '@/stores/offers.store.step44';
import { ReferralAskWizard } from '@/components/network/ReferralAskWizard';
import type { PipelineItem } from '@/stores/pipeline.store';
import type { InterviewPlan } from '@/types/interview.types';
import type { Offer } from '@/types/offer.types.step44';

// Placeholder Application type
interface Application {
  id: string;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
}

/**
 * Applications page with networking integration
 * This integrates with Step 41 Networking features
 */
export function Applications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { upsert: upsertPipeline } = usePipeline();
  const { items: contacts, findByEmail } = useContacts();
  const { upsertPlan } = useInterview();
  const { upsert: upsertOffer } = useOffers();
  const [referralWizardOpen, setReferralWizardOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Sample applications (in production, this would come from a store)
  const [applications] = useState<Application[]>([
    { id: '1', company: 'TechCorp', position: 'Senior Engineer', status: 'applied', appliedDate: '2025-01-15' },
    { id: '2', company: 'StartupXYZ', position: 'Lead Developer', status: 'interviewing', appliedDate: '2025-01-10' },
  ]);

  const handleAddToPipeline = (app: Application) => {
    // Find or create contact for this company
    const existingContact = contacts.find(c => c.company?.toLowerCase().includes(app.company.toLowerCase()));
    
    const item: PipelineItem = {
      id: crypto.randomUUID(),
      contactId: existingContact?.id || 'unknown',
      company: app.company,
      role: app.position,
      stage: 'prospect',
      lastActionISO: new Date().toISOString(),
      notes: `From application #${app.id}`
    };
    
    upsertPipeline(item);
  };

  const handleRequestReferral = (app: Application) => {
    setSelectedApp(app);
    setReferralWizardOpen(true);
  };

  const handleAutoApply = (app: Application) => {
    // Navigate to Apply page with pre-selected posting
    navigate('/apply', { state: { company: app.company, position: app.position } });
  };

  const handleScheduleInterview = (app: Application) => {
    const plan: InterviewPlan = {
      id: crypto.randomUUID(),
      applicationId: app.id,
      company: app.company,
      role: app.position,
      kind: 'behavioral',
      medium: 'video',
      startISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      endISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), // +1 hour
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      quietRespect: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    upsertPlan(plan);
    navigate('/interview', { state: { tab: 'planner', planId: plan.id } });
  };

  const handleStartMock = (app: Application) => {
    navigate('/interview', { state: { tab: 'questions', company: app.company, role: app.position } });
  };

  const handleLogOffer = (app: Application) => {
    const offer: Offer = {
      id: crypto.randomUUID(),
      company: app.company,
      role: app.position,
      currency: 'USD',
      baseAnnual: 0,
      source: 'manual',
      extractedAt: new Date().toISOString()
    };
    upsertOffer(offer);
    navigate('/offers', { state: { offerId: offer.id } });
  };

  const handleStartNegotiation = (app: Application) => {
    navigate('/offers', { state: { tab: 'negotiate', company: app.company } });
  };

  const handleStartOnboarding = (app: Application) => {
    navigate('/onboarding', { state: { company: app.company, role: app.position } });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('applications.title', 'Applications')}</h1>
        <p className="text-muted-foreground">
          {t('applications.subtitle', 'Track your job applications and leverage your network')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {applications.map(app => (
          <Card key={app.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-4 w-4" />
                {app.company}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium text-sm">{app.position}</div>
                <div className="text-xs text-muted-foreground">Applied {new Date(app.appliedDate).toLocaleDateString()}</div>
              </div>
              <div>
                <Badge variant={app.status === 'interviewing' ? 'default' : 'secondary'}>
                  {app.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAutoApply(app)}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Auto-Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddToPipeline(app)}
                >
                  <Building className="mr-2 h-4 w-4" />
                  Pipeline
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleScheduleInterview(app)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartMock(app)}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Mock
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLogOffer(app)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Log Offer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartNegotiation(app)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Negotiate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRequestReferral(app)}
                  className="col-span-2"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Request Referral
                </Button>
                {app.status === 'offer_accepted' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleStartOnboarding(app)}
                    className="col-span-2"
                  >
                    🚀 Start Onboarding
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {contacts.filter(c => c.company?.toLowerCase().includes(app.company.toLowerCase())).length} contacts at {app.company}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReferralAskWizard
        open={referralWizardOpen}
        onClose={() => {
          setReferralWizardOpen(false);
          setSelectedApp(null);
        }}
      />
    </div>
  );
}
