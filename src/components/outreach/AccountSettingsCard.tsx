import { Card, CardContent } from '@/components/ui/card'
import { useEmailAccountsStore } from '@/store/emailAccountsStore'
import { Button } from '@/components/ui/button'

export default function AccountSettingsCard() {
  const { items, setDryRun, remove } = useEmailAccountsStore()

  return (
    <Card>
      <CardContent className="space-y-2 p-3">
        <div className="font-medium">Email Accounts</div>
        {!items.length && (
          <div className="text-xs text-muted-foreground">No accounts. Connect Gmail first.</div>
        )}
        {items.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-md border p-2 text-sm"
          >
            <div>
              {a.displayName || a.id}{' '}
              <span className="text-xs text-muted-foreground">({a.id})</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={a.dryRun}
                  onChange={(e) => setDryRun(a.id, e.target.checked)}
                />
                Dry-Run
              </label>
              <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                Disconnect
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
