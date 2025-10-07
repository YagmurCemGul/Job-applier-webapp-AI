import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react'
import { useCVDataStore } from '@/stores/cvData.store'
import { COUNTRY_CODES } from '@/types/cvData.types'
import { useEffect } from 'react'

const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  phoneCountryCode: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().optional(),
  whatsapp: z.string().optional(),
})

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>

export function PersonalInfoForm() {
  const { currentCV, updatePersonalInfo } = useCVDataStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: currentCV?.personalInfo.firstName || '',
      middleName: currentCV?.personalInfo.middleName || '',
      lastName: currentCV?.personalInfo.lastName || '',
      email: currentCV?.personalInfo.email || '',
      phone: currentCV?.personalInfo.phone || '',
      phoneCountryCode: currentCV?.personalInfo.phoneCountryCode || '+1',
      city: currentCV?.personalInfo.location.city || '',
      state: currentCV?.personalInfo.location.state || '',
      country: currentCV?.personalInfo.location.country || '',
      linkedin: currentCV?.personalInfo.linkedin || '',
      portfolio: currentCV?.personalInfo.portfolio || '',
      github: currentCV?.personalInfo.github || '',
      whatsapp: currentCV?.personalInfo.whatsapp || '',
    },
  })

  // Auto-save on change
  useEffect(() => {
    const subscription = watch((data) => {
      updatePersonalInfo({
        firstName: data.firstName || '',
        middleName: data.middleName,
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        phoneCountryCode: data.phoneCountryCode || '+1',
        location: {
          city: data.city,
          state: data.state,
          country: data.country,
        },
        linkedin: data.linkedin,
        portfolio: data.portfolio,
        github: data.github,
        whatsapp: data.whatsapp,
      })
    })
    return () => subscription.unsubscribe()
  }, [watch, updatePersonalInfo])

  const onSubmit = (data: PersonalInfoFormData) => {
    // Data is already auto-saved
    console.log('Form submitted:', data)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Personal Information</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="firstName">First Name*</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              {...register('middleName')}
              placeholder="Michael"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name*</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email*</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john.doe@example.com"
                className="pl-9"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone*</Label>
            <div className="flex gap-2">
              <Select
                value={watch('phoneCountryCode')}
                onValueChange={(value) => setValue('phoneCountryCode', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.code} {country.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="555-0123"
                className="flex-1"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Location Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="city"
                {...register('city')}
                placeholder="San Francisco"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              {...register('state')}
              placeholder="California"
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register('country')}
              placeholder="United States"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Links (Optional)</h4>

          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  linkedin.com/in/
                </span>
                <Input
                  id="linkedin"
                  {...register('linkedin')}
                  placeholder="johndoe"
                  className="rounded-l-none pl-2"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="github">GitHub</Label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  github.com/
                </span>
                <Input
                  id="github"
                  {...register('github')}
                  placeholder="johndoe"
                  className="rounded-l-none pl-2"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="portfolio">Portfolio Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="portfolio"
                type="url"
                {...register('portfolio')}
                placeholder="https://johndoe.com"
                className="pl-9"
              />
            </div>
            {errors.portfolio && (
              <p className="text-sm text-red-600 mt-1">{errors.portfolio.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit">Save Personal Info</Button>
        </div>
      </form>
    </Card>
  )
}
