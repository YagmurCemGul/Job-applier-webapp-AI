import { Mail, Phone, MapPin, Linkedin, Github, Globe, MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User } from '@/types/user.types'

interface ProfileHeaderProps {
  user: User
  onEditClick?: () => void
}

export function ProfileHeader({ user, onEditClick }: ProfileHeaderProps) {
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {/* Avatar */}
      <Avatar className="h-24 w-24">
        <AvatarImage src={user.profilePhoto} alt={`${user.firstName} ${user.lastName}`} />
        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 space-y-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">
              {user.firstName} {user.middleName} {user.lastName}
            </h2>
            {!user.emailVerified && (
              <Badge variant="outline" className="text-yellow-600">
                Email not verified
              </Badge>
            )}
          </div>
          {user.bio && <p className="mt-2 text-muted-foreground">{user.bio}</p>}
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {user.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
          )}
          {user.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{user.phoneNumber}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {(user.linkedinUrl || user.githubUrl || user.portfolioUrl || user.whatsappUrl) && (
          <div className="flex flex-wrap gap-2">
            {user.linkedinUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            )}
            {user.githubUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </Button>
            )}
            {user.portfolioUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" />
                  Portfolio
                </a>
              </Button>
            )}
            {user.whatsappUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={user.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        )}

        {onEditClick && (
          <Button onClick={onEditClick} variant="outline">
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  )
}