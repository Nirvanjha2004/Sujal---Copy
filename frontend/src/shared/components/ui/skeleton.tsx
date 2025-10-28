import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "bg-muted",
        shimmer: "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer",
        pulse: "animate-pulse-subtle bg-muted",
      },
      size: {
        sm: "h-3",
        default: "h-4",
        lg: "h-6",
        xl: "h-8",
      },
    },
    defaultVariants: {
      variant: "shimmer",
      size: "default",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({
  className,
  variant,
  size,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// Predefined skeleton components for common use cases
function SkeletonText({ 
  lines = 1, 
  className,
  ...props 
}: { lines?: number } & SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "w-full",
            i === lines - 1 && lines > 1 && "w-3/4" // Last line shorter
          )}
          {...props}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ 
  size = "default",
  className,
  ...props 
}: { size?: "sm" | "default" | "lg" } & Omit<SkeletonProps, 'size'>) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
  }
  
  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
      {...props}
    />
  )
}

function SkeletonButton({ 
  size = "default",
  className,
  ...props 
}: { size?: "sm" | "default" | "lg" } & Omit<SkeletonProps, 'size'>) {
  const sizeClasses = {
    sm: "h-8 w-20",
    default: "h-10 w-24",
    lg: "h-12 w-28",
  }
  
  return (
    <Skeleton
      className={cn("rounded-md", sizeClasses[size], className)}
      {...props}
    />
  )
}

function SkeletonCard({ 
  className,
  children,
  ...props 
}: SkeletonProps & { children?: React.ReactNode }) {
  return (
    <div className={cn("rounded-lg border border-border p-6 space-y-4", className)}>
      {children || (
        <>
          <div className="flex items-center space-x-4">
            <SkeletonAvatar />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <SkeletonText lines={3} />
        </>
      )}
    </div>
  )
}

function SkeletonTable({ 
  rows = 5,
  columns = 4,
  className,
  ...props 
}: { rows?: number; columns?: number } & SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className={cn(
                "h-4 flex-1",
                colIndex === 0 && "w-1/4", // First column smaller
                colIndex === columns - 1 && "w-1/6" // Last column smaller
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard, 
  SkeletonTable,
  skeletonVariants 
}