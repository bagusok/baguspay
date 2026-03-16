import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { cn } from '@repo/ui/lib/utils'
import * as React from 'react'

interface UnderlinedInputProps extends React.ComponentProps<typeof Input> {
  label: React.ReactNode
  error?: string
  containerClassName?: string
}

export const UnderlinedInput = React.forwardRef<HTMLInputElement, UnderlinedInputProps>(
  ({ className, label, error, containerClassName, id, ...props }, ref) => {
    return (
      <div className={cn('w-full group/field', containerClassName)}>
        <Label
          htmlFor={id}
          className="text-xs font-semibold text-muted-foreground tracking-wider block mb-1 group-focus-within/field:text-primary transition-colors"
        >
          {label}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            className={cn(
              'w-full h-10 rounded-none rounded-t-xs px-0 border-0 border-b border-border bg-transparent focus-visible:ring-0 focus-visible:border-primary focus-visible:border-b-2 transition-all shadow-none placeholder:text-muted-foreground/30',
              error && 'border-destructive focus-visible:border-destructive',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-destructive text-xs mt-1.5 font-medium flex items-center gap-1 animate-in slide-in-from-top-1 fade-in">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive mb-0.5" />
            {error}
          </p>
        )}
      </div>
    )
  },
)
UnderlinedInput.displayName = 'UnderlinedInput'

interface Option {
  label: string
  value: string
}

interface UnderlinedSelectProps {
  label: React.ReactNode
  value: string
  onValueChange: (value: string) => void
  options: Option[]
  placeholder?: string
  error?: string
  disabled?: boolean
  containerClassName?: string
  id?: string
}

export function UnderlinedSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
  disabled,
  containerClassName,
  id,
}: UnderlinedSelectProps) {
  return (
    <div className={cn('w-full group/field', containerClassName)}>
      <Label
        htmlFor={id}
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1 group-focus-within/field:text-primary transition-colors"
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className={cn(
            'w-full h-10 px-0 rounded-none rounded-t-xs border-0 border-b border-border bg-transparent focus:ring-0 focus:border-primary focus:border-b-2 transition-all data-[state=open]:border-primary shadow-none',
            error && 'border-destructive focus:border-destructive',
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-destructive text-xs mt-1.5 font-medium flex items-center gap-1 animate-in slide-in-from-top-1 fade-in">
          <span className="inline-block w-1 h-1 rounded-full bg-destructive mb-0.5" />
          {error}
        </p>
      )}
    </div>
  )
}
