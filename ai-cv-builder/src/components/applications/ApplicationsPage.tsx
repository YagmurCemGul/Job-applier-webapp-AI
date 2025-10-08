/**
 * Applications Page
 * Main container for application tracking UI
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import KanbanBoard from './KanbanBoard';
import ApplyLogsPanel from './ApplyLogsPanel';
import SequenceBuilderDialog from './SequenceBuilderDialog';
import EmailTemplateDialog from './EmailTemplateDialog';
import ApplyDialog from './ApplyDialog';
import { funnel } from '@/services/insights/applications.insights.service';
import { OfferCreateDialog } from '@/components/offer/OfferCreateDialog';
import { useNavigate } from 'react-router-dom';
import { DollarSign, GitCompare } from 'lucide-react';

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [openApply, setOpenApply] = useState(false);
  const [openSeq, setOpenSeq] = useState(false);
  const [openTpl, setOpenTpl] = useState(false);
  const [openOffer, setOpenOffer] = useState(false);
  const f = funnel();

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Button onClick={() => setOpenApply(true)}>Auto-Apply</Button>
        <Button variant="outline" onClick={() => setOpenSeq(true)}>
          Sequences
        </Button>
        <Button variant="outline" onClick={() => setOpenTpl(true)}>
          Email Templates
        </Button>
        <Button variant="outline" onClick={() => setOpenOffer(true)}>
          <DollarSign className="mr-2 h-4 w-4" />
          Add Offer
        </Button>
        <Button variant="outline" onClick={() => navigate('/offers')}>
          <GitCompare className="mr-2 h-4 w-4" />
          Compare Offers
        </Button>
        <div className="ml-auto text-xs text-muted-foreground">
          Funnel: A {f.applied} • V {f.viewed} • I {f.interview} • O {f.offer} •
          R {f.rejected}
        </div>
      </div>
      <KanbanBoard />
      <ApplyLogsPanel />
      <ApplyDialog open={openApply} onOpenChange={setOpenApply} />
      <SequenceBuilderDialog open={openSeq} onOpenChange={setOpenSeq} />
      <EmailTemplateDialog open={openTpl} onOpenChange={setOpenTpl} />
      <OfferCreateDialog open={openOffer} onOpenChange={setOpenOffer} />
    </div>
  );
}
