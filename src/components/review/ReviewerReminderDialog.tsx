/**
 * @fileoverview Dialog for sending reminders to pending reviewers
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { FeedbackRequest } from '@/types/review.types';

interface ReviewerReminderDialogProps {
  open: boolean;
  onClose: () => void;
  pendingRequests: FeedbackRequest[];
  onSendReminders: (requestIds: string[]) => Promise<void>;
}

/**
 * Pick pending reviewers; send reminders; schedule nudge on Calendar
 */
export function ReviewerReminderDialog({
  open,
  onClose,
  pendingRequests,
  onSendReminders,
}: ReviewerReminderDialogProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  
  const toggleSelect = (id: string) => {
    const updated = new Set(selected);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelected(updated);
  };
  
  const handleSend = async () => {
    setSending(true);
    try {
      await onSendReminders(Array.from(selected));
      onClose();
    } finally {
      setSending(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Bell className="w-5 h-5 inline mr-2" aria-hidden="true" />
            {t('review.remind', 'Send Reminders')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 py-4">
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {t('review.noRemindersNeeded', 'No pending requests to remind.')}
            </p>
          ) : (
            pendingRequests.map(req => (
              <label
                key={req.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(req.id)}
                  onChange={() => toggleSelect(req.id)}
                  className="rounded border-gray-300"
                />
                <div>
                  <p className="font-medium">{req.reviewerName || req.reviewerEmail}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('review.sentOn', 'Sent on')} {req.sentAt ? new Date(req.sentAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSend}
            disabled={selected.size === 0 || sending}
          >
            {sending ? t('common.sending', 'Sending...') : t('review.sendReminders', `Send ${selected.size} Reminders`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
