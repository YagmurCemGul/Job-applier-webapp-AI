import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Mail,
  Briefcase,
  User,
  Settings,
  FolderOpen,
  Send,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCommonTranslation } from '@/hooks'

export function Sidebar() {
  const location = useLocation()
  const { t } = useCommonTranslation()

  const navigation = [
    {
      title: 'Main',
      items: [
        { name: t('navigation.dashboard'), href: ROUTES.DASHBOARD, icon: LayoutDashboard },
        { name: t('navigation.cvBuilder'), href: ROUTES.CV_BUILDER, icon: FileText },
        { name: t('navigation.coverLetter'), href: ROUTES.COVER_LETTER, icon: Mail },
        { name: t('navigation.jobs'), href: ROUTES.JOBS, icon: Briefcase },
        { name: t('navigation.applications'), href: ROUTES.APPLICATIONS, icon: ClipboardList },
        { name: t('navigation.outbox'), href: ROUTES.OUTBOX, icon: Send },
      ],
    },
    {
      title: 'Account',
      items: [
        { name: t('navigation.profile'), href: ROUTES.PROFILE, icon: User },
        { name: t('navigation.myDocuments'), href: '/documents', icon: FolderOpen },
        { name: t('navigation.settings'), href: ROUTES.SETTINGS, icon: Settings },
      ],
    },
  ]

  return (
    <ScrollArea className="h-full py-6">
      <div className="space-y-4 px-3">
        {navigation.map((section, idx) => (
          <div key={section.title}>
            {idx > 0 && <Separator className="my-4" />}
            <div className="space-y-1">
              <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-muted-foreground">
                {section.title}
              </h2>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
