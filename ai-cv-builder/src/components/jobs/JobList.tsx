/**
 * Job List
 * Step 32 - Grid of job cards
 */

import { useJobsStore } from '@/stores/jobs.store';
import JobCard from './JobCard';

export default function JobList() {
  const { items } = useJobsStore();
  
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
      {items.map(j => (
        <JobCard key={j.id} job={j} />
      ))}
      
      {!items.length && (
        <div className="text-sm text-muted-foreground">
          No jobs yet. Configure a source and "Fetch Now".
        </div>
      )}
    </div>
  );
}
