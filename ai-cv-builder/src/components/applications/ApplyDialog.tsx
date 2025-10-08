/**
 * Apply Dialog
 * Quick apply interface with platform selection
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { autoApply } from '@/services/apply/apply.engine';

interface ApplyDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function ApplyDialog({ open, onOpenChange }: ApplyDialogProps) {
  const [platform, setPlatform] = useState<
    'greenhouse' | 'lever' | 'workday' | 'indeed' | 'linkedin'
  >('greenhouse');
  const [jobUrl, setJobUrl] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [optIn, setOptIn] = useState(false);

  const handleSubmit = async () => {
    try {
      await autoApply({
        platform,
        jobUrl,
        company,
        role,
        mapperArgs: { jobUrl },
        optIn
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Auto-apply failed:', error);
      alert(error instanceof Error ? error.message : 'Auto-apply failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-3">
        <DialogHeader>
          <DialogTitle>Auto-Apply</DialogTitle>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-2">
          <select
            className="border rounded-md p-2"
            value={platform}
            onChange={e => setPlatform(e.target.value as any)}
          >
            <option value="greenhouse">Greenhouse</option>
            <option value="lever">Lever</option>
            <option value="workday">Workday</option>
            <option value="indeed">Indeed</option>
            <option value="linkedin">LinkedIn</option>
          </select>
          <Input
            placeholder="Job URL"
            value={jobUrl}
            onChange={e => setJobUrl(e.target.value)}
          />
          <Input
            placeholder="Company"
            value={company}
            onChange={e => setCompany(e.target.value)}
          />
          <Input
            placeholder="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
        </div>
        <label className="text-xs flex items-center gap-2">
          <input
            type="checkbox"
            checked={optIn}
            onChange={e => setOptIn(e.target.checked)}
          />
          I confirm I have the rights to submit on this site (Legal Mode).
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
