import * as React from "react"
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonButton, SkeletonCard } from "./skeleton"
import { Card, CardContent, CardHeader } from "./card"
import { cn } from "@/shared/lib/utils"

// Dashboard specific skeletons
export function DashboardStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardActivitySkeleton({ count = 5 }: { count?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <SkeletonAvatar size="sm" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function DashboardWelcomeSkeleton() {
  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex space-x-3">
              <SkeletonButton />
              <SkeletonButton />
            </div>
          </div>
          <SkeletonAvatar size="lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// Property specific skeletons
export function PropertyCardSkeleton({ variant = "list" }: { variant?: "list" | "grid" | "compact" }) {
  if (variant === "grid") {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="aspect-[4/3] w-full" />
        <CardContent className="p-5 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-6 w-24" />
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden">
        <div className="flex">
          <Skeleton className="w-20 h-16 flex-shrink-0" />
          <CardContent className="flex-1 p-3 space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </div>
      </Card>
    )
  }

  // List variant (default)
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <Skeleton className="lg:w-80 h-56 lg:h-48 flex-shrink-0" />
        <CardContent className="flex-1 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex-1 space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <SkeletonText lines={3} />
            </div>
            <div className="lg:text-right space-y-3 lg:min-w-[200px]">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-2">
                <div className="flex lg:justify-end space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-24 lg:ml-auto" />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex space-x-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function PropertyListSkeleton({ 
  count = 6, 
  variant = "list" 
}: { 
  count?: number; 
  variant?: "list" | "grid" | "compact" 
}) {
  const gridClasses = {
    list: "space-y-6",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    compact: "space-y-3"
  }

  return (
    <div className={gridClasses[variant]}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="animate-fade-in" 
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <PropertyCardSkeleton variant={variant} />
        </div>
      ))}
    </div>
  )
}

// Form specific skeletons
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-3 pt-4">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  )
}

// Table specific skeletons
export function DataTableSkeleton({ 
  rows = 10, 
  columns = 5 
}: { 
  rows?: number; 
  columns?: number 
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header row */}
          <div className="flex space-x-4 pb-2 border-b">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-4 flex-1" />
            ))}
          </div>
          
          {/* Data rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div 
              key={`row-${rowIndex}`} 
              className="flex space-x-4 animate-fade-in" 
              style={{ animationDelay: `${rowIndex * 50}ms` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  className="h-4 flex-1"
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <Skeleton className="h-4 w-32" />
          <div className="flex space-x-2">
            <SkeletonButton size="sm" />
            <SkeletonButton size="sm" />
            <SkeletonButton size="sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Profile specific skeletons
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <SkeletonAvatar size="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <SkeletonButton />
          </div>
        </CardContent>
      </Card>

      {/* Profile sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i}>
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <FormSkeleton fields={4} />
          </div>
        </SkeletonCard>
      ))}
    </div>
  )
}

// Loading spinner component
export function LoadingSpinner({ 
  size = "default",
  className 
}: { 
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        className={cn("animate-spin text-primary", sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

// Progress indicator
export function ProgressIndicator({ 
  progress,
  className,
  showPercentage = false
}: { 
  progress: number;
  className?: string;
  showPercentage?: boolean;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-muted-foreground text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}