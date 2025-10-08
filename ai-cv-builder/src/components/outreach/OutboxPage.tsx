/**
 * Outbox Page
 * Main view for email outreach management
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOutbox } from '@/stores/outbox.store';
import OAuthConnectButton from './OAuthConnectButton';
import AccountSettingsCard from './AccountSettingsCard';
import SequenceRunnerPanel from './SequenceRunnerPanel';
import ThreadView from './ThreadView';
import TemplatePreviewDialog from './TemplatePreviewDialog';
import CalendarLinkDialog from './CalendarLinkDialog';
import { Mail, Eye, Calendar, ExternalLink } from 'lucide-react';

export default function OutboxPage() {
  const { messages } = useOutbox();
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedThread = selectedThreadId
    ? { id: selectedThreadId, subject: 'Loading...', participants: [], snippet: '', messages: [], updatedAt: new Date().toISOString() }
    : undefined;

  return (
    <div className="space-y-6">
      {/* OAuth & Settings */}
      <div className="space-y-4">
        <OAuthConnectButton />
        <AccountSettingsCard />
      </div>

      {/* Sequence Runner */}
      <SequenceRunnerPanel />

      {/* Outbox */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Outbox
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewOpen(true)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCalendarOpen(true)}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Propose Times
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Messages List */}
            <div className="space-y-2">
              <div className="text-sm font-medium mb-3">
                Messages ({messages.length})
              </div>

              <div className="space-y-2 max-h-[500px] overflow-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="border rounded-md p-3 space-y-2 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => msg.threadId && setSelectedThreadId(msg.threadId)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm truncate flex-1">
                        {msg.subject}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-xs shrink-0 ${
                          msg.status === 'sent'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : msg.status === 'failed'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : msg.status === 'scheduled'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      To: {msg.to.join(', ')}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>

                    {msg.error && (
                      <div className="text-xs text-destructive">
                        Error: {msg.error}
                      </div>
                    )}

                    {msg.threadId && (
                      <div className="flex gap-2 text-xs">
                        <button
                          className="underline flex items-center gap-1 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedThreadId(msg.threadId);
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Thread
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {messages.length === 0 && (
                  <div className="text-sm text-muted-foreground py-12 text-center border rounded-md">
                    No messages sent yet. Start a sequence to send emails.
                  </div>
                )}
              </div>
            </div>

            {/* Thread View */}
            <div>
              <ThreadView thread={selectedThread} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TemplatePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        vars={{}}
      />

      <CalendarLinkDialog
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
      />
    </div>
  );
}
