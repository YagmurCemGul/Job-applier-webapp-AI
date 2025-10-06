import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useJobSourcesStore } from '@/store/jobSourcesStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SourceSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { sources, upsert, toggle } = useJobSourcesStore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl space-y-3 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Source Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {sources.map((s) => (
            <div key={s.key} className="space-y-2 rounded-md border p-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={(e) => toggle(s.key, e.target.checked)}
                  />{' '}
                  {s.key} ({s.kind})
                </label>
                {s.kind === 'html' && (
                  <span className="text-[11px] text-muted-foreground">
                    Legal Mode: <b>{s.legalMode ? 'ON' : 'OFF'}</b>
                  </span>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Param: feedUrl / html / query…"
                  value={s.params?.feedUrl || s.params?.html || ''}
                  onChange={(e) =>
                    upsert({
                      ...s,
                      params: { ...(s.params ?? {}), feedUrl: e.target.value },
                    })
                  }
                />
                <Input
                  placeholder="Headers (Authorization/Cookie)"
                  onChange={(e) =>
                    upsert({
                      ...s,
                      headers: { ...s.headers, Authorization: e.target.value },
                    })
                  }
                />
              </div>
              <div className="text-[11px] text-muted-foreground">
                API-first is recommended. HTML adapters require <b>legalMode=true</b> and
                user-provided content or explicit permission.
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
