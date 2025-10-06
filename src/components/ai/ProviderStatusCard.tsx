import { Badge } from '@/components/ui/badge'

export default function ProviderStatusCard({
  name,
  envKey,
  doc,
}: {
  name: string
  envKey: string
  doc?: string
}) {
  const ok = !!import.meta.env[envKey as any]

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">
          {envKey}
          {doc ? ` • ${doc}` : ''}
        </div>
      </div>
      <Badge variant={ok ? 'default' : 'secondary'}>{ok ? 'Ready' : 'Not configured'}</Badge>
    </div>
  )
}
