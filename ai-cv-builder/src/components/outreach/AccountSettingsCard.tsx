/**
 * Account Settings Card
 * Manage connected email accounts
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEmailAccounts } from '@/stores/emailAccounts.store';
import { Trash2, Mail } from 'lucide-react';

export default function AccountSettingsCard() {
  const { items, setDryRun, remove } = useEmailAccounts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!items.length && (
          <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
            No accounts connected. Connect Gmail to start sending emails.
          </div>
        )}

        {items.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center justify-between border rounded-md p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="space-y-1">
              <div className="font-medium text-sm">
                {acc.displayName || acc.id}
              </div>
              <div className="text-xs text-muted-foreground">{acc.id}</div>
              <div className="text-xs text-muted-foreground">
                Connected: {new Date(acc.connectedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id={`dry-run-${acc.id}`}
                  checked={acc.dryRun}
                  onCheckedChange={(checked) => setDryRun(acc.id, checked)}
                />
                <Label
                  htmlFor={`dry-run-${acc.id}`}
                  className="text-xs cursor-pointer"
                >
                  Dry-Run Mode
                </Label>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(acc.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
