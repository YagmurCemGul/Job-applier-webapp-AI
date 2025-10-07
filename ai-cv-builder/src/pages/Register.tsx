import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'

const signupSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, signInWithGithub, loading, error } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signUp({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      })
      navigate('/dashboard')
    } catch (error) {
      // Error is already set in the store
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (error) {
      // Error is already set in the store
    }
  }

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub()
      navigate('/dashboard')
    } catch (error) {
      // Error is already set in the store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up to start building your CV</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Social Signup */}
        <div className="space-y-3 mb-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FcGoogle size={20} />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGithubSignIn}
            disabled={loading}
          >
            <FaGithub size={20} />
            Continue with GitHub
          </Button>
        </div>

        <div className="relative mb-6">
          <Separator />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
            Or sign up with email
          </span>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="displayName"
                {...register('displayName')}
                placeholder="John Doe"
                className="pl-9"
                disabled={loading}
              />
            </div>
            {errors.displayName && (
              <p className="text-sm text-red-600 mt-1">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className="pl-9"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="pl-9"
                disabled={loading}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="pl-9"
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
