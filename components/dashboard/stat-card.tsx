'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: 'indigo' | 'green' | 'amber' | 'rose' | 'blue' | 'violet'
  description?: string
  className?: string
}

// Mapped onto the coastal palette's semantic tokens rather than raw
// Tailwind hues, so these stay in sync with theme changes automatically.
const colorStyles: Record<NonNullable<StatCardProps['color']>, string> = {
  indigo: 'bg-primary-soft text-primary',
  green: 'bg-success-soft text-success',
  amber: 'bg-warning-soft text-warning',
  rose: 'bg-danger-soft text-destructive',
  blue: 'bg-secondary-soft text-secondary-foreground',
  violet: 'bg-accent-soft text-accent',
}

export function StatCard({
  title,
  value,
  icon,
  color = 'indigo',
  description,
  className,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className={cn(
          '[--card-spacing:--spacing(4)] rounded-2xl border-border bg-card shadow-raised transition-shadow hover:shadow-elevated',
          className
        )}
      >
        <CardContent className="flex min-h-18 items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>

          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              colorStyles[color]
            )}
          >
            {icon}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}