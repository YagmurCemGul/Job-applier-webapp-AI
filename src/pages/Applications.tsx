/**
 * @fileoverview Applications page with networking integrations
 * @module pages/Applications
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, UserPlus } from 'lucide-react';
import { usePipeline } from '@/stores/pipeline.store';
import { useContacts } from '@/stores/contacts.store';
import { ReferralAskWizard } from '@/components/network/ReferralAskWizard';
import type { PipelineItem } from '@/stores/pipeline.store';

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
  const { upsert: upsertPipeline } = usePipeline();
  const { items: contacts, findByEmail } = useContacts();
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
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddToPipeline(app)}
                  className="flex-1"
                >
                  <Building className="mr-2 h-4 w-4" />
                  Add to Pipeline
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRequestReferral(app)}
                  className="flex-1"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Request Referral
                </Button>
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
