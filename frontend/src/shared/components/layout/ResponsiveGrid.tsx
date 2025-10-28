import * as React from "react"
import { cn } from "@/shared/lib/utils"

interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
    wide?: number
  }
  gap?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  className?: string
  autoFit?: boolean
  minItemWidth?: string
  maxColumns?: number
}

interface GridItemProps {
  children: React.ReactNode
  span?: {
    mobile?: number
    tablet?: number
    desktop?: number
    wide?: number
  }
  className?: string
}

export function ResponsiveGrid({
  children,
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4
  },
  gap = {
    mobile: "1rem",
    tablet: "1.5rem",
    desktop: "2rem"
  },
  className,
  autoFit = false,
  minItemWidth = "280px",
  maxColumns = 6
}: ResponsiveGridProps) {
  const gridStyle = React.useMemo(() => {
    if (autoFit) {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
        gap: gap.mobile,
        '--grid-gap-tablet': gap.tablet,
        '--grid-gap-desktop': gap.desktop,
      } as React.CSSProperties
    }

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns.mobile}, 1fr)`,
      gap: gap.mobile,
      '--grid-columns-tablet': columns.tablet,
      '--grid-columns-desktop': columns.desktop,
      '--grid-columns-wide': columns.wide,
      '--grid-gap-tablet': gap.tablet,
      '--grid-gap-desktop': gap.desktop,
    } as React.CSSProperties
  }, [columns, gap, autoFit, minItemWidth])

  return (
    <div
      className={cn(
        "responsive-grid",
        autoFit && "responsive-grid-auto-fit",
        className
      )}
      style={gridStyle}
    >
      {children}
    </div>
  )
}

export function GridItem({
  children,
  span = {
    mobile: 1,
    tablet: 1,
    desktop: 1,
    wide: 1
  },
  className
}: GridItemProps) {
  const itemStyle = React.useMemo(() => ({
    gridColumn: `span ${span.mobile}`,
    '--grid-span-tablet': span.tablet,
    '--grid-span-desktop': span.desktop,
    '--grid-span-wide': span.wide,
  } as React.CSSProperties), [span])

  return (
    <div
      className={cn("responsive-grid-item", className)}
      style={itemStyle}
    >
      {children}
    </div>
  )
}

// Masonry Grid for Pinterest-like layouts
interface MasonryGridProps {
  children: React.ReactNode
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: string
  className?: string
}

export function MasonryGrid({
  children,
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  gap = "1rem",
  className
}: MasonryGridProps) {
  const [columnElements, setColumnElements] = React.useState<React.ReactNode[][]>([])
  const [currentColumns, setCurrentColumns] = React.useState(columns.mobile || 1)

  // Detect screen size and update columns
  React.useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width >= 1024) {
        setCurrentColumns(columns.desktop || 3)
      } else if (width >= 768) {
        setCurrentColumns(columns.tablet || 2)
      } else {
        setCurrentColumns(columns.mobile || 1)
      }
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [columns])

  // Distribute children across columns
  React.useEffect(() => {
    const childArray = React.Children.toArray(children)
    const newColumns: React.ReactNode[][] = Array.from({ length: currentColumns }, () => [])

    childArray.forEach((child, index) => {
      const columnIndex = index % currentColumns
      newColumns[columnIndex].push(child)
    })

    setColumnElements(newColumns)
  }, [children, currentColumns])

  return (
    <div
      className={cn("flex", className)}
      style={{ gap }}
    >
      {columnElements.map((column, index) => (
        <div
          key={index}
          className="flex-1 flex flex-col"
          style={{ gap }}
        >
          {column}
        </div>
      ))}
    </div>
  )
}

// Advanced Grid with breakpoint-specific layouts
interface AdvancedGridProps {
  children: React.ReactNode
  layout: {
    mobile: string
    tablet?: string
    desktop?: string
    wide?: string
  }
  gap?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  className?: string
}

export function AdvancedGrid({
  children,
  layout,
  gap = {
    mobile: "1rem",
    tablet: "1.5rem",
    desktop: "2rem"
  },
  className
}: AdvancedGridProps) {
  const gridStyle = React.useMemo(() => ({
    display: 'grid',
    gridTemplateAreas: `"${layout.mobile}"`,
    gap: gap.mobile,
    '--grid-areas-tablet': layout.tablet ? `"${layout.tablet}"` : undefined,
    '--grid-areas-desktop': layout.desktop ? `"${layout.desktop}"` : undefined,
    '--grid-areas-wide': layout.wide ? `"${layout.wide}"` : undefined,
    '--grid-gap-tablet': gap.tablet,
    '--grid-gap-desktop': gap.desktop,
  } as React.CSSProperties), [layout, gap])

  return (
    <div
      className={cn("advanced-grid", className)}
      style={gridStyle}
    >
      {children}
    </div>
  )
}

interface GridAreaProps {
  children: React.ReactNode
  area: string
  className?: string
}

export function GridArea({ children, area, className }: GridAreaProps) {
  return (
    <div
      className={cn("grid-area", className)}
      style={{ gridArea: area }}
    >
      {children}
    </div>
  )
}

// Responsive Container with max-width constraints
interface ResponsiveContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  className?: string
}

export function ResponsiveContainer({
  children,
  size = 'xl',
  padding = {
    mobile: "1rem",
    tablet: "1.5rem",
    desktop: "2rem"
  },
  className
}: ResponsiveContainerProps) {
  const maxWidths = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%'
  }

  const containerStyle = React.useMemo(() => ({
    maxWidth: maxWidths[size],
    margin: '0 auto',
    padding: padding.mobile,
    '--container-padding-tablet': padding.tablet,
    '--container-padding-desktop': padding.desktop,
  } as React.CSSProperties), [size, padding])

  return (
    <div
      className={cn("responsive-container", className)}
      style={containerStyle}
    >
      {children}
    </div>
  )
}

// Flexible Layout with sidebar
interface FlexLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  sidebarPosition?: 'left' | 'right'
  sidebarWidth?: {
    tablet?: string
    desktop?: string
  }
  gap?: string
  className?: string
  collapsible?: boolean
}

export function FlexLayout({
  children,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = {
    tablet: '250px',
    desktop: '300px'
  },
  gap = '2rem',
  className,
  collapsible = false
}: FlexLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  const layoutStyle = React.useMemo(() => ({
    display: 'flex',
    flexDirection: sidebarPosition === 'left' ? 'row' : 'row-reverse',
    gap,
    '--sidebar-width-tablet': sidebarWidth.tablet,
    '--sidebar-width-desktop': sidebarWidth.desktop,
  } as React.CSSProperties), [sidebarPosition, gap, sidebarWidth])

  return (
    <div className={cn("flex-layout", className)} style={layoutStyle}>
      {sidebar && (
        <aside
          className={cn(
            "flex-layout-sidebar",
            sidebarCollapsed && "collapsed",
            collapsible && "collapsible"
          )}
          style={{
            width: sidebarCollapsed ? '60px' : sidebarWidth.desktop,
            minWidth: sidebarCollapsed ? '60px' : sidebarWidth.tablet,
          }}
        >
          {collapsible && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="sidebar-toggle"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          )}
          {sidebar}
        </aside>
      )}
      <main className="flex-layout-main flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}