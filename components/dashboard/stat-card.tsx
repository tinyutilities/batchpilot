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

const colorStyles: Record<NonNullable<StatCardProps['color']>, string> = {
  indigo:
    'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  green:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber:
    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  violet:
    'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
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
          '[--card-spacing:--spacing(4)] rounded-2xl border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900',
          className
        )}
      >
        <CardContent className="flex min-h-18 items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
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