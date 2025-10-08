/**
 * Job Filters
 * Step 32 - Search and filter controls
 */

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SaveSearchDialog from './SaveSearchDialog';
import { useState } from 'react';
import { useJobSearchesStore } from '@/stores/jobSearches.store';

export default function JobFilters() {
  const [query, setQuery] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const { searches } = useJobSearchesStore();

  return (
    <div className="border rounded-md p-3 space-y-2">
      <div className="flex gap-2">
        <Input 
          className="flex-1" 
          placeholder="Search jobs…" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
        />
        <Button onClick={() => setSaveOpen(true)}>
          Save Search
        </Button>
      </div>
      
      {searches.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Saved: {searches.map(s => s.name).join(' • ')}
        </div>
      )}
      
      <SaveSearchDialog 
        open={saveOpen} 
        onOpenChange={setSaveOpen} 
        initialQuery={query}
      />
    </div>
  );
}
