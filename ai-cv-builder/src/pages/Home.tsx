import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Mail, Briefcase, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { useCommonTranslation, useCVTranslation, useJobsTranslation } from '@/hooks'

export default function HomePage() {
  const { t } = useCommonTranslation()
  const { t: tCV } = useCVTranslation()
  const { t: tJobs } = useJobsTranslation()

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            {t('app.name')}
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Create Professional CVs in Minutes
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('app.tagline')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to={ROUTES.CV_BUILDER}>
                {t('actions.getStarted')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={ROUTES.JOBS}>{tJobs('title')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-8 md:grid-cols-3">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">{tCV('title')}</h3>
          <p className="text-sm text-muted-foreground">
            {tCV('subtitle')}
          </p>
        </div>
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">{t('navigation.coverLetter')}</h3>
          <p className="text-sm text-muted-foreground">
            Generate personalized cover letters tailored to each job application.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">{tJobs('title')}</h3>
          <p className="text-sm text-muted-foreground">
            Find and apply to jobs that match your skills and experience.
          </p>
        </div>
      </section>
    </div>
  )
}
