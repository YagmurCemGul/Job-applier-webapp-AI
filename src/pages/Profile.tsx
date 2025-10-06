import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Phone, MapPin, Linkedin, Github, Globe, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhoneInput } from '@/components/common/PhoneInput'
import { URLInput } from '@/components/common/URLInput'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { AIPhotoGenerator } from '@/components/profile/AIPhotoGenerator'
import { useAuth, useToast, useCommonTranslation } from '@/hooks'
import { userService } from '@/services/user.service'
import { userProfileSchema, type UserProfileFormData } from '@/lib/validations/user.validation'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const { t } = useCommonTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      phoneCountryCode: '',
      bio: '',
      location: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      whatsappUrl: '',
    },
  })

  // Load user data
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        phoneCountryCode: user.phoneCountryCode || '',
        bio: user.bio || '',
        location: user.location || '',
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || '',
        portfolioUrl: user.portfolioUrl || '',
        whatsappUrl: user.whatsappUrl || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: UserProfileFormData) => {
    try {
      if (!user?.id) {
        toast.error('Error', 'User not found')
        return
      }

      // Format URLs
      const formattedData = {
        ...data,
        linkedinUrl: data.linkedinUrl ? userService.formatLinkedInURL(data.linkedinUrl) : undefined,
        githubUrl: data.githubUrl ? userService.formatGitHubURL(data.githubUrl) : undefined,
        whatsappUrl: data.phoneNumber ? userService.formatWhatsAppURL(data.phoneNumber) : undefined,
      }

      await userService.updateUserProfile(user.id, formattedData)

      // Update local user state
      updateUser(formattedData)

      toast.success(t('status.success'), 'Profile updated successfully')
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error('Error', error.message || 'Failed to update profile')
    }
  }

  const phoneNumber = watch('phoneNumber')
  const bioLength = watch('bio')?.length || 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('user.profile')}</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your personal information and social links
        </p>
      </div>

      {/* Avatar Upload Section */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>Upload or change your profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AvatarUpload
              userId={user.id}
              currentAvatar={user.profilePhoto}
              firstName={user.firstName}
              lastName={user.lastName}
            />
            <AIPhotoGenerator userId={user.id} />
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" {...register('middleName')} />
                {errors.middleName && (
                  <p className="text-sm text-destructive">{errors.middleName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                rows={4}
                {...register('bio')}
              />
              <p className="text-xs text-muted-foreground">{bioLength}/500 characters</p>
              {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="mr-1 inline h-4 w-4" />
                Location
              </Label>
              <Input id="location" placeholder="City, Country" {...register('location')} />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How can people reach you?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="mr-1 inline h-4 w-4" />
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                disabled
                {...register('email')}
                className="disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here. Go to Settings to update.
              </p>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                <Phone className="mr-1 inline h-4 w-4" />
                Phone Number
              </Label>
              <PhoneInput
                value={phoneNumber}
                onChange={(value) => setValue('phoneNumber', value || '')}
                placeholder="Enter phone number"
                defaultCountry="US"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Connect your professional profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">
                <Linkedin className="mr-1 inline h-4 w-4" />
                LinkedIn
              </Label>
              <URLInput
                id="linkedinUrl"
                placeholder="linkedin.com/in/yourprofile or just username"
                {...register('linkedinUrl')}
              />
              <p className="text-xs text-muted-foreground">Enter full URL or just your username</p>
              {errors.linkedinUrl && (
                <p className="text-sm text-destructive">{errors.linkedinUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">
                <Github className="mr-1 inline h-4 w-4" />
                GitHub
              </Label>
              <URLInput
                id="githubUrl"
                placeholder="github.com/yourusername or just username"
                {...register('githubUrl')}
              />
              <p className="text-xs text-muted-foreground">Enter full URL or just your username</p>
              {errors.githubUrl && (
                <p className="text-sm text-destructive">{errors.githubUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">
                <Globe className="mr-1 inline h-4 w-4" />
                Portfolio Website
              </Label>
              <URLInput
                id="portfolioUrl"
                placeholder="https://yourwebsite.com"
                {...register('portfolioUrl')}
              />
              {errors.portfolioUrl && (
                <p className="text-sm text-destructive">{errors.portfolioUrl.message}</p>
              )}
            </div>

            {phoneNumber && (
              <div className="space-y-2">
                <Label htmlFor="whatsappUrl">
                  <MessageCircle className="mr-1 inline h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsappUrl"
                  value={userService.formatWhatsAppURL(phoneNumber)}
                  disabled
                  className="disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-generated from your phone number
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('actions.save')} Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
