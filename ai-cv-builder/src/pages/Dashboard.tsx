import { useAuth, useToast, useCommonTranslation } from '@/hooks'
import { useCVStore, useJobStore, useProfileStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { formatDate, formatCurrency } from '@/lib/formatters'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { SAMPLE_CV } from '@/lib/mock/cv.mock'
import { calculateTotalExperience, getAllSkillsFromCV } from '@/lib/helpers/cv.helpers'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const { t } = useCommonTranslation()
  const cvs = useCVStore((state) => state.cvs)
  const savedJobs = useJobStore((state) => state.savedJobs)
  const profiles = useProfileStore((state) => state.profiles)

  // CV Data Model Test
  const totalExperience = calculateTotalExperience(SAMPLE_CV.experience)
  const allSkills = getAllSkillsFromCV(SAMPLE_CV)

  const handleTestToast = () => {
    toast.success(t('status.success'), 'This is a success message from Zustand store.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('navigation.dashboard')}</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {user?.firstName || 'Guest'}!
        </p>
      </div>

      {/* Profile Preview */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Quick view of your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileHeader user={user} onEditClick={() => navigate(ROUTES.PROFILE)} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My CVs</CardTitle>
            <CardDescription>Total CVs created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cvs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Jobs</CardTitle>
            <CardDescription>Jobs you've saved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{savedJobs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
            <CardDescription>Career profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Format Tests (i18n)</CardTitle>
          <CardDescription>Testing date and currency formatting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Date: {formatDate(new Date())}</p>
          <p>Currency (USD): {formatCurrency(12345.67, 'USD')}</p>
          <p>Currency (TRY): {formatCurrency(12345.67, 'TRY')}</p>
          <p>Status: {t('status.loading')}</p>
          <Button onClick={handleTestToast}>{t('actions.save')}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample CV Data</CardTitle>
          <CardDescription>Mock CV for testing CV data model (STEP 9)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Name:</strong> {SAMPLE_CV.firstName} {SAMPLE_CV.middleName}{' '}
            {SAMPLE_CV.lastName}
          </p>
          <p>
            <strong>Total Experience:</strong> {totalExperience} years
          </p>
          <p>
            <strong>Total Skills:</strong> {allSkills.length}
          </p>
          <p>
            <strong>Experiences:</strong> {SAMPLE_CV.experience.length}
          </p>
          <p>
            <strong>Education:</strong> {SAMPLE_CV.education.length}
          </p>
          <p>
            <strong>ATS Score:</strong> {SAMPLE_CV.atsScore}/100
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
