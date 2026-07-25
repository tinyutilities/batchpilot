import * as React from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Separator />
      </div>

      <div className="flex flex-col gap-5">{children}</div>
    </div>
  )
}