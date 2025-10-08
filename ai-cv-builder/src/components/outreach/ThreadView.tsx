/**
 * Thread View Component
 * Displays Gmail thread with messages
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GmailThread } from '@/types/gmail.types';
import { MessageSquare, User } from 'lucide-react';

interface ThreadViewProps {
  thread?: GmailThread;
}

export default function ThreadView({ thread }: ThreadViewProps) {
  if (!thread) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-sm text-muted-foreground text-center">
            Select a message to view its thread.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Thread: {thread.subject}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {thread.participants.length} participant(s)
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="max-h-96 overflow-auto space-y-3">
          {thread.messages.map((msg) => (
            <div
              key={msg.id}
              className="border rounded-md p-3 space-y-2 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {msg.from}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      To: {msg.to.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {new Date(msg.date).toLocaleString()}
                </div>
              </div>

              {msg.html ? (
                <div
                  className="prose prose-sm max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: msg.html }}
                />
              ) : (
                <pre className="text-xs whitespace-pre-wrap font-sans">
                  {msg.text || '(No content)'}
                </pre>
              )}
            </div>
          ))}

          {thread.messages.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center border rounded-md">
              No messages in thread.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
