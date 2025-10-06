import { forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface URLInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string
  onPrefixedChange?: (value: string) => void
}

export const URLInput = forwardRef<HTMLInputElement, URLInputProps>(
  ({ prefix, onPrefixedChange, className, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value

      // Auto-add prefix if provided and value doesn't include it
      if (prefix && value && !value.includes(prefix)) {
        value = prefix + value
      }

      if (onPrefixedChange) {
        onPrefixedChange(value)
      }

      if (onChange) {
        onChange(e)
      }
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="url"
          className={cn('pr-10', className)}
          onChange={handleChange}
          {...props}
        />
        {props.value && (
          <a
            href={props.value as string}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    )
  }
)

URLInput.displayName = 'URLInput'
