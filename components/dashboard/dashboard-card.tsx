import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        '[--card-spacing:--spacing(5)] rounded-2xl border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        {action && (
          <div className="flex shrink-0 items-center">{action}</div>
        )}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}