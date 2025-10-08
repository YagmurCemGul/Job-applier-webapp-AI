/**
 * Applications Page
 * Main entry point for application tracking
 */

import ApplicationsPage from '@/components/applications/ApplicationsPage';
import ApplicationDetailDrawer from '@/components/applications/ApplicationDetailDrawer';

export default function Applications() {
  return (
    <div className="container mx-auto py-6">
      <ApplicationsPage />
      <ApplicationDetailDrawer />
    </div>
  );
}
