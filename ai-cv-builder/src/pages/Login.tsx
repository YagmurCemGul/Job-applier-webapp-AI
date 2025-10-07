import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth, useAuthTranslation } from '@/hooks'
import { ROUTES } from '@/lib/constants'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithGoogle, isLoading } = useAuth()
  const { t } = useAuthTranslation()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login(formData.email, formData.password)
    if (result.success) {
      navigate(ROUTES.DASHBOARD)
    }
  }

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle()
    if (result.success) {
      navigate(ROUTES.DASHBOARD)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t('login.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('login.password')}</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                {t('login.rememberMe')}
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : t('login.submit')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t('login.orContinueWith')}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              {t('login.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}