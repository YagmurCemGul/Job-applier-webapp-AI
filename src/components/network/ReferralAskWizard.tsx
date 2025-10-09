/**
 * @fileoverview Wizard to request warm introductions respectfully
 * @module components/network/ReferralAskWizard
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContacts } from '@/stores/contacts.store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ReferralAskWizard({ open, onClose }: Props) {
  const { t } = useTranslation();
  const { items: contacts } = useContacts();
  const [introducerId, setIntroducerId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [context, setContext] = useState('');

  const introducer = contacts.find(c => c.id === introducerId);
  const target = contacts.find(c => c.id === targetId);

  const generateMessage = () => {
    if (!introducer || !target) return '';
    return `Hi ${introducer.name.split(' ')[0]},\n\nI hope this finds you well. I'm currently exploring opportunities at ${target.company || 'their company'} and noticed you might know ${target.name}.\n\n${context}\n\nWould you feel comfortable making a warm introduction? I completely understand if the timing isn't right.\n\nThank you for considering!`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('network.askReferral')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="introducer">Introducer (who do you know?)</Label>
            <Select value={introducerId} onValueChange={setIntroducerId}>
              <SelectTrigger id="introducer">
                <SelectValue placeholder="Select contact..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.filter(c => c.relationship !== 'weak').map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target (who do you want to meet?)</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger id="target">
                <SelectValue placeholder="Select contact..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context / Why?</Label>
            <Textarea
              id="context"
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="E.g., I'm interested in the Senior Engineer role and would love to learn about the team culture..."
              rows={3}
            />
          </div>

          {introducerId && targetId && (
            <div className="space-y-2">
              <Label>Generated Message</Label>
              <Textarea
                value={generateMessage()}
                readOnly
                rows={8}
                className="bg-muted"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!introducerId || !targetId}>
            Draft Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
