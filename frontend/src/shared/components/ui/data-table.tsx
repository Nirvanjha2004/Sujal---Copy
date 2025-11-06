import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { cn } from "@/shared/lib/utils";
import { useTableAccessibility, useScreenReader } from "@/shared/hooks/useAccessibility";

// Types
export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  key: string;
  value: string;
  operator?: 'contains' | 'equals' | 'startsWith' | 'endsWith';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  showSizeSelector?: boolean;
  pageSizeOptions?: number[];
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  sortConfig?: SortConfig;
  onSort?: (config: SortConfig) => void;
  filterConfig?: FilterConfig[];
  onFilter?: (filters: FilterConfig[]) => void;
  pagination?: PaginationConfig;
  onPaginationChange?: (page: number, pageSize: number) => void;
  selection?: {
    selectedRows: Set<string | number>;
    onSelectionChange: (selected: Set<string | number>) => void;
    getRowId: (row: T) => string | number;
  };
  emptyState?: React.ReactNode;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
}

// Enhanced Data Table Component
export function DataTable<T>({
  data,
  columns,
  loading = false,
  sortConfig,
  onSort,
  filterConfig = [],
  onFilter,
  pagination,
  onPaginationChange,
  selection,
  emptyState,
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const [localFilters, setLocalFilters] = React.useState<FilterConfig[]>(filterConfig);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const {
    tableId,
    captionId,
    getTableProps,
    getCaptionProps,
    getColumnHeaderProps,
    getRowProps,
    getCellProps
  } = useTableAccessibility();
  
  const { announce } = useScreenReader();

  // Handle sorting
  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const newDirection = 
      sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    
    onSort({ key, direction: newDirection });
    
    // Announce sort change to screen readers
    const column = columns.find(col => col.key === key);
    if (column) {
      announce(`Table sorted by ${column.header} in ${newDirection}ending order`, 'polite');
    }
  };

  // Handle filtering
  const handleFilter = (key: string, value: string) => {
    const newFilters = localFilters.filter(f => f.key !== key);
    if (value) {
      newFilters.push({ key, value, operator: 'contains' });
    }
    
    setLocalFilters(newFilters);
    onFilter?.(newFilters);
  };

  // Handle global search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement global search logic here if needed
  };

  // Handle row selection
  const handleRowSelection = (rowId: string | number, checked: boolean) => {
    if (!selection) return;
    
    const newSelected = new Set(selection.selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    
    selection.onSelectionChange(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!selection) return;
    
    const newSelected = new Set<string | number>();
    if (checked) {
      data.forEach(row => {
        newSelected.add(selection.getRowId(row));
      });
    }
    
    selection.onSelectionChange(newSelected);
    
    // Announce selection change
    const count = checked ? data.length : 0;
    announce(`${count} rows ${checked ? 'selected' : 'deselected'}`, 'polite');
  };

  // Get cell value
  const getCellValue = (row: T, column: Column<T>) => {
    if (typeof column.key === 'string' && column.key.includes('.')) {
      // Handle nested properties
      return column.key.split('.').reduce((obj: any, key) => obj?.[key], row);
    }
    return (row as any)[column.key];
  };

  // Render sort icon
  const renderSortIcon = (columnKey: string, sortable?: boolean) => {
    if (!sortable || !sortConfig) return null;
    
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <Icon 
        icon={
          direction === 'asc' 
            ? "solar:sort-vertical-bold" 
            : direction === 'desc'
            ? "solar:sort-vertical-bold"
            : "solar:sort-bold"
        }
        className={cn(
          "size-4 ml-2 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground",
          direction === 'desc' && "rotate-180"
        )}
      />
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((_, index) => (
                  <TableHead key={index}>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && data.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Filters and search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Icon 
                icon="solar:magnifer-bold" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" 
              />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {emptyState || (
              <>
                <Icon 
                  icon="solar:inbox-bold" 
                  className="size-12 text-muted-foreground mb-4" 
                />
                <h3 className="text-lg font-semibold mb-2">No data found</h3>
                <p className="text-muted-foreground">
                  There are no items to display at the moment.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isAllSelected = selection && data.length > 0 && 
    data.every(row => selection.selectedRows.has(selection.getRowId(row)));
  const isSomeSelected = selection && selection.selectedRows.size > 0 && !isAllSelected;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters and search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Icon 
              icon="solar:magnifer-bold" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" 
            />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          {/* Active filters */}
          {localFilters.length > 0 && (
            <div className="flex items-center gap-2">
              {localFilters.map((filter) => (
                <Badge 
                  key={filter.key} 
                  variant="secondary" 
                  className="gap-1"
                >
                  {filter.key}: {filter.value}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-4 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleFilter(filter.key, "")}
                  >
                    <Icon icon="solar:close-circle-bold" className="size-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Selection info */}
        {selection && selection.selectedRows.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {selection.selectedRows.size} selected
            </Badge>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table {...getTableProps()}>
          <caption {...getCaptionProps()} className="sr-only">
            Data table with {data.length} rows and {columns.length} columns
            {selection && `, ${selection.selectedRows.size} rows selected`}
          </caption>
          <TableHeader>
            <TableRow {...getRowProps()}>
              {selection && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected || false}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected || false;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border focus-visible-enhanced"
                    aria-label={`Select all ${data.length} rows`}
                  />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead 
                  key={index}
                  {...getColumnHeaderProps(
                    column.sortable || false, 
                    sortConfig?.key === column.key ? sortConfig.direction : 'none'
                  )}
                  className={cn(
                    column.sortable && "cursor-pointer hover:bg-muted/50 transition-colors focus-visible-enhanced",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key as string)}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(column.key as string);
                    }
                  }}
                  aria-label={
                    column.sortable 
                      ? `${column.header}, sortable column, currently ${
                          sortConfig?.key === column.key 
                            ? `sorted ${sortConfig.direction}ending` 
                            : 'not sorted'
                        }`
                      : column.header
                  }
                >
                  <div className="flex items-center">
                    {column.header}
                    {renderSortIcon(column.key as string, column.sortable)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              const rowId = selection?.getRowId(row);
              const isSelected = selection && rowId && selection.selectedRows.has(rowId);
              
              return (
                <TableRow
                  key={index}
                  {...getRowProps(isSelected)}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50 focus-visible-enhanced",
                    isSelected && "bg-primary/5 border-primary/20",
                    rowClassName?.(row, index)
                  )}
                  onClick={() => onRowClick?.(row, index)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(row, index);
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-label={onRowClick ? `Row ${index + 1}, click to view details` : undefined}
                >
                  {selection && (
                    <TableCell {...getCellProps()}>
                      <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={(e) => rowId && handleRowSelection(rowId, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-border focus-visible-enhanced"
                        aria-label={`Select row ${index + 1}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((column, colIndex) => {
                    const value = getCellValue(row, column);
                    const content = column.render ? column.render(value, row, index) : value;
                    
                    return (
                      <TableCell 
                        key={colIndex}
                        {...getCellProps()}
                        className={cn(
                          column.align === 'center' && "text-center",
                          column.align === 'right' && "text-right"
                        )}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          pagination={pagination}
          onPaginationChange={onPaginationChange}
        />
      )}
    </div>
  );
}

// Pagination Component
interface TablePaginationProps {
  pagination: PaginationConfig;
  onPaginationChange?: (page: number, pageSize: number) => void;
}

function TablePagination({ pagination, onPaginationChange }: TablePaginationProps) {
  const { page, pageSize, total, showSizeSelector = true, pageSizeOptions = [10, 25, 50, 100] } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPaginationChange?.(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    onPaginationChange?.(1, newPageSize);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (page > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div>
          Showing {startItem} to {endItem} of {total} results
        </div>
        
        {showSizeSelector && (
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="gap-1"
        >
          <Icon icon="solar:alt-arrow-left-bold" className="size-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <span className="px-2 py-1 text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={pageNum === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum as number)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="gap-1"
        >
          Next
          <Icon icon="solar:alt-arrow-right-bold" className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export { TablePagination };