/**
 * Job Finder Page
 * Step 32 - Main job discovery interface
 */

import JobFilters from './JobFilters';
import JobList from './JobList';
import SourceSettingsDialog from './SourceSettingsDialog';
import FetchRunLog from './FetchRunLog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useJobSourcesStore } from '@/stores/jobSources.store';
import { runAllAdaptersOnce } from '@/services/jobs/adapters/runAll';
import { useJobsStore } from '@/stores/jobs.store';
import { rebuildIndex } from '@/services/jobs/searchIndex.service';

export default function JobFinderPage() {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const { sources } = useJobSourcesStore();
  const { items } = useJobsStore();

  const handleFetchNow = async () => {
    await runAllAdaptersOnce(sources.filter(s => s.enabled));
    await rebuildIndex(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Button onClick={() => setSourcesOpen(true)}>
          Source Settings
        </Button>
        <Button variant="outline" onClick={handleFetchNow}>
          Fetch Now
        </Button>
      </div>
      
      <JobFilters />
      <JobList />
      <FetchRunLog />
      
      <SourceSettingsDialog 
        open={sourcesOpen} 
        onOpenChange={setSourcesOpen} 
      />
    </div>
  );
}
