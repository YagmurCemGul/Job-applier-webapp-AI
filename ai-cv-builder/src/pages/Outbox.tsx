/**
 * Outbox Page
 * Email outreach management interface
 */
import OutboxPage from '@/components/outreach/OutboxPage';

export default function Outbox() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Email Outreach</h1>
        <p className="text-muted-foreground mt-2">
          Manage your email campaigns, sequences, and Gmail integration
        </p>
      </div>
      <OutboxPage />
    </div>
  );
}
