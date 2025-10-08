/**
 * Save Search Dialog
 * Step 32 - Dialog for saving search queries with alerts
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useJobSearchesStore } from '@/stores/jobSearches.store';

interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialQuery?: string;
}

export default function SaveSearchDialog({ 
  open, 
  onOpenChange, 
  initialQuery 
}: SaveSearchDialogProps) {
  const [name, setName] = useState('My Search');
  const [query, setQuery] = useState(initialQuery ?? '');
  const [interval, setInterval] = useState(60);
  const { upsert } = useJobSearchesStore();

  const handleSave = () => {
    upsert({
      name,
      query,
      filters: {},
      alerts: { enabled: true, intervalMin: interval }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-3">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
        </DialogHeader>
        
        <Input 
          placeholder="Search name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        
        <Input 
          placeholder="Query" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
        />
        
        <div className="flex items-center gap-2 text-sm">
          Alerts every{' '}
          <Input 
            className="w-20" 
            type="number" 
            value={interval} 
            onChange={(e) => setInterval(Number(e.target.value))} 
          />
          {' '}min
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
