import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  buttonText?: string
  href?: string
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  buttonText,
  href,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        '[--card-spacing:--spacing(0)] border-dashed transition-colors hover:border-primary/30',
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        {icon && (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-transform duration-300 hover:scale-105">
            {icon}
          </div>
        )}

        <div className="flex max-w-sm flex-col gap-1.5">
          <p className="text-base font-semibold text-foreground">
            {title}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {buttonText && href && (
          <Button
            asChild
            className="mt-2 transition-transform duration-200 hover:scale-[1.03]"
          >
            <Link href={href}>{buttonText}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}