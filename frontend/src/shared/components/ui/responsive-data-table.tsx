import * as React from "react"
import { Icon } from "@iconify/react"
import { Button } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"
import { Card, CardContent, CardHeader } from "./card"
import { cn } from "@/shared/lib/utils"

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  className?: string
  mobileHidden?: boolean
  priority?: 'high' | 'medium' | 'low' // For responsive column hiding
}

interface ResponsiveDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  sortable?: boolean
  filterable?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
  mobileCardView?: boolean
  stickyHeader?: boolean
}

export function ResponsiveDataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  sortable = true,
  filterable = false,
  pagination,
  onRowClick,
  emptyMessage = "No data available",
  className,
  mobileCardView = true,
  stickyHeader = true
}: ResponsiveDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  const [isMobile, setIsMobile] = React.useState(false)

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data

    return data.filter(row =>
      columns.some(column => {
        const value = row[column.key]
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }, [data, searchTerm, columns])

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  const handleSort = (key: keyof T) => {
    if (!sortable) return

    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return <Icon icon="solar:sort-vertical-bold" className="size-4 opacity-50" />
    }
    return sortConfig.direction === 'asc' 
      ? <Icon icon="solar:sort-from-bottom-to-top-bold" className="size-4" />
      : <Icon icon="solar:sort-from-top-to-bottom-bold" className="size-4" />
  }

  // Get visible columns based on screen size and priority
  const visibleColumns = React.useMemo(() => {
    if (!isMobile) return columns

    return columns.filter(column => {
      if (column.mobileHidden) return false
      if (column.priority === 'high') return true
      if (column.priority === 'medium') return columns.length <= 4
      return columns.length <= 2
    })
  }, [columns, isMobile])

  const renderMobileCard = (row: T, index: number) => (
    <Card 
      key={index}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        onRowClick && "hover:bg-accent/50"
      )}
      onClick={() => onRowClick?.(row)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {columns.map(column => {
            const value = row[column.key]
            const renderedValue = column.render ? column.render(value, row) : value

            return (
              <div key={String(column.key)} className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground min-w-0 flex-1">
                  {column.label}:
                </span>
                <div className="text-sm text-foreground text-right min-w-0 flex-1 ml-2">
                  {renderedValue}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  const renderDesktopTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className={cn(
          "border-b border-border",
          stickyHeader && "sticky top-0 bg-background z-10"
        )}>
          <tr>
            {visibleColumns.map(column => (
              <th
                key={String(column.key)}
                className={cn(
                  "text-left py-3 px-4 font-medium text-muted-foreground",
                  sortable && column.sortable !== false && "cursor-pointer hover:text-foreground",
                  column.className
                )}
                onClick={() => column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {sortable && column.sortable !== false && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b border-border">
                {visibleColumns.map(column => (
                  <td key={String(column.key)} className="py-3 px-4">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={visibleColumns.length} className="py-8 px-4 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  "border-b border-border transition-colors",
                  onRowClick && "cursor-pointer hover:bg-accent/50"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {visibleColumns.map(column => {
                  const value = row[column.key]
                  const renderedValue = column.render ? column.render(value, row) : value

                  return (
                    <td key={String(column.key)} className={cn("py-3 px-4", column.className)}>
                      {renderedValue}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  const renderMobileCards = () => (
    <div className="space-y-3">
      {loading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : sortedData.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        sortedData.map((row, index) => renderMobileCard(row, index))
      )}
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {searchable && (
            <div className="relative flex-1">
              <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {filterable && (
            <Button variant="outline" size="sm" className="shrink-0">
              <Icon icon="solar:filter-bold" className="size-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      )}

      {/* Data Display */}
      <div className="rounded-lg border border-border bg-card">
        {isMobile && mobileCardView ? renderMobileCards() : renderDesktopTable()}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <Icon icon="solar:alt-arrow-left-bold" className="size-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => pagination.onPageChange(page)}
                    className="min-w-[32px]"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              <Icon icon="solar:alt-arrow-right-bold" className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile-specific info */}
      {isMobile && columns.length > visibleColumns.length && (
        <div className="text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded">
          <Icon icon="solar:info-circle-bold" className="size-4 inline mr-1" />
          Some columns are hidden on mobile. Tap rows for full details.
        </div>
      )}
    </div>
  )
}

// Example usage
export function ExampleResponsiveDataTable() {
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Active' },
  ]

  const columns: Column<typeof data[0]>[] = [
    { 
      key: 'name', 
      label: 'Name', 
      priority: 'high',
      render: (value) => <span className="font-medium">{value}</span>
    },
    { 
      key: 'email', 
      label: 'Email', 
      priority: 'medium',
      className: 'text-muted-foreground'
    },
    { 
      key: 'role', 
      label: 'Role', 
      priority: 'low',
      render: (value) => <Badge variant="secondary">{value}</Badge>
    },
    { 
      key: 'status', 
      label: 'Status', 
      priority: 'high',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
  ]

  return (
    <ResponsiveDataTable
      data={data}
      columns={columns}
      onRowClick={(row) => console.log('Clicked row:', row)}
      searchable
      sortable
    />
  )
}